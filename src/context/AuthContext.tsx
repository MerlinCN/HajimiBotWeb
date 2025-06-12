import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { BotInfo } from '../types';
import api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  botInfo: BotInfo | null;
  login: (token: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has auth cookie
    const checkAuthStatus = async () => {
      try {
        // 检查是否有有效的 token
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // 如果有 token，先设置为已认证状态
        setIsAuthenticated(true);
        
        // 然后异步验证 token 是否有效
        try {
          const response = await api.get('/auth/verify');
          if (response.data.code !== 0) {
            // 如果验证失败，清除认证状态
            setIsAuthenticated(false);
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          }
        } catch (error) {
          // 如果验证请求失败，保持当前状态
          console.error('Token verification failed:', error);
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(token);
      
      if (response.success) {
        setIsAuthenticated(true);
        if (response.bot) {
          setBotInfo(response.bot);
        }
        navigate('/dashboard');
        return { success: true, message: response.message };
      }
      
      return { 
        success: false, 
        message: response.message || 'Authentication failed' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'An error occurred during authentication' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setIsAuthenticated(false);
      setBotInfo(null);
      setIsLoading(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, botInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};