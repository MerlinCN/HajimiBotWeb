import React, { useEffect } from 'react';
import { PersonIcon, GroupIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useGroups } from '../../context/GroupsContext';
import { useToast } from '../../context/ToastContext';
import { truncateText } from '../../lib/utils';

interface GroupListProps {
  onSelectGroup?: (groupId: string) => void;
  selectedGroupId?: string | null;
  viewMode?: 'list' | 'grid';
  forceRefresh?: boolean;
  onRefreshComplete?: () => void;
}

const GroupList: React.FC<GroupListProps> = ({ 
  onSelectGroup, 
  selectedGroupId, 
  viewMode = 'list',
  forceRefresh = false,
  onRefreshComplete
}) => {
  const { groups, isLoading, error, fetchGroups } = useGroups();
  const { addToast } = useToast();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        await fetchGroups(forceRefresh);
        // 如果是强制刷新且有回调，调用完成回调
        if (forceRefresh && onRefreshComplete) {
          onRefreshComplete();
        }
      } catch {
        // 错误已在 context 中处理
        if (forceRefresh && onRefreshComplete) {
          onRefreshComplete();
        }
      }
    };

    loadGroups();
  }, [fetchGroups, forceRefresh, onRefreshComplete]);

  // 选择第一个群组的逻辑独立出来
  useEffect(() => {
    if (!selectedGroupId && groups.length > 0 && onSelectGroup) {
      onSelectGroup(groups[0].group_id);
    }
  }, [selectedGroupId, onSelectGroup, groups]);

  // 显示错误提示
  useEffect(() => {
    if (error) {
      addToast({
        title: '获取群聊列表失败',
        description: '请检查您的网络连接并刷新页面重试',
        type: 'destructive',
      });
    }
  }, [error, addToast]);

  if (viewMode === 'grid') {
    return (
      <div className="w-full">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GroupIcon className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-medium">暂无群聊</h3>
            <p className="text-sm text-muted-foreground">
              添加机器人到QQ群聊即可在此处显示
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.group_id}
                className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.group_avatar} alt={group.group_name} />
                    <AvatarFallback>
                      <GroupIcon className="h-6 w-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {group.group_member_count} 人
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {group.group_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  群号：{group.group_id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">群聊列表</h2>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {groups.length} 个群
        </span>
      </div>
      
      <Separator />
      
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <ScrollArea className="flex-1 px-1">
          <div className="space-y-1 p-2">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GroupIcon className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">暂无群聊</h3>
                <p className="text-sm text-muted-foreground">添加机器人到QQ群聊即可在此处显示</p>
              </div>
            ) : (
              groups.map((group) => (
                <Button
                  key={group.group_id}
                  variant={selectedGroupId === group.group_id ? 'default' : 'ghost'}
                  className={`w-full justify-start px-2 py-6 ${
                    selectedGroupId === group.group_id ? '' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => onSelectGroup?.(group.group_id)}
                >
                  <div className="flex w-full items-start gap-3 overflow-hidden">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={group.group_avatar} alt={group.group_name} />
                      <AvatarFallback>
                        <PersonIcon className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{truncateText(group.group_name, 15)}</h3>
                      </div>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default GroupList;