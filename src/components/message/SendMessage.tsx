import React, { useState, useEffect } from 'react';
import { TrashIcon, ImageIcon, FileTextIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ChatGroup } from '../../types';
import { groupsApi, messageApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

enum MessageContentType {
  TEXT = 'text',
  IMAGE = 'image'
}

interface MessageContent {
  type: MessageContentType;
  content: string;
}

interface SendMessageRequest {
  group_ids: number[];
  message_content: MessageContent[];
  at_all: boolean;
  set_essence: boolean;
  set_announcement: boolean;
}

const SendMessage: React.FC = () => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [messageContent, setMessageContent] = useState<MessageContent[]>([
    { type: MessageContentType.TEXT, content: '' }
  ]);
  const [atAll, setAtAll] = useState(false);
  const [setEssence, setSetEssence] = useState(false);
  const [setAnnouncement, setSetAnnouncement] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useToast();

  // localStorage 键名
  const SELECTED_GROUPS_KEY = 'send_message_selected_groups';

  // 保存选择的群组到 localStorage
  const saveSelectedGroups = (groupIds: number[]) => {
    try {
      localStorage.setItem(SELECTED_GROUPS_KEY, JSON.stringify(groupIds));
    } catch (error) {
      console.warn('Failed to save selected groups to localStorage:', error);
    }
  };

  // 从 localStorage 恢复选择的群组
  const loadSelectedGroups = (): number[] => {
    try {
      const saved = localStorage.getItem(SELECTED_GROUPS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load selected groups from localStorage:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const fetchedGroups = await groupsApi.getGroups();
        setGroups(fetchedGroups);
        
        // 恢复之前保存的群组选择
        const savedSelection = loadSelectedGroups();
        if (savedSelection.length > 0) {
          // 只保留仍然存在的群组
          const validGroupIds = fetchedGroups.map(g => g.group_id);
          const validSelection = savedSelection.filter(id => validGroupIds.includes(id));
          setSelectedGroups(validSelection);
        }
      } catch {
        addToast({
          title: '获取群组失败',
          description: '无法加载群组列表',
          type: 'destructive',
        });
      }
    };

    fetchGroups();
  }, [addToast]);

  const addMessageContent = (type: MessageContentType) => {
    // 如果要添加图片，且已经勾选发送公告，检查是否已有图片
    if (type === MessageContentType.IMAGE && setAnnouncement) {
      const imageCount = messageContent.filter(item => item.type === MessageContentType.IMAGE).length;
      if (imageCount >= 1) {
        addToast({
          title: '群公告限制',
          description: '群公告只能包含一张图片',
          type: 'destructive',
        });
        return;
      }
    }
    
    setMessageContent([...messageContent, { type, content: '' }]);
  };

  const removeMessageContent = (index: number) => {
    if (messageContent.length > 1) {
      setMessageContent(messageContent.filter((_, i) => i !== index));
    }
  };

  const updateMessageContent = (index: number, content: string) => {
    const updated = [...messageContent];
    updated[index].content = content;
    setMessageContent(updated);
  };

  const toggleGroupSelection = (groupId: number) => {
    setSelectedGroups(prev => {
      const newSelection = prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId];
      
      // 保存到 localStorage
      saveSelectedGroups(newSelection);
      return newSelection;
    });
  };

  const selectAllGroups = () => {
    const allGroupIds = groups.map(group => group.group_id);
    setSelectedGroups(allGroupIds);
    saveSelectedGroups(allGroupIds);
  };

  const clearAllGroups = () => {
    setSelectedGroups([]);
    saveSelectedGroups([]);
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        updateMessageContent(index, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (selectedGroups.length === 0) {
      addToast({
        title: '请选择群组',
        description: '至少选择一个群组发送消息',
        type: 'destructive',
      });
      return;
    }

    const hasContent = messageContent.some(item => 
      item.content.trim() !== '' || item.type === MessageContentType.IMAGE
    );

    if (!hasContent) {
      addToast({
        title: '请添加消息内容',
        description: '消息内容不能为空',
        type: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      const request: SendMessageRequest = {
        group_ids: selectedGroups,
        message_content: messageContent.filter(item => item.content.trim() !== ''),
        at_all: atAll,
        set_essence: setEssence,
        set_announcement: setAnnouncement,
      };

      const result = await messageApi.sendMessage(request);

      if (result.code === 0) {
        addToast({
          title: '发送成功',
          description: '消息已发送到所有选择的群组',
          type: 'success',
        });
        // 重置表单（保留群组选择）
        setMessageContent([{ type: MessageContentType.TEXT, content: '' }]);
        setAtAll(false);
        setSetEssence(false);
        setSetAnnouncement(false);
      } else {
        addToast({
          title: '部分发送失败',
          description: `${result.failed_groups.length} 个群组发送失败`,
          type: 'destructive',
        });
      }
    } catch {
      addToast({
        title: '发送失败',
        description: '消息发送过程中发生错误',
        type: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h3 className="text-lg font-semibold">发送消息</h3>
        <p className="text-sm text-muted-foreground">向群组发送文字和图片消息</p>
      </div>

      {/* 群组选择 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">选择群组</Label>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllGroups}
              disabled={groups.length === 0}
            >
              全选
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllGroups}
              disabled={selectedGroups.length === 0}
            >
              清空
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-40 w-full rounded-md border p-2">
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.group_id}
                className={`flex items-center space-x-3 rounded-md p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedGroups.includes(group.group_id) 
                    ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600' 
                    : ''
                }`}
                onClick={() => toggleGroupSelection(group.group_id)}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.group_id)}
                  onChange={() => toggleGroupSelection(group.group_id)}
                  className="rounded accent-gray-500"
                />
                <Avatar className="h-10 w-10">
                  <AvatarImage src={group.group_avatar} alt={group.group_name} />
                  <AvatarFallback className="text-xs">
                    {group.group_name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{group.group_name}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {group.group_member_count}人
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    群号：{group.group_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {selectedGroups.length > 0 && (
          <p className="text-xs text-muted-foreground">
            已选择 {selectedGroups.length} 个群组
          </p>
        )}
      </div>

      <Separator />

      {/* 消息内容 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">消息内容</Label>
          <div className="space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addMessageContent(MessageContentType.TEXT)}
            >
              <FileTextIcon className="h-4 w-4 mr-1" />
              文字
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addMessageContent(MessageContentType.IMAGE)}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              图片
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {messageContent.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1">
                {item.type === MessageContentType.TEXT ? (
                  <Input
                    placeholder="输入文字内容..."
                    value={item.content}
                    onChange={(e) => updateMessageContent(index, e.target.value)}
                  />
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                      className="file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                    />
                    {item.content && (
                      <div className="rounded border p-2">
                        <img
                          src={item.content}
                          alt="预览"
                          className="max-h-20 max-w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeMessageContent(index)}
                disabled={messageContent.length === 1}
                className={messageContent.length === 1 ? 'opacity-50' : ''}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 特殊选项 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">特殊选项</Label>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="at-all"
              checked={atAll}
              onCheckedChange={setAtAll}
            />
            <Label htmlFor="at-all" className="text-sm">@全体成员</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="set-essence"
              checked={setEssence}
              onCheckedChange={setSetEssence}
            />
            <Label htmlFor="set-essence" className="text-sm">设置为精华消息</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="set-announcement"
              checked={setAnnouncement}
              onCheckedChange={(checked) => {
                // 如果要勾选群公告，检查图片数量
                if (checked) {
                  const imageCount = messageContent.filter(item => item.type === MessageContentType.IMAGE).length;
                  if (imageCount > 1) {
                    addToast({
                      title: '群公告限制',
                      description: '群公告只能包含一张图片，请先删除多余图片',
                      type: 'destructive',
                    });
                    return;
                  }
                }
                setSetAnnouncement(checked);
              }}
            />
            <Label htmlFor="set-announcement" className="text-sm">设置为群公告</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* 发送按钮 */}
      <Button
        onClick={handleSendMessage}
        disabled={isSending || selectedGroups.length === 0}
        className="w-full"
      >
        <PaperPlaneIcon className="h-4 w-4 mr-2" />
        {isSending ? '发送中...' : '发送消息'}
      </Button>
    </div>
  );
};

export default SendMessage;