import { useEffect, useState } from 'react';
import { api } from './api';
import type { Filters, RequestList, Stats } from './types';

export function useRequests(filters: Filters, page: number, revision: number) {
  const [data, setData] = useState<RequestList | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([api.list(filters, page, controller.signal), api.stats(controller.signal)])
      .then(([list, summary]) => {
        setData(list);
        setStats(summary);
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(reason.message || 'No pudimos conectar con el servidor.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters.search, filters.status, filters.priority, filters.category, page, revision]);
  return { data, stats, loading, error };
}
