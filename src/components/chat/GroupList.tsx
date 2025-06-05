import React, { useState, useEffect } from 'react';
import { Bot, Users } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ChatGroup } from '../../types';
import { groupsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, truncateText } from '../../lib/utils';

interface GroupListProps {
  onSelectGroup: (groupId: string) => void;
  selectedGroupId: string | null;
}

const GroupList: React.FC<GroupListProps> = ({ onSelectGroup, selectedGroupId }) => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const fetchedGroups = await groupsApi.getGroups();
        setGroups(fetchedGroups);
        
        // Select first group if none selected
        if (!selectedGroupId && fetchedGroups.length > 0) {
          onSelectGroup(fetchedGroups[0].group_id);
        }
      } catch (error) {
        addToast({
          title: '获取群聊列表失败',
          description: '请检查您的网络连接并刷新页面重试',
          type: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [selectedGroupId, onSelectGroup, addToast]);

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
                <Users className="mb-2 h-12 w-12 text-muted-foreground" />
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
                  onClick={() => onSelectGroup(group.group_id)}
                >
                  <div className="flex w-full items-start gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{truncateText(group.group_name, 15)}</h3>
                        <span className="text-xs text-muted-foreground">{group.members}人</span>
                      </div>
                      {group.last_message && (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {truncateText(group.last_message.content, 20)}
                        </p>
                      )}
                      {group.last_message && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(group.last_message.timestamp)}
                        </p>
                      )}
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