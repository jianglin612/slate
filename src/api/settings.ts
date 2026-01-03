import { api } from './client';
import type { Category, IntegrationStatus } from '../types';

export interface CategoryCreate {
  name: string;
  icon?: string;
  color?: string;
}

export const settingsApi = {
  listCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>('/api/settings/categories');
  },

  createCategory: async (data: CategoryCreate): Promise<Category> => {
    return api.post<Category>('/api/settings/categories', data);
  },

  updateCategory: async (categoryId: string, data: CategoryCreate): Promise<Category> => {
    return api.put<Category>(`/api/settings/categories/${categoryId}`, data);
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    return api.delete(`/api/settings/categories/${categoryId}`);
  },

  listIntegrations: async (): Promise<IntegrationStatus[]> => {
    return api.get<IntegrationStatus[]>('/api/settings/integrations');
  },

  disconnectIntegration: async (provider: string): Promise<void> => {
    return api.delete(`/api/settings/integrations/${provider}`);
  },
};
