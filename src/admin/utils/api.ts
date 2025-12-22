/**
 * Cliente API para o Admin CRM
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Lead,
  Tag,
  Activity,
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  AuthResponse,
  PaginatedResponse,
  DashboardStats,
  MyStats
} from '../types';

// URL base da API
// Em produção: https://phdstudio.com.br (o /api é adicionado pelo path)
// Em dev: http://localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Normalizar URL base (remover /api se presente, pois será adicionado nos paths)
const normalizedBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: normalizedBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(
              `${API_BASE_URL}/api/crm/v1/auth/refresh`,
              { refreshToken }
            );

            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/admin/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/api/crm/v1/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/crm/v1/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/api/crm/v1/auth/me');
    return response.data.data;
  }

  // Leads
  async getLeads(params?: {
    page?: number;
    limit?: number;
    status?: string;
    stage?: string;
    search?: string;
    assigned_to?: number;
    tags?: number[];
  }): Promise<PaginatedResponse<Lead>> {
    const response = await this.client.get('/api/crm/v1/leads', { params });
    return response.data;
  }

  async getLead(id: number): Promise<Lead> {
    const response = await this.client.get(`/api/crm/v1/leads/${id}`);
    return response.data.data;
  }

  async checkLead(email: string): Promise<Lead | null> {
    try {
      const response = await this.client.get(`/api/crm/v1/leads/check/${encodeURIComponent(email)}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const response = await this.client.post('/api/crm/v1/leads', data);
    return response.data.data;
  }

  async updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
    const response = await this.client.put(`/api/crm/v1/leads/${id}`, data);
    return response.data.data;
  }

  async deleteLead(id: number): Promise<void> {
    await this.client.delete(`/api/crm/v1/leads/${id}`);
  }

  // Tags
  async getTags(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Tag>> {
    const response = await this.client.get('/api/crm/v1/tags', { params });
    return response.data;
  }

  async getTag(id: number): Promise<Tag> {
    const response = await this.client.get(`/api/crm/v1/tags/${id}`);
    return response.data.data;
  }

  async createTag(data: Partial<Tag>): Promise<Tag> {
    const response = await this.client.post('/api/crm/v1/tags', data);
    return response.data.data;
  }

  async updateTag(id: number, data: Partial<Tag>): Promise<Tag> {
    const response = await this.client.put(`/api/crm/v1/tags/${id}`, data);
    return response.data.data;
  }

  async deleteTag(id: number): Promise<void> {
    await this.client.delete(`/api/crm/v1/tags/${id}`);
  }

  // Activities
  async getActivities(params?: {
    page?: number;
    limit?: number;
    lead_id?: number;
    user_id?: number;
    type?: string;
    completed?: boolean;
  }): Promise<PaginatedResponse<Activity>> {
    const response = await this.client.get('/api/crm/v1/activities', { params });
    return response.data;
  }

  async getActivity(id: number): Promise<Activity> {
    const response = await this.client.get(`/api/crm/v1/activities/${id}`);
    return response.data.data;
  }

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    const response = await this.client.post('/api/crm/v1/activities', data);
    return response.data.data;
  }

  async updateActivity(id: number, data: Partial<Activity>): Promise<Activity> {
    const response = await this.client.put(`/api/crm/v1/activities/${id}`, data);
    return response.data.data;
  }

  async completeActivity(id: number): Promise<Activity> {
    const response = await this.client.patch(`/api/crm/v1/activities/${id}/complete`);
    return response.data.data;
  }

  async deleteActivity(id: number): Promise<void> {
    await this.client.delete(`/api/crm/v1/activities/${id}`);
  }

  // Kanban
  async getBoards(): Promise<KanbanBoard[]> {
    const response = await this.client.get('/api/crm/v1/kanban/boards');
    return response.data.data;
  }

  async getBoard(id: number): Promise<KanbanBoard> {
    const response = await this.client.get(`/api/crm/v1/kanban/boards/${id}`);
    return response.data.data;
  }

  async createBoard(data: Partial<KanbanBoard>): Promise<KanbanBoard> {
    const response = await this.client.post('/api/crm/v1/kanban/boards', data);
    return response.data.data;
  }

  async updateBoard(id: number, data: Partial<KanbanBoard>): Promise<KanbanBoard> {
    const response = await this.client.put(`/api/crm/v1/kanban/boards/${id}`, data);
    return response.data.data;
  }

  async deleteBoard(id: number): Promise<void> {
    await this.client.delete(`/api/crm/v1/kanban/boards/${id}`);
  }

  async createColumn(data: Partial<KanbanColumn>): Promise<KanbanColumn> {
    const response = await this.client.post('/api/crm/v1/kanban/columns', data);
    return response.data.data;
  }

  async updateColumn(id: number, data: Partial<KanbanColumn>): Promise<KanbanColumn> {
    const response = await this.client.put(`/api/crm/v1/kanban/columns/${id}`, data);
    return response.data.data;
  }

  async deleteColumn(id: number): Promise<void> {
    await this.client.delete(`/api/crm/v1/kanban/columns/${id}`);
  }

  async createCard(data: Partial<KanbanCard>): Promise<KanbanCard> {
    const response = await this.client.post('/api/crm/v1/kanban/cards', data);
    return response.data.data;
  }

  async moveCard(id: number, columnId: number, position?: number): Promise<KanbanCard> {
    const response = await this.client.patch(`/api/crm/v1/kanban/cards/${id}/move`, {
      column_id: columnId,
      position,
    });
    return response.data.data;
  }

  async updateCard(id: number, data: Partial<KanbanCard>): Promise<KanbanCard> {
    const response = await this.client.put(`/api/crm/v1/kanban/cards/${id}`, data);
    return response.data.data;
  }

  async deleteCard(id: number): Promise<void> {
    await this.client.delete(`/api/crm/v1/kanban/cards/${id}`);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get('/api/crm/v1/dashboard/stats');
    return response.data.data;
  }

  async getMyStats(): Promise<MyStats> {
    const response = await this.client.get('/api/crm/v1/dashboard/my-stats');
    return response.data.data;
  }
}

export const api = new ApiClient();

