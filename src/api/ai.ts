import { api } from './client';

export interface SummaryResponse {
  summary: string;
}

export const aiApi = {
  generateSummary: async (reportId: string): Promise<SummaryResponse> => {
    return api.post<SummaryResponse>('/api/ai/generate-summary', { report_id: reportId });
  },
};
