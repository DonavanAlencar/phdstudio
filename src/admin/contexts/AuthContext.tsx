/**
 * Context de Autenticação
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (storedUser && token) {
          // Validar token com a API (com timeout reduzido e melhor tratamento)
          try {
            const currentUser = await Promise.race([
              api.getMe(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 10000)
              )
            ]);
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          } catch (error: any) {
            // Verificar se é timeout de rede ou token inválido
            if (error.message === 'Timeout' || error.code === 'ECONNABORTED') {
              // Timeout de rede - manter token e usuário, apenas logar erro
              console.warn('Timeout ao validar token (rede lenta), mantendo sessão local');
              // Usar usuário do localStorage se disponível
              try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
              } catch (e) {
                // Se não conseguir parsear, limpar tudo
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
              }
            } else if (error.response?.status === 401) {
              // Token inválido ou expirado - limpar
              console.error('Token inválido ou expirado');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
            } else {
              // Outro erro - manter sessão local mas logar erro
              console.error('Erro ao validar token:', error);
              try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
              } catch (e) {
                // Se não conseguir parsear, limpar tudo
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await api.login(email, password);
    const { user: userData, accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

