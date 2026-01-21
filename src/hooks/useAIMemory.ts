import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AIMemory {
  id: string;
  user_id: string;
  conversation_id: string | null;
  memory_type: 'preference' | 'fact' | 'context' | 'sentiment';
  key: string;
  value: Record<string, unknown>;
  confidence: number;
  source: 'explicit' | 'inferred' | 'system';
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAIMemory() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<AIMemory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemories = useCallback(async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('ai_conversation_memory')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (data) setMemories(data as AIMemory[]);
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchMemories();
      setLoading(false);
    };
    load();
  }, [fetchMemories]);

  const storeMemory = useCallback(async (
    key: string,
    value: Record<string, unknown>,
    memoryType: AIMemory['memory_type'] = 'context',
    options?: {
      conversationId?: string;
      confidence?: number;
      source?: AIMemory['source'];
      expiresAt?: string;
    }
  ) => {
    if (!user?.id) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('ai_conversation_memory')
      .upsert({
        user_id: user.id,
        key,
        value,
        memory_type: memoryType,
        conversation_id: options?.conversationId,
        confidence: options?.confidence ?? 1.0,
        source: options?.source ?? 'system',
        expires_at: options?.expiresAt,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,key',
      })
      .select()
      .single();

    if (!error && data) {
      setMemories(prev => {
        const existing = prev.findIndex(m => m.key === key);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data as AIMemory;
          return updated;
        }
        return [data as AIMemory, ...prev];
      });
    }

    return { data, error };
  }, [user?.id]);

  const getMemory = useCallback((key: string): AIMemory | undefined => {
    return memories.find(m => m.key === key);
  }, [memories]);

  const getMemoriesByType = useCallback((type: AIMemory['memory_type']): AIMemory[] => {
    return memories.filter(m => m.memory_type === type);
  }, [memories]);

  const deleteMemory = useCallback(async (key: string) => {
    if (!user?.id) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('ai_conversation_memory')
      .delete()
      .eq('user_id', user.id)
      .eq('key', key);

    if (!error) {
      setMemories(prev => prev.filter(m => m.key !== key));
    }

    return { error };
  }, [user?.id]);

  const getContextForConversation = useCallback(async (conversationId?: string) => {
    if (!user?.id) return [];

    // Get all relevant memories for context
    const preferences = getMemoriesByType('preference');
    const facts = getMemoriesByType('fact');
    
    // Get conversation-specific context if provided
    let conversationContext: AIMemory[] = [];
    if (conversationId) {
      conversationContext = memories.filter(m => m.conversation_id === conversationId);
    }

    // Build context object
    return {
      preferences: preferences.reduce((acc, m) => ({ ...acc, [m.key]: m.value }), {}),
      facts: facts.reduce((acc, m) => ({ ...acc, [m.key]: m.value }), {}),
      conversationContext: conversationContext.map(m => ({ key: m.key, value: m.value })),
      totalMemories: memories.length,
    };
  }, [user?.id, memories, getMemoriesByType]);

  // Auto-extract and store preferences from conversation
  const extractAndStorePreferences = useCallback(async (
    message: string,
    conversationId: string
  ) => {
    if (!user?.id) return;

    // Simple preference extraction patterns
    const preferencePatterns = [
      { pattern: /i (?:prefer|like|love|enjoy) (.+)/i, type: 'preference' as const },
      { pattern: /my favorite (.+) is (.+)/i, type: 'preference' as const },
      { pattern: /i (?:am|'m) (?:a |an )?(.+)/i, type: 'fact' as const },
      { pattern: /i (?:live|reside|stay) (?:in|at) (.+)/i, type: 'fact' as const },
    ];

    for (const { pattern, type } of preferencePatterns) {
      const match = message.match(pattern);
      if (match) {
        const key = `inferred_${type}_${Date.now()}`;
        await storeMemory(
          key,
          { rawMatch: match[0], extractedValue: match[1] || match[2] },
          type,
          { conversationId, confidence: 0.7, source: 'inferred' }
        );
      }
    }
  }, [user?.id, storeMemory]);

  return {
    memories,
    loading,
    storeMemory,
    getMemory,
    getMemoriesByType,
    deleteMemory,
    getContextForConversation,
    extractAndStorePreferences,
    refresh: fetchMemories,
  };
}
