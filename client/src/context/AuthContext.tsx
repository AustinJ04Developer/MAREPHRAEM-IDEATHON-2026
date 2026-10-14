import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentAdmin = async () => {
    try {
      const res = await api.get('/admin/auth/me');
      if (res.data?.success && res.data?.data) {
        setAdmin(res.data.data);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/admin/auth/login', { email, password });
    if (res.data?.success && res.data?.data) {
      if (res.data.data.token) {
        localStorage.setItem('ideathon_admin_token', res.data.data.token);
      }
      if (res.data.data.admin) {
        setAdmin(res.data.data.admin);
      }
    }
  };

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } finally {
      localStorage.removeItem('ideathon_admin_token');
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        refreshProfile: fetchCurrentAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
