import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-runs the fetch. Useful after a mutation. */
  reload: () => void;
}

/**
 * Runs an async fetch and tracks loading and error state.
 *
 * `deps` behaves like a `useEffect` dependency list. In-flight requests are
 * aborted when the deps change or the component unmounts, so switching months
 * quickly cannot land an older response on top of a newer one.
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Keeping the fetcher in a ref lets callers pass an inline arrow function
  // without it re-triggering the effect on every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        if (!active || (caught as Error)?.name === 'AbortError') return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : 'Something went wrong loading this page.',
        );
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { data, loading, error, reload };
}
