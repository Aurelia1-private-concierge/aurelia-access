import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AISpecialist {
  id: string;
  name: string;
  description: string | null;
  capabilities: string[];
  specializations: string[];
  model: string;
  system_prompt: string | null;
  is_active: boolean;
  avg_response_time_ms: number | null;
  total_queries: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AIQueryLog {
  id: string;
  specialist_id: string | null;
  user_id: string | null;
  query_type: string;
  query_text: string;
  context: Record<string, unknown>;
  response_text: string | null;
  tokens_used: number | null;
  response_time_ms: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface AIInsight {
  id: string;
  insight_type: string;
  category: string;
  title: string;
  description: string;
  data: Record<string, unknown>;
  severity: string;
  is_read: boolean;
  is_actionable: boolean;
  action_taken: boolean;
  action_notes: string | null;
  created_at: string;
  expires_at: string | null;
}

interface QueryResponse {
  response: string;
  tokensUsed: number;
  responseTimeMs: number;
  queryId: string;
}

export function useAIDatabaseManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [specialists, setSpecialists] = useState<AISpecialist[]>([]);
  const [queryLogs, setQueryLogs] = useState<AIQueryLog[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  const fetchSpecialists = useCallback(async () => {
    const { data, error } = await supabase
      .from('ai_specialists' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch specialists:', error);
      return;
    }
    setSpecialists(data as unknown as AISpecialist[]);
  }, []);

  const createSpecialist = useCallback(async (specialist: Partial<AISpecialist>) => {
    const { data, error } = await supabase
      .from('ai_specialists' as any)
      .insert(specialist)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create AI specialist',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Specialist Created',
      description: `${specialist.name} is now available`,
    });
    
    await fetchSpecialists();
    return data as unknown as AISpecialist;
  }, [fetchSpecialists]);

  const updateSpecialist = useCallback(async (id: string, updates: Partial<AISpecialist>) => {
    const { error } = await supabase
      .from('ai_specialists' as any)
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update specialist',
        variant: 'destructive',
      });
      return false;
    }

    await fetchSpecialists();
    return true;
  }, [fetchSpecialists]);

  const deleteSpecialist = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('ai_specialists' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete specialist',
        variant: 'destructive',
      });
      return false;
    }

    await fetchSpecialists();
    return true;
  }, [fetchSpecialists]);

  const executeQuery = useCallback(async (
    query: string,
    queryType: 'database' | 'insights' | 'chat',
    specialistId?: string,
    context?: Record<string, unknown>
  ): Promise<QueryResponse | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-database-query', {
        body: { query, queryType, specialistId, context }
      });

      if (error) throw error;
      return data as QueryResponse;
    } catch (error: any) {
      console.error('Query execution error:', error);
      toast({
        title: 'Query Failed',
        description: error.message || 'Failed to execute AI query',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQueryLogs = useCallback(async (limit = 50) => {
    const { data, error } = await supabase
      .from('ai_query_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch query logs:', error);
      return;
    }
    setQueryLogs(data as unknown as AIQueryLog[]);
  }, []);

  const fetchInsights = useCallback(async (category?: string) => {
    let query = supabase
      .from('ai_insights' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Failed to fetch insights:', error);
      return;
    }
    setInsights(data as unknown as AIInsight[]);
  }, []);

  const markInsightRead = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('ai_insights' as any)
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setInsights(prev => prev.map(i => i.id === id ? { ...i, is_read: true } : i));
    }
  }, []);

  const takeInsightAction = useCallback(async (id: string, notes: string) => {
    const { error } = await supabase
      .from('ai_insights' as any)
      .update({ action_taken: true, action_notes: notes })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to record action',
        variant: 'destructive',
      });
      return false;
    }

    setInsights(prev => prev.map(i => 
      i.id === id ? { ...i, action_taken: true, action_notes: notes } : i
    ));
    return true;
  }, []);

  const getAnalytics = useCallback(async () => {
    // Fetch summary stats
    const [
      { count: totalQueries },
      { count: activeSpecialists },
      { count: unreadInsights }
    ] = await Promise.all([
      supabase.from('ai_query_logs' as any).select('*', { count: 'exact', head: true }),
      supabase.from('ai_specialists' as any).select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('ai_insights' as any).select('*', { count: 'exact', head: true }).eq('is_read', false)
    ]);

    return {
      totalQueries: totalQueries || 0,
      activeSpecialists: activeSpecialists || 0,
      unreadInsights: unreadInsights || 0
    };
  }, []);

  return {
    isLoading,
    specialists,
    queryLogs,
    insights,
    fetchSpecialists,
    createSpecialist,
    updateSpecialist,
    deleteSpecialist,
    executeQuery,
    fetchQueryLogs,
    fetchInsights,
    markInsightRead,
    takeInsightAction,
    getAnalytics,
  };
}
