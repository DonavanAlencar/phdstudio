/**
 * Types para o Admin CRM
 */

export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string | null;
  stage: 'Curioso' | 'Avaliando' | 'Pronto para agir';
  pain_point: string | null;
  assigned_to: number | null;
  assigned_first_name?: string | null;
  assigned_last_name?: string | null;
  assigned_email?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tags?: Tag[];
  custom_fields?: Record<string, any>;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  lead_id: number;
  user_id: number | null;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  lead_email?: string;
  lead_first_name?: string;
  lead_last_name?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
}

export interface KanbanBoard {
  id: number;
  name: string;
  description: string | null;
  user_id: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  columns?: KanbanColumn[];
}

export interface KanbanColumn {
  id: number;
  board_id: number;
  name: string;
  position: number;
  color: string;
  created_at: string;
  updated_at: string;
  cards?: KanbanCard[];
}

export interface KanbanCard {
  id: number;
  column_id: number;
  lead_id: number | null;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  lead_email?: string;
  lead_first_name?: string;
  lead_last_name?: string;
  lead_status?: string;
  lead_stage?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  leads: {
    total: number;
    by_status: Array<{ status: string; count: string }>;
    by_stage: Array<{ stage: string; count: string }>;
    by_source: Array<{ source: string; count: string }>;
    last_30_days: Array<{ date: string; count: string }>;
  };
  activities: {
    pending: number;
    by_type: Array<{ type: string; count: string }>;
  };
  tags: {
    top: Array<Tag & { count: string }>;
  };
}

export interface MyStats {
  leads: {
    total: number;
    converted_this_month: number;
  };
  activities: {
    pending: number;
    upcoming: number;
    overdue: number;
  };
}

