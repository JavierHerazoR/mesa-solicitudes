export type Status = 'pending' | 'in_progress' | 'resolved';
export type Priority = 'low' | 'medium' | 'high';
export const categories = ['Soporte', 'Accesos', 'Facturación', 'Operaciones'] as const;
export type Category = (typeof categories)[number];
export interface RequestItem {
  id: number;
  code: string;
  title: string;
  description: string;
  requester: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}
export interface RequestDetail extends RequestItem {
  history: {
    id: number;
    fromStatus: Status | null;
    toStatus: Status;
    note: string;
    createdAt: string;
  }[];
}
export interface RequestList {
  items: RequestItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface Stats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  highPriority: number;
}
export interface Filters {
  search: string;
  status: '' | Status;
  priority: '' | Priority;
  category: '' | Category;
  dateFrom: string;
  dateTo: string;
}
export interface NewRequest {
  title: string;
  description: string;
  requester: string;
  category: Category;
  priority: Priority;
}
export const statusLabels: Record<Status, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  resolved: 'Resuelta',
};
export const priorityLabels: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};
