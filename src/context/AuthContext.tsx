import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { BotInfo } from '../types';

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
        // Simple check if we have the cookie set
        const hasAuthCookie = document.cookie.includes('auth_token=');
        setIsAuthenticated(hasAuthCookie);
      } catch (error) {
        setIsAuthenticated(false);
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
        return { success: true };
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