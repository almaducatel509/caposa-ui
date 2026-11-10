import AxiosInstance from "@/app/lib/axiosInstance";

export interface AuditLog {
  id: string;
  user: string | null;
  username: string | null;
  actor_name: string | null;
  user_role?: string | null;
  action: string;
  action_display?: string;
  module: string;
  target_id: string | null;
  target_repr: string | null;
  description: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  status_display?: string;
  created_at: string;
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  module?: string;
  status?: string;
  username?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedAuditLogs {
  count: number;
  results: AuditLog[];
}

/**
 * Récupère la liste des journaux d'audit avec filtres et pagination.
 */
export async function fetchAuditLogs(filters?: AuditLogFilters): Promise<PaginatedAuditLogs> {
  const params: Record<string, any> = {};

  if (filters?.search) params.search = filters.search;
  if (filters?.action && filters.action !== 'all') params.action = filters.action;
  if (filters?.module && filters.module !== 'all') params.module = filters.module;
  if (filters?.status && filters.status !== 'all') params.status = filters.status;
  if (filters?.username) params.username = filters.username;
  if (filters?.ordering) params.ordering = filters.ordering;
  if (filters?.page) params.page = filters.page;
  if (filters?.page_size) params.page_size = filters.page_size;

  const res = await AxiosInstance.get('/audit-logs/', { params });
  const data = res.data;

  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
    };
  }

  return {
    count: typeof data.count === 'number' ? data.count : (data.results?.length || 0),
    results: Array.isArray(data.results) ? data.results : [],
  };
}
