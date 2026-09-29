import type { Filters, NewRequest, RequestDetail, RequestList, Stats, Status } from './types';

async function json<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = Array.isArray(payload.message) ? payload.message.join('. ') : payload.message;
    throw new Error(message || 'No pudimos completar la operación. Intenta de nuevo.');
  }
  return response.json();
}
export function filterParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value.trim()) params.set(key, value.trim());
  });
  return params;
}
export const api = {
  list(filters: Filters, page: number, signal: AbortSignal) {
    const params = filterParams(filters);
    params.set('page', String(page));
    params.set('pageSize', '8');
    return json<RequestList>(`/requests?${params}`, { signal });
  },
  stats: (signal?: AbortSignal) => json<Stats>('/requests/stats', { signal }),
  detail: (id: number, signal?: AbortSignal) => json<RequestDetail>(`/requests/${id}`, { signal }),
  create: (body: NewRequest) =>
    json<RequestDetail>('/requests', { method: 'POST', body: JSON.stringify(body) }),
  changeStatus: (id: number, status: Status, note: string) =>
    json<RequestDetail>(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),
};
