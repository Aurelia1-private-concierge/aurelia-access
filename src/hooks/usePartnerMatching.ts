import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PartnerMatch {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  website: string | null;
  category: string;
  subcategory: string | null;
  coverage_regions: string[] | null;
  description: string | null;
  status: string;
  priority: string | null;
  match_score: number;
  match_reasons: string[];
}

export interface PartnerSearchCriteria {
  category?: string;
  regions?: string[];
  minScore?: number;
  keywords?: string[];
  excludeContacted?: boolean;
  limit?: number;
}

export interface DiscoverySource {
  name: string;
  type: 'directory' | 'network' | 'referral' | 'ai_suggested';
  url?: string;
}

const PARTNER_CATEGORIES = [
  'aviation',
  'yacht',
  'hospitality',
  'dining',
  'events',
  'security',
  'real_estate',
  'automotive',
  'wellness',
  'art_collectibles',
] as const;

const DISCOVERY_SOURCES: DiscoverySource[] = [
  { name: 'Industry Directories', type: 'directory' },
  { name: 'Professional Networks', type: 'network' },
  { name: 'Client Referrals', type: 'referral' },
  { name: 'AI Discovery', type: 'ai_suggested' },
];

export function usePartnerMatching() {
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<PartnerMatch[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const searchPartners = useCallback(async (criteria: PartnerSearchCriteria) => {
    setIsSearching(true);
    try {
      let query = supabase
        .from('partner_prospects')
        .select('*')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (criteria.category) {
        query = query.eq('category', criteria.category);
      }

      if (criteria.regions && criteria.regions.length > 0) {
        query = query.overlaps('coverage_regions', criteria.regions);
      }

      if (criteria.excludeContacted) {
        query = query.is('last_contacted_at', null);
      }

      if (criteria.limit) {
        query = query.limit(criteria.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate match scores
      const scoredMatches: PartnerMatch[] = (data || []).map((prospect) => {
        let score = 50; // Base score
        const reasons: string[] = [];

        // Priority scoring
        if (prospect.priority === 'high') {
          score += 20;
          reasons.push('High priority prospect');
        } else if (prospect.priority === 'medium') {
          score += 10;
          reasons.push('Medium priority');
        }

        // Category match
        if (criteria.category && prospect.category === criteria.category) {
          score += 15;
          reasons.push('Category match');
        }

        // Region coverage
        if (criteria.regions && prospect.coverage_regions) {
          const regionMatches = criteria.regions.filter((r) =>
            prospect.coverage_regions?.includes(r)
          ).length;
          if (regionMatches > 0) {
            score += regionMatches * 5;
            reasons.push(`Covers ${regionMatches} target region(s)`);
          }
        }

        // Keyword matching in description
        if (criteria.keywords && prospect.description) {
          const descLower = prospect.description.toLowerCase();
          const keywordMatches = criteria.keywords.filter((k) =>
            descLower.includes(k.toLowerCase())
          ).length;
          if (keywordMatches > 0) {
            score += keywordMatches * 3;
            reasons.push(`${keywordMatches} keyword match(es)`);
          }
        }

        // Completeness bonus
        if (prospect.email && prospect.website) {
          score += 10;
          reasons.push('Complete contact info');
        }

        // Status bonus
        if (prospect.status === 'qualified') {
          score += 15;
          reasons.push('Pre-qualified');
        } else if (prospect.status === 'contacted') {
          score += 5;
          reasons.push('Previously contacted');
        }

        return {
          ...prospect,
          match_score: Math.min(score, 100),
          match_reasons: reasons,
        };
      });

      // Filter by minimum score and sort
      const filteredMatches = scoredMatches
        .filter((m) => m.match_score >= (criteria.minScore || 0))
        .sort((a, b) => b.match_score - a.match_score);

      setMatches(filteredMatches);
      return filteredMatches;
    } catch (error) {
      console.error('Error searching partners:', error);
      toast.error('Failed to search partners');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const generateAISuggestions = useCallback(async (
    requirements: string,
    options?: { regions?: string[]; category?: string }
  ) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-partner-discovery', {
        body: { 
          requirements,
          regions: options?.regions,
          category: options?.category
        },
      });

      if (error) throw error;

      if (data?.success === false) {
        toast.error(data.error || 'Discovery failed');
        return [];
      }

      if (data?.suggestions) {
        const message = data.message || `Found ${data.suggestions.length} potential partners`;
        toast.success(message);
        return data.suggestions.map((s: any) => ({
          company_name: s.company_name,
          category: s.category,
          subcategory: s.subcategory,
          description: s.description,
          website: s.website,
          coverage_regions: s.coverage_regions,
          priority: s.priority,
          match_score: s.priority === 'high' ? 85 : s.priority === 'medium' ? 70 : 55,
          match_reasons: [s.match_reason]
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Error generating AI suggestions:', error);
      if (error?.message?.includes('429') || error?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else if (error?.message?.includes('402') || error?.status === 402) {
        toast.error('AI credits depleted. Please add credits to continue.');
      } else {
        toast.error('Failed to discover partners');
      }
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const addProspect = useCallback(async (prospect: Partial<PartnerMatch>) => {
    try {
      const { data, error } = await supabase
        .from('partner_prospects')
        .insert({
          company_name: prospect.company_name || 'Unknown',
          category: prospect.category || 'hospitality',
          status: 'new',
          priority: prospect.priority || 'medium',
          contact_name: prospect.contact_name,
          email: prospect.email,
          website: prospect.website,
          description: prospect.description,
          coverage_regions: prospect.coverage_regions,
          subcategory: prospect.subcategory,
          source: 'ai_discovery',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Partner prospect added');
      return data;
    } catch (error) {
      console.error('Error adding prospect:', error);
      toast.error('Failed to add prospect');
      return null;
    }
  }, []);

  const updateProspectStatus = useCallback(async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('partner_prospects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status updated');
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      return false;
    }
  }, []);

  return {
    matches,
    isSearching,
    isGenerating,
    searchPartners,
    generateAISuggestions,
    addProspect,
    updateProspectStatus,
    categories: PARTNER_CATEGORIES,
    discoverySources: DISCOVERY_SOURCES,
  };
}
