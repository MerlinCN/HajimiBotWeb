import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatGroup } from '../types';
import { groupsApi } from '../services/api';

interface GroupsContextType {
  groups: ChatGroup[];
  isLoading: boolean;
  error: string | null;
  fetchGroups: (force?: boolean) => Promise<void>;
  refreshGroups: () => Promise<void>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

interface GroupsProviderProps {
  children: ReactNode;
}

export const GroupsProvider: React.FC<GroupsProviderProps> = ({ children }) => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (force: boolean = false) => {
    // 如果不是强制刷新且已有数据，则不重新获取
    if (!force && groups.length > 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedGroups = await groupsApi.getGroups();
      console.log('获取到的群组数据:', fetchedGroups);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('获取群聊列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [groups.length]);

  const refreshGroups = useCallback(async () => {
    await fetchGroups(true);
  }, [fetchGroups]);

  const value: GroupsContextType = {
    groups,
    isLoading,
    error,
    fetchGroups,
    refreshGroups,
  };

  return (
    <GroupsContext.Provider value={value}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
};