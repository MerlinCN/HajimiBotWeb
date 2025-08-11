import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { X } from 'lucide-react';
import { useGroups } from '../../context/GroupsContext';

interface GroupArrayPoolProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
  description?: string;
}

const GroupArrayPool: React.FC<GroupArrayPoolProps> = ({
  label,
  value = [],
  onChange,
  description
}) => {
  const { groups, isLoading, fetchGroups } = useGroups();
  const [selectValue, setSelectValue] = useState<string>('');

  useEffect(() => {
    // 使用全局状态获取群组，不强制刷新
    fetchGroups(false);
  }, [fetchGroups]);

  const handleAddGroup = (groupId: string) => {
    const numGroupId = parseInt(groupId);
    if (!value.includes(numGroupId)) {
      onChange([...value, numGroupId]);
    }
    setSelectValue(''); // 重置下拉菜单
  };

  const handleRemoveGroup = (groupId: number) => {
    onChange(value.filter(id => id !== groupId));
  };

  const getGroupInfo = (groupId: number) => {
    return groups.find(group => parseInt(group.group_id) === groupId);
  };

  const availableGroups = groups.filter(group => 
    !value.includes(parseInt(group.group_id))
  );

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* 群聊池容器 */}
      <div className="min-h-[100px] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-4">
        {/* 群聊气泡显示区域 */}
        <div className="flex flex-wrap gap-3 mb-4">
          {value.map((groupId) => {
            const groupInfo = getGroupInfo(groupId);
            return (
              <div
                key={groupId}
                className="group relative flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage 
                    src={groupInfo?.group_avatar} 
                    alt={groupInfo?.group_name || `群 ${groupId}`}
                  />
                  <AvatarFallback className="text-xs">
                    {groupInfo?.group_name?.charAt(0) || '群'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {groupInfo?.group_name || `未知群聊`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {groupId} • {groupInfo?.group_member_count || 0}人
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5"
                  onClick={() => handleRemoveGroup(groupId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* 添加群聊下拉菜单 */}
        <div className="flex gap-2">
          <Select
            value={selectValue}
            onValueChange={handleAddGroup}
            disabled={isLoading || availableGroups.length === 0}
          >
            <SelectTrigger className="flex-1">
              <SelectValue 
                placeholder={
                  isLoading 
                    ? "加载群聊列表中..." 
                    : availableGroups.length === 0 
                      ? "所有群聊已添加" 
                      : "选择要添加的群聊"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {availableGroups.map((group) => (
                <SelectItem 
                  key={group.group_id} 
                  value={group.group_id}
                  className="focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-foreground"
                >
                  <div className="flex items-center gap-2 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={group.group_avatar} alt={group.group_name} />
                      <AvatarFallback className="text-xs">
                        {group.group_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{group.group_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {group.group_id} • {group.group_member_count}人
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default GroupArrayPool;