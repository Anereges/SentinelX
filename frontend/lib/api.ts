import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Only access localStorage in browser environment
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface DashboardMetrics {
  totalEvents: number;
  eventsToday: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  openIncidents: number;
  investigatingIncidents: number;
  resolvedIncidents: number;
  activeAgents: number;
  offlineAgents: number;
}

export const dashboardApi = {
  getMetrics: () => api.get<{ success: boolean; data: DashboardMetrics }>('/dashboard/metrics'),
};

export const alertsApi = {
  getAll: (params?: any) => api.get('/alerts', { params }),
  getById: (id: string) => api.get(`/alerts/${id}`),
  update: (id: string, data: any) => api.patch(`/alerts/${id}`, data),
  createIncident: (id: string, data: any) => api.post(`/alerts/${id}/create-incident`, data),
};

export const incidentsApi = {
  getAll: (params?: any) => api.get('/incidents', { params }),
  getById: (id: string) => api.get(`/incidents/${id}`),
  create: (data: any) => api.post('/incidents', data),
  update: (id: string, data: any) => api.patch(`/incidents/${id}`, data),
  addNote: (id: string, data: any) => api.post(`/incidents/${id}/notes`, data),
  getTimeline: (id: string) => api.get(`/incidents/${id}/timeline`),
};

export const eventsApi = {
  getAll: (params?: any) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
};

export const agentsApi = {
  getAll: () => api.get('/agents'),
  getById: (id: string) => api.get(`/agents/${id}`),
  create: (data: any) => api.post('/agents', data),
  update: (id: string, data: any) => api.patch(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
  heartbeat: (id: string, data: any) => api.post(`/agents/${id}/heartbeat`, data),
};