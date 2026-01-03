import { api } from './client';
import type { SyncResponse } from '../types';

export interface SyncHistory {
  id: string;
  user_id: string;
  provider: string;
  sync_type: string;
  last_sync_at: string;
  emails_fetched: number;
  events_fetched: number;
  created_at: string;
}

export const syncApi = {
  sync: async (reportId: string): Promise<SyncResponse> => {
    return api.post<SyncResponse>(`/api/sync?report_id=${reportId}`);
  },

  getStatus: async (): Promise<SyncHistory[]> => {
    return api.get<SyncHistory[]>('/api/sync/status');
  },
};
