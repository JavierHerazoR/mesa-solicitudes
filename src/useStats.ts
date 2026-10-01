import { useEffect, useState } from 'react';
import { api } from './api';
import type { Stats } from './types';
export function useStats(revision: number) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setStats(null);
    api
      .stats(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setStats(value);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason.message || 'No pudimos cargar el resumen.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  return { stats, loading, error };
}
