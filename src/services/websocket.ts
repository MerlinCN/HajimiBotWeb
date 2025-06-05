import { ChatMessage } from '../types';

type MessageHandler = (message: ChatMessage) => void;
type ConnectionCallback = () => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private onOpenCallback: ConnectionCallback | null = null;
  private onCloseCallback: ConnectionCallback | null = null;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}/ws`;
  }

  connect(authToken: string, onOpen?: ConnectionCallback, onClose?: ConnectionCallback): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    
    this.onOpenCallback = onOpen || null;
    this.onCloseCallback = onClose || null;
    
    this.socket = new WebSocket(`${this.url}?token=${authToken}`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.onOpenCallback?.();
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message' && data.group_id) {
          const handlers = this.messageHandlers.get(data.group_id) || [];
          handlers.forEach(handler => handler(data.message));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.onCloseCallback?.();
      this.attemptReconnect();
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.messageHandlers.clear();
    this.onOpenCallback = null;
    this.onCloseCallback = null;
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect(
        localStorage.getItem('auth_token') || '',
        this.onOpenCallback || undefined,
        this.onCloseCallback || undefined
      );
    }, delay);
  }
  
  subscribeToGroup(groupId: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(groupId)) {
      this.messageHandlers.set(groupId, []);
    }
    
    this.messageHandlers.get(groupId)?.push(handler);
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'subscribe',
        group_id: groupId,
      });
    }
  }
  
  unsubscribeFromGroup(groupId: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(groupId) || [];
    const updatedHandlers = handlers.filter(h => h !== handler);
    
    if (updatedHandlers.length === 0) {
      this.messageHandlers.delete(groupId);
      
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'unsubscribe',
          group_id: groupId,
        });
      }
    } else {
      this.messageHandlers.set(groupId, updatedHandlers);
    }
  }
  
  sendMessage(data: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
}

const wsService = new WebSocketService();
export default wsService;