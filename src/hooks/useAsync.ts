import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncResource<T> {
  data: T;
  loading: boolean;
  error: string | undefined;
  /** Re-run the fetch without changing dependencies. */
  refresh: () => void;
}

/**
 * Small data-fetching hook for the simulated backend.
 *
 * Views call asynchronous service functions (e.g. `api.articles.list()`) through
 * this hook so that loading and error states are handled consistently. The
 * `fallback` is what renders on the server and on the client's first paint,
 * which keeps server markup and hydration identical.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  dependencies: unknown[] = [],
): AsyncResource<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [nonce, setNonce] = useState(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    fetcher()
      .then((result) => {
        if (!cancelled && alive.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled && alive.current) {
          setError(caught instanceof Error ? caught.message : "Something went wrong.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, nonce]);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  return { data, loading, error, refresh };
}

/** Debounced value, used by the search inputs across the platform. */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
