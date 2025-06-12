export interface User {
  user_id: string;
  nickname: string;
  avatar_url: string;
}

export interface BotInfo {
  qq: string;
  nickname: string;
  avatar_url: string;
}

export interface ChatGroup {
  group_id: string;
  group_name: string;
  members: number;
  last_message?: ChatMessage;
}

export interface ChatMessage {
  user_id: string;
  nickname: string;
  avatar_url: string;
  content: string;
  timestamp: string;
}

export interface PluginAction {
  name: string;
  endpoint: string;
}

export type PluginSettingType = 
  | 'boolean' 
  | 'string' 
  | 'number' 
  | 'array' 
  | 'object'
  | 'stringArray';

export interface PluginSetting {
  key: string;
  type: PluginSettingType;
  label: string;
  value: any;
  options?: string[] | number[];
  description?: string;
}

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  settings: PluginSetting[];
  actions: PluginAction[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  bot?: BotInfo;
}