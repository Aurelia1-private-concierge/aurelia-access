import { useState, useCallback } from "react";

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

type AsyncFunction<T, P extends unknown[]> = (...args: P) => Promise<T>;

export const useAsync = <T, P extends unknown[]>(
  asyncFunction: AsyncFunction<T, P>
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const result = await asyncFunction(...args);
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, error: err, isLoading: false });
        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

export default useAsync;
