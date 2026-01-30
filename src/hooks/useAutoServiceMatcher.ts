import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface ServiceRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  reason: string;
  confidence: number;
  suggestedBudget?: { min: number; max: number };
  urgency: 'low' | 'medium' | 'high';
  actionLabel: string;
}

export interface AutoMatcherResult {
  recommendations: ServiceRecommendation[];
  context: {
    totalPastRequests: number;
    profileComplete: boolean;
  };
}

export function useAutoServiceMatcher() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchRecommendations = useCallback(async (limit = 5, refresh = false) => {
    if (!user) {
      setRecommendations([]);
      return [];
    }

    // Skip if recently fetched (within 5 minutes) unless refresh is requested
    if (!refresh && lastFetched && Date.now() - lastFetched.getTime() < 5 * 60 * 1000) {
      return recommendations;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error: invokeError } = await supabase.functions.invoke('auto-service-matcher', {
        body: { limit, refresh },
      });

      if (invokeError) throw invokeError;

      if (data?.success && data?.recommendations) {
        setRecommendations(data.recommendations);
        setLastFetched(new Date());
        return data.recommendations;
      }

      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      console.error('[useAutoServiceMatcher] Error:', message);
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, recommendations, lastFetched]);

  // Map recommendation categories to database enum values
  const mapCategoryToEnum = (category: string): 'private_aviation' | 'yacht_charter' | 'real_estate' | 'collectibles' | 'events_access' | 'security' | 'dining' | 'travel' | 'wellness' | 'shopping' | 'chauffeur' => {
    const categoryMap: Record<string, 'private_aviation' | 'yacht_charter' | 'real_estate' | 'collectibles' | 'events_access' | 'security' | 'dining' | 'travel' | 'wellness' | 'shopping' | 'chauffeur'> = {
      private_aviation: 'private_aviation',
      yacht: 'yacht_charter',
      real_estate: 'real_estate',
      collectibles: 'collectibles',
      events: 'events_access',
      security: 'security',
      dining: 'dining',
      travel: 'travel',
      wellness: 'wellness',
      automotive: 'chauffeur',
      shopping: 'shopping',
    };
    return categoryMap[category] || 'travel';
  };

  const createServiceRequest = useCallback(async (recommendation: ServiceRecommendation) => {
    if (!user) {
      toast.error('Please sign in to request services');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          client_id: user.id,
          category: mapCategoryToEnum(recommendation.category),
          title: recommendation.title,
          description: `${recommendation.description}\n\nAuto-matched recommendation.`,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Service request created successfully');
      
      // Refresh recommendations after creating a request
      fetchRecommendations(5, true);
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create service request';
      console.error('[useAutoServiceMatcher] Create request error:', message);
      toast.error(message);
      return null;
    }
  }, [user, fetchRecommendations]);

  const dismissRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
  }, []);

  // Auto-fetch on mount when user is authenticated
  useEffect(() => {
    if (user && recommendations.length === 0) {
      fetchRecommendations();
    }
  }, [user]);

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    createServiceRequest,
    dismissRecommendation,
    lastFetched,
  };
}
