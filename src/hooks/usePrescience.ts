import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LifestyleOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  opportunity_type: 'time_sensitive' | 'calendar_match' | 'preference_match' | 'serendipity';
  match_score: number;
  match_reasons: string[];
  location?: string;
  estimated_cost?: number;
  currency?: string;
  status: 'pending' | 'viewed' | 'approved' | 'declined' | 'expired' | 'booked';
  priority: number;
  available_until?: string;
  created_at: string;
}

export interface PreferenceDNA {
  adventure_score: number;
  luxury_threshold: number;
  spontaneity_score: number;
  privacy_preference: number;
  social_preference: number;
  preferred_destinations: string[];
  preferred_cuisines: string[];
  preferred_experiences: string[];
  confidence_score: number;
  data_points_analyzed: number;
}

export interface PreferenceSignal {
  signal_type: 'booking' | 'inquiry' | 'view' | 'rating' | 'rejection';
  category: string;
  signal_data: Record<string, unknown>;
  sentiment_score?: number;
}

export function usePrescience() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<LifestyleOpportunity[]>([]);
  const [preferenceDNA, setPreferenceDNA] = useState<PreferenceDNA | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch pending opportunities
  const fetchOpportunities = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lifestyle_opportunities')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'viewed'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion for JSONB fields
      const typedData = (data || []).map(opp => ({
        ...opp,
        match_reasons: (opp.match_reasons as string[]) || [],
      })) as LifestyleOpportunity[];
      
      setOpportunities(typedData);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    }
  }, [user]);

  // Fetch preference DNA
  const fetchPreferenceDNA = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('member_preference_dna')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setPreferenceDNA({
          adventure_score: data.adventure_score || 50,
          luxury_threshold: data.luxury_threshold || 70,
          spontaneity_score: data.spontaneity_score || 50,
          privacy_preference: data.privacy_preference || 80,
          social_preference: data.social_preference || 50,
          preferred_destinations: (data.preferred_destinations as string[]) || [],
          preferred_cuisines: (data.preferred_cuisines as string[]) || [],
          preferred_experiences: (data.preferred_experiences as string[]) || [],
          confidence_score: data.confidence_score || 0,
          data_points_analyzed: data.data_points_analyzed || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch preference DNA:', error);
    }
  }, [user]);

  // Generate new opportunities
  const generateOpportunities = useCallback(async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prescience-engine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'generate' }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate opportunities');
      }

      const result = await response.json();
      
      toast({
        title: "Prescience Updated",
        description: `${result.count} new opportunities curated for you.`,
      });

      await fetchOpportunities();
    } catch (error) {
      console.error('Failed to generate opportunities:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [user, toast, fetchOpportunities]);

  // Respond to an opportunity
  const respondToOpportunity = useCallback(async (
    opportunityId: string, 
    response: 'approved' | 'declined',
    feedback?: string
  ) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prescience-engine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            action: 'respond',
            opportunity_id: opportunityId,
            response,
            feedback,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to respond');
      }

      const result = await res.json();

      toast({
        title: response === 'approved' ? "Excellent Choice" : "Noted",
        description: result.message,
      });

      // Remove from local state
      setOpportunities(prev => prev.filter(o => o.id !== opportunityId));
    } catch (error) {
      console.error('Failed to respond to opportunity:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Record a preference signal (for learning)
  const recordSignal = useCallback(async (signal: PreferenceSignal) => {
    if (!user) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prescience-engine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'learn', signal }),
        }
      );
    } catch (error) {
      console.error('Failed to record signal:', error);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchOpportunities();
      fetchPreferenceDNA();
    }
  }, [user, fetchOpportunities, fetchPreferenceDNA]);

  return {
    opportunities,
    preferenceDNA,
    isLoading,
    isGenerating,
    generateOpportunities,
    respondToOpportunity,
    recordSignal,
    refreshOpportunities: fetchOpportunities,
    refreshDNA: fetchPreferenceDNA,
  };
}
