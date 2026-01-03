import { api } from './client';
import type { Report, PeriodType } from '../types';

export interface ReportCreate {
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  title?: string;
}

export interface ReportUpdate {
  title?: string;
  summary?: string;
  allow_comments?: boolean;
  allow_reactions?: boolean;
}

export const reportsApi = {
  list: async (limit = 10, offset = 0): Promise<Report[]> => {
    return api.get<Report[]>(`/api/reports?limit=${limit}&offset=${offset}`);
  },

  getCurrent: async (periodType: PeriodType = 'weekly', weekOffset: number = 0): Promise<Report> => {
    return api.get<Report>(`/api/reports/current?period_type=${periodType}&offset=${weekOffset}`);
  },

  get: async (reportId: string): Promise<Report> => {
    return api.get<Report>(`/api/reports/${reportId}`);
  },

  create: async (data: ReportCreate): Promise<Report> => {
    return api.post<Report>('/api/reports', data);
  },

  update: async (reportId: string, data: ReportUpdate): Promise<Report> => {
    return api.put<Report>(`/api/reports/${reportId}`, data);
  },

  delete: async (reportId: string): Promise<void> => {
    return api.delete(`/api/reports/${reportId}`);
  },

  publish: async (reportId: string): Promise<Report> => {
    return api.post<Report>(`/api/reports/${reportId}/publish`);
  },
};
