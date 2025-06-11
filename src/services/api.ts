import axios from 'axios';
import { AuthResponse, ChatGroup, ChatMessage, Plugin, BotInfo } from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
});

// Add request interceptor to handle auth
api.interceptors.request.use(
  (config) => {
    // Add any request headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock bot info
const mockBotInfo: BotInfo = {
  qq: "2854196310",
  nickname: "小助手",
  avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=2854196310"
};

// Mock chat groups
const mockGroups: ChatGroup[] = [
  {
    group_id: "123456789",
    group_name: "技术交流群",
    members: 512,
    last_message: {
      user_id: "987654321",
      nickname: "张三",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=987654321",
      content: "有人了解 React 18 的新特性吗？",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    }
  },
  {
    group_id: "987654321",
    group_name: "游戏玩家群",
    members: 328,
    last_message: {
      user_id: "123456789",
      nickname: "李四",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=123456789",
      content: "今晚八点开黑！",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    }
  },
  {
    group_id: "456789123",
    group_name: "美食分享群",
    members: 256,
    last_message: {
      user_id: "456789123",
      nickname: "王五",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=456789123",
      content: "分享一个超简单的红烧肉做法！[图片]",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString()
    }
  },
  {
    group_id: "789123456",
    group_name: "电影爱好者",
    members: 421,
    last_message: {
      user_id: "789123456",
      nickname: "赵六",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=789123456",
      content: "新上映的《沙丘2》太震撼了！",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString()
    }
  }
];

// Mock messages for each group
const mockMessages: Record<string, ChatMessage[]> = {
  "123456789": [
    {
      user_id: "111222333",
      nickname: "小明",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=111222333",
      content: "大家好，我是新来的",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString()
    },
    {
      user_id: "444555666",
      nickname: "小红",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=444555666",
      content: "欢迎欢迎！",
      timestamp: new Date(Date.now() - 115 * 60000).toISOString()
    },
    {
      user_id: "777888999",
      nickname: "小华",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=777888999",
      content: "最近在学习 React，感觉很有意思",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString()
    },
    {
      user_id: "987654321",
      nickname: "张三",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=987654321",
      content: "有人了解 React 18 的新特性吗？",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    }
  ],
  "987654321": [
    {
      user_id: "999888777",
      nickname: "游戏达人",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=999888777",
      content: "有人玩《原神》吗？",
      timestamp: new Date(Date.now() - 90 * 60000).toISOString()
    },
    {
      user_id: "666555444",
      nickname: "电竞迷",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=666555444",
      content: "我在，现在什么版本了？",
      timestamp: new Date(Date.now() - 85 * 60000).toISOString()
    },
    {
      user_id: "333222111",
      nickname: "休闲玩家",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=333222111",
      content: "4.5版本，最近出了新角色",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      user_id: "123456789",
      nickname: "李四",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=123456789",
      content: "今晚八点开黑！",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    }
  ],
  "456789123": [
    {
      user_id: "888777666",
      nickname: "美食家",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=888777666",
      content: "今天去吃了一家新开的火锅店",
      timestamp: new Date(Date.now() - 180 * 60000).toISOString()
    },
    {
      user_id: "555444333",
      nickname: "吃货一号",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=555444333",
      content: "在哪里啊？好吃吗？",
      timestamp: new Date(Date.now() - 175 * 60000).toISOString()
    },
    {
      user_id: "222111000",
      nickname: "厨艺达人",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=222111000",
      content: "我也想去尝尝！",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString()
    },
    {
      user_id: "456789123",
      nickname: "王五",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=456789123",
      content: "分享一个超简单的红烧肉做法！[图片]",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString()
    }
  ],
  "789123456": [
    {
      user_id: "777666555",
      nickname: "影迷",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=777666555",
      content: "最近有什么好电影推荐吗？",
      timestamp: new Date(Date.now() - 240 * 60000).toISOString()
    },
    {
      user_id: "444333222",
      nickname: "影评人",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=444333222",
      content: "《奥本海默》很不错",
      timestamp: new Date(Date.now() - 235 * 60000).toISOString()
    },
    {
      user_id: "111000999",
      nickname: "电影控",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=111000999",
      content: "我也推荐这部，克里斯托弗·诺兰导演的作品都很棒",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString()
    },
    {
      user_id: "789123456",
      nickname: "赵六",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=789123456",
      content: "新上映的《沙丘2》太震撼了！",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString()
    }
  ]
};

// Auth API
export const authApi = {
  login: async (token: string): Promise<AuthResponse> => {
    // For testing purposes, accept test_token_123456
    if (token === 'test_token_123456') {
      // Store the token for future use
      localStorage.setItem('auth_token', token);
      document.cookie = `auth_token=${token}; path=/`;
      return { success: true, bot: mockBotInfo };
    }

    try {
      const response = await api.post<AuthResponse>('/auth', { token });
      if (response.data.success) {
        localStorage.setItem('auth_token', token);
        document.cookie = `auth_token=${token}; path=/`;
      }
      return response.data;
    } catch (error) {
      return { success: false, message: 'Authentication failed' };
    }
  },
  
  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  },
};

// Chat groups API
export const groupsApi = {
  getGroups: async (): Promise<ChatGroup[]> => {
    try {
      const response = await api.get<ChatGroup[]>('/groups');
      // For demo purposes, return mock groups
      return Promise.resolve(mockGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      return mockGroups;
    }
  },
  
  getGroupMessages: async (groupId: string): Promise<ChatMessage[]> => {
    try {
      const response = await api.get<ChatMessage[]>(`/groups/${groupId}/messages`);
      // For demo purposes, return mock messages
      return Promise.resolve(mockMessages[groupId] || []);
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return mockMessages[groupId] || [];
    }
  },
};

// Mock plugins data
const mockPlugins: Plugin[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT 助手',
    description: '使用 ChatGPT API 为群聊提供智能对话功能',
    settings: [
      {
        key: 'api_key',
        type: 'string',
        label: 'API 密钥',
        value: '',
        description: '输入您的 OpenAI API 密钥'
      },
      {
        key: 'model',
        type: 'array',
        label: '模型选择',
        value: 'gpt-3.5-turbo',
        options: ['gpt-3.5-turbo', 'gpt-4'],
        description: '选择要使用的 ChatGPT 模型'
      },
      {
        key: 'temperature',
        type: 'number',
        label: '随机性',
        value: 0.7,
        description: '控制回答的随机性，0-1之间'
      },
      {
        key: 'max_tokens',
        type: 'number',
        label: '最大长度',
        value: 2000,
        description: '单次回复的最大字符数'
      },
      {
        key: 'auto_reply',
        type: 'boolean',
        label: '自动回复',
        value: true,
        description: '是否自动回复@机器人的消息'
      },
      {
        key: 'system_prompt',
        type: 'string',
        label: '系统提示词',
        value: '你是一个友善的AI助手',
        description: '设置AI助手的角色和行为'
      }
    ],
    actions: [
      {
        name: '清理上下文',
        endpoint: 'clear-context'
      },
      {
        name: '测试连接',
        endpoint: 'test-connection'
      },
      {
        name: '导出对话',
        endpoint: 'export-chat'
      },
      {
        name: '重置设置',
        endpoint: 'reset-settings'
      }
    ]
  },
  {
    id: 'welcome',
    name: '欢迎插件',
    description: '自动欢迎新成员加入群聊',
    settings: [
      {
        key: 'welcome_message',
        type: 'string',
        label: '欢迎语',
        value: '欢迎 {nickname} 加入群聊！',
        description: '使用 {nickname} 表示新成员的昵称'
      },
      {
        key: 'send_image',
        type: 'boolean',
        label: '发送图片',
        value: true,
        description: '是否同时发送欢迎图片'
      },
      {
        key: 'image_url',
        type: 'string',
        label: '图片链接',
        value: '',
        description: '自定义欢迎图片的URL'
      },
      {
        key: 'delay',
        type: 'number',
        label: '延迟发送',
        value: 0,
        description: '欢迎消息延迟发送的秒数'
      },
      {
        key: 'welcome_style',
        type: 'array',
        label: '欢迎样式',
        value: 'simple',
        options: ['simple', 'card', 'image'],
        description: '选择欢迎消息的显示样式'
      }
    ],
    actions: [
      {
        name: '发送测试欢迎语',
        endpoint: 'test-welcome'
      },
      {
        name: '预览欢迎卡片',
        endpoint: 'preview-card'
      }
    ]
  },
  {
    id: 'moderation',
    name: '内容审核',
    description: '自动审核群聊消息，过滤不当内容',
    settings: [
      {
        key: 'filter_level',
        type: 'array',
        label: '过滤等级',
        value: 'medium',
        options: ['low', 'medium', 'high'],
        description: '设置内容过滤的严格程度'
      },
      {
        key: 'auto_delete',
        type: 'boolean',
        label: '自动删除',
        value: false,
        description: '是否自动删除违规消息'
      },
      {
        key: 'notify_admins',
        type: 'boolean',
        label: '通知管理员',
        value: true,
        description: '发现违规内容时是否通知管理员'
      },
      {
        key: 'warning_message',
        type: 'string',
        label: '警告消息',
        value: '请注意群规，避免发送违规内容',
        description: '发现违规内容时的提醒消息'
      },
      {
        key: 'max_warnings',
        type: 'number',
        label: '最大警告次数',
        value: 3,
        description: '达到此次数将被禁言'
      },
      {
        key: 'mute_duration',
        type: 'number',
        label: '禁言时长',
        value: 300,
        description: '违规禁言的时长（秒）'
      }
    ],
    actions: [
      {
        name: '查看违规记录',
        endpoint: 'view-logs'
      },
      {
        name: '更新过滤词库',
        endpoint: 'update-keywords'
      },
      {
        name: '导出审核报告',
        endpoint: 'export-report'
      },
      {
        name: '清理警告记录',
        endpoint: 'clear-warnings'
      }
    ]
  },
  {
    id: 'schedule',
    name: '定时任务',
    description: '设置定时发送消息和执行任务',
    settings: [
      {
        key: 'timezone',
        type: 'array',
        label: '时区',
        value: 'Asia/Shanghai',
        options: ['Asia/Shanghai', 'UTC', 'America/New_York'],
        description: '设置定时任务的时区'
      },
      {
        key: 'notify_changes',
        type: 'boolean',
        label: '变更通知',
        value: true,
        description: '任务变更时是否通知管理员'
      },
      {
        key: 'max_tasks',
        type: 'number',
        label: '最大任务数',
        value: 10,
        description: '每个群可以设置的最大定时任务数'
      },
      {
        key: 'default_reminder',
        type: 'number',
        label: '默认提醒时间',
        value: 300,
        description: '任务执行前提醒时间（秒）'
      }
    ],
    actions: [
      {
        name: '查看所有任务',
        endpoint: 'list-tasks'
      },
      {
        name: '立即执行任务',
        endpoint: 'run-task'
      },
      {
        name: '暂停所有任务',
        endpoint: 'pause-all'
      },
      {
        name: '导入任务配置',
        endpoint: 'import-config'
      }
    ]
  }
];

// Plugins API
export const pluginsApi = {
  getPlugins: async (): Promise<Plugin[]> => {
    try {
      const response = await fetch('/api/plugins');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // 转换API返回的数据格式为前端需要的格式
      return data.data.map((plugin: any) => ({
        id: plugin.module_name,
        name: plugin.name,
        description: plugin.description,
        settings: Object.entries(plugin.config).map(([key, config]: [string, any]) => ({
          key,
          type: Array.isArray(config.value) ? 'array' : typeof config.value === 'boolean' ? 'boolean' : typeof config.value === 'number' ? 'number' : 'string',
          value: config.value,
          label: config.title,
          description: config.description,
          options: Array.isArray(config.value) ? config.value : undefined
        })),
        actions: [] // 暂时不实现actions
      }));
    } catch (error) {
      console.error('Error fetching plugins:', error);
      throw error;
    }
  },
  
  updatePluginSettings: async (pluginId: string, settings: Record<string, any>): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update mock data
    const plugin = mockPlugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.settings.forEach(setting => {
        if (settings[setting.key] !== undefined) {
          setting.value = settings[setting.key];
        }
      });
    }
    
    return Promise.resolve();
  },
  
  triggerPluginAction: async (pluginId: string, actionEndpoint: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock responses for different actions
    const responses: Record<string, { success: boolean; message: string }> = {
      'clear-context': {
        success: true,
        message: '已清理所有上下文对话历史'
      },
      'test-connection': {
        success: true,
        message: 'API 连接测试成功'
      },
      'export-chat': {
        success: true,
        message: '对话记录已导出到 chat_history.json'
      },
      'reset-settings': {
        success: true,
        message: '设置已重置为默认值'
      },
      'test-welcome': {
        success: true,
        message: '已发送测试欢迎消息'
      },
      'preview-card': {
        success: true,
        message: '欢迎卡片预览已生成'
      },
      'view-logs': {
        success: true,
        message: '最近7天共发现12条违规内容'
      },
      'update-keywords': {
        success: true,
        message: '过滤词库已更新，新增500个关键词'
      },
      'export-report': {
        success: true,
        message: '审核报告已导出到 moderation_report.pdf'
      },
      'clear-warnings': {
        success: true,
        message: '已清理30天前的警告记录'
      },
      'list-tasks': {
        success: true,
        message: '当前共有8个定时任务在运行'
      },
      'run-task': {
        success: true,
        message: '已手动触发选定的任务'
      },
      'pause-all': {
        success: true,
        message: '所有定时任务已暂停'
      },
      'import-config': {
        success: true,
        message: '成功导入5个任务配置'
      }
    };
    
    return responses[actionEndpoint] || {
      success: false,
      message: '未知的操作'
    };
  },
};

export default api;