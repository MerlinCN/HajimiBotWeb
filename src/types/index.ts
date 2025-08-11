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
  group_member_count: number;
  group_avatar: string;
}

export interface ChatMessage {
  user_id: string;
  nickname: string;
  avatar_url: string;
  content: string;
  timestamp: string;
}

export interface ConfigField {
  value: unknown;
  title: string;
  description: string;
  default: unknown;
  input_type: string;
}

export interface PluginConfig {
  fields: Record<string, ConfigField>;
}

export interface PluginInfo {
  module_name: string;
  name: string;
  description: string;
  config: PluginConfig;
  can_reload?: boolean;
}

export interface PluginInfoResponse {
  data: PluginInfo;
}

export type PluginSettingType = 
  | 'boolean' 
  | 'string' 
  | 'number' 
  | 'array' 
  | 'object'
  | 'stringArray'
  | 'numberArray'
  | 'groupArray';

export interface PluginSetting {
  key: string;
  type: PluginSettingType;
  label: string;
  value: unknown;
  options?: string[] | number[];
  description?: string;
  default?: unknown;
}

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  settings: PluginSetting[];
  can_reload?: boolean;
  actions?: PluginAction[];
}

export interface PluginAction {
  name: string;
  endpoint: string;
  description?: string;
}

export type UserRole = 'admin' | 'user';

export interface AuthResponse {
  success: boolean;
  message?: string;
  bot?: BotInfo;
  role?: UserRole;
}