import { useEffect, useState } from 'react';
import type { Filters } from './types';
export const emptyFilters: Filters = {
  search: '',
  status: '',
  priority: '',
  category: '',
  dateFrom: '',
  dateTo: '',
};
export function useRequestFilters(initial: Partial<Filters> = {}) {
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters, ...initial });
  const [search, setSearch] = useState(initial.search ?? '');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  function changeFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }
  function clear() {
    setSearch('');
    setFilters(emptyFilters);
    setPage(1);
  }
  return {
    filters,
    search,
    setSearch,
    page,
    setPage,
    changeFilter,
    clear,
    filtered: Object.values(filters).some(Boolean),
  };
}
