import { useCallback, useEffect, useRef, useState } from 'react';
import { toErrorMessage } from '../api/client.js';

/**
 * Minimal data-fetching hook: runs `fetcher` on mount and whenever `deps`
 * change, and exposes a `reload` for manual refreshes. Stale responses are
 * dropped so a slow request cannot overwrite a newer one.
 *
 * @param {() => Promise<unknown>} fetcher
 * @param {unknown[]} deps
 * @param {{ enabled?: boolean }} [options]
 */
export default function useApi(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const requestRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      if (requestId === requestRef.current) setData(result);
      return result;
    } catch (err) {
      if (requestId === requestRef.current) setError(toErrorMessage(err));
      return undefined;
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run, ...deps]);

  return { data, loading, error, reload: run, setData };
}
