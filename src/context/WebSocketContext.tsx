import React, { createContext, useContext, useEffect, useState } from 'react';
import wsService from '../services/websocket';
import { ChatMessage } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WebSocketContextType {
  isConnected: boolean;
  subscribeToGroup: (groupId: string, handler: (message: ChatMessage) => void) => void;
  unsubscribeFromGroup: (groupId: string, handler: (message: ChatMessage) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('auth_token') || '';
      
      wsService.connect(
        token,
        () => setIsConnected(true),
        () => setIsConnected(false)
      );
      
      return () => {
        wsService.disconnect();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated]);

  const subscribeToGroup = (groupId: string, handler: (message: ChatMessage) => void) => {
    wsService.subscribeToGroup(groupId, handler);
  };

  const unsubscribeFromGroup = (groupId: string, handler: (message: ChatMessage) => void) => {
    wsService.unsubscribeFromGroup(groupId, handler);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribeToGroup, unsubscribeFromGroup }}>
      {children}
    </WebSocketContext.Provider>
  );
};