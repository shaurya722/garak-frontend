"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { apiConfig } from '@/config/api';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  company?: string;
  name?: string;
  role?: string;
}

export interface LoginCredentials {
  company: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Get token from cookies
  const getToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  // Set token in cookies
  const setToken = (token: string, rememberMe: boolean = false) => {
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days
    document.cookie = `token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  };

  // Remove token from cookies
  const removeToken = () => {
    document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
  };

  // Fetch current user data
  const refreshUser = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.get(apiConfig.endpoints.authMe);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      removeToken();
    }
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Send complete company login payload
      const response = await api.post(apiConfig.endpoints.authCompanyLogin, {
        company: credentials.company,
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe
      });
      console.log('Login response:', response);
      
      const token = response?.data?.token || response?.data?.access_token || response?.data?.jwt;
      if (!token) {
        throw new Error('No token returned by server');
      }

      // Store token
      setToken(token, credentials.rememberMe);

      // Fetch user data
      await refreshUser();

      toast.success('Logged in successfully');
    } catch (error: unknown) {
      console.error('Login failed:', error);
      
      let message = 'Login failed';
      
      if (error instanceof Error) {
        message = error.message;
      } else {
        const axiosError = error as { response?: { status?: number; data?: { message?: string; detail?: string } } };
        
        if (axiosError?.response?.status === 404) {
          message = 'Company login endpoint not found. Please ensure your backend implements POST /api/auth/company/login';
        } else {
          message = axiosError?.response?.data?.message || 
                   axiosError?.response?.data?.detail || 
                   'Login failed';
        }
      }
      
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    removeToken();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
