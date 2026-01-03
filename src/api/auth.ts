import { api } from './client';
import type { User } from '../types';

export interface AuthUrlResponse {
  auth_url: string;
}

export const authApi = {
  loginGoogle: async (): Promise<string> => {
    const response = await api.post<AuthUrlResponse>('/api/auth/login/google');
    return response.auth_url;
  },

  loginMicrosoft: async (): Promise<string> => {
    const response = await api.post<AuthUrlResponse>('/api/auth/login/microsoft');
    return response.auth_url;
  },

  getMe: async (): Promise<User> => {
    return api.get<User>('/api/auth/me');
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
    api.setToken(null);
  },
};
