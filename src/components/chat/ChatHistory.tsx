import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ChatMessage } from '../../types';
import { groupsApi } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/utils';

interface ChatHistoryProps {
  groupId: string | null;
  groupName: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ groupId, groupName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { subscribeToGroup, unsubscribeFromGroup } = useWebSocket();
  const { addToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const fetchedMessages = await groupsApi.getGroupMessages(groupId);
        setMessages(fetchedMessages);
      } catch (error) {
        addToast({
          title: '获取聊天记录失败',
          description: '无法加载聊天记录，请重试',
          type: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [groupId, addToast]);

  useEffect(() => {
    if (!groupId) return;

    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    subscribeToGroup(groupId, handleNewMessage);

    return () => {
      if (groupId) {
        unsubscribeFromGroup(groupId, handleNewMessage);
      }
    };
  }, [groupId, subscribeToGroup, unsubscribeFromGroup]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getUserInitials = (nickname: string): string => {
    return nickname
      .split('')
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!groupId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">请选择一个群聊</h2>
        <p className="text-muted-foreground">在左侧选择一个群聊以查看聊天记录</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">{groupName || '聊天记录'}</h2>
        <p className="text-sm text-muted-foreground">群ID: {groupId}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">暂无聊天记录</h3>
              <p className="text-sm text-muted-foreground">
                此群聊中没有聊天记录或消息未能加载
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={message.avatar_url} alt={message.nickname} />
                    <AvatarFallback>{getUserInitials(message.nickname)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.nickname}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    <div className="user-message">{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default ChatHistory;