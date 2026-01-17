import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Citation {
  url: string;
  title?: string;
}

interface PerplexityResult {
  answer: string;
  citations: Citation[];
  model: string;
}

interface UsePerplexitySearchReturn {
  search: (query: string, options?: { model?: string; maxTokens?: number }) => Promise<PerplexityResult | null>;
  isSearching: boolean;
  error: string | null;
  lastResult: PerplexityResult | null;
}

export const usePerplexitySearch = (): UsePerplexitySearchReturn => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PerplexityResult | null>(null);

  const search = useCallback(async (
    query: string,
    options?: { model?: string; maxTokens?: number }
  ): Promise<PerplexityResult | null> => {
    if (!query.trim()) {
      setError('Query cannot be empty');
      return null;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('perplexity-search', {
        body: {
          query,
          model: options?.model || 'sonar',
          max_tokens: options?.maxTokens || 1024,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result: PerplexityResult = {
        answer: data.answer || '',
        citations: data.citations || [],
        model: data.model || 'sonar',
      };

      setLastResult(result);
      return result;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      console.error('Perplexity search error:', err);
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    search,
    isSearching,
    error,
    lastResult,
  };
};

export default usePerplexitySearch;
