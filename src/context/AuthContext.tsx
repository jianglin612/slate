import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, authApi } from '../api';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (provider: 'google' | 'microsoft') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async () => {
    const token = api.getToken();

    if (!token) {
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }

    try {
      const user = await authApi.getMe();
      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      api.setToken(null);
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Check for token in URL (OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      api.setToken(token);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (error) {
      console.error('Auth error:', error);
      window.history.replaceState({}, '', window.location.pathname);
    }

    checkAuth();
  }, [checkAuth]);

  const login = async (provider: 'google' | 'microsoft') => {
    try {
      const authUrl = provider === 'google'
        ? await authApi.loginGoogle()
        : await authApi.loginMicrosoft();

      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors, we're logging out anyway
    }

    api.setToken(null);
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
