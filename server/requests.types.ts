export const STATUSES = ['pending', 'in_progress', 'resolved'] as const;
export const PRIORITIES = ['low', 'medium', 'high'] as const;
export const CATEGORIES = ['Soporte', 'Accesos', 'Facturación', 'Operaciones'] as const;

export type RequestStatus = (typeof STATUSES)[number];
export type RequestPriority = (typeof PRIORITIES)[number];
export type RequestCategory = (typeof CATEGORIES)[number];

export interface ServiceRequest {
  id: number;
  code: string;
  title: string;
  description: string;
  requester: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEvent {
  id: number;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  note: string;
  createdAt: string;
}

export interface RequestDetail extends ServiceRequest {
  history: HistoryEvent[];
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  resolved: 'Resuelta',
};

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};
