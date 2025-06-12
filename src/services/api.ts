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
    // 从 cookie 中获取 tokenF
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (token) {
      // 确保headers对象存在
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      // 清除 cookie 并重定向到登录页
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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

// Auth API
export const authApi = {
  login: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ message: string; code: number; token: string }>('/auth', { auth_token: token });
      
      if (response.data.code === 0) {
        // 设置 cookie
        document.cookie = `auth_token=${response.data.token}; path=/`;
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { success: false, message: 'Authentication failed' };
    }
  },

  logout: async (): Promise<void> => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  },
};

// Chat groups API
export const groupsApi = {
  getGroups: async (): Promise<ChatGroup[]> => {
    try {
      const response = await api.get<{ data: ChatGroup[] }>('/groups');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  },
};

// Plugins API
export const pluginsApi = {
  getPlugins: async (): Promise<{ id: string; name: string }[]> => {
    try {
      const listResponse = await api.get<{ data: { module_name: string; name: string }[] }>('/plugins');
      return listResponse.data.data.map(plugin => ({
        id: plugin.module_name,
        name: plugin.name
      }));
    } catch (error) {
      console.error('Error fetching plugins:', error);
      throw error;
    }
  },

  getPluginConfig: async (pluginId: string): Promise<Plugin> => {
    try {
      const detailResponse = await api.get<{ data: Array<{
        module_name: string;
        name: string;
        description: string;
        config: Record<string, any>;
      }> }>(`/plugins/config?module_name=${pluginId}`);
      
      if (detailResponse.data.data.length === 0) {
        throw new Error('Plugin not found');
      }

      const pluginInfo = detailResponse.data.data[0];
      return {
        id: pluginInfo.module_name,
        name: pluginInfo.name,
        description: pluginInfo.description,
        settings: Object.entries(pluginInfo.config).map(([key, config]) => ({
          key,
          type: config.input_type,
          value: config.value,
          label: config.title,
          description: config.description,
          options: Array.isArray(config.value) ? config.value : undefined
        })),
        actions: [] // 暂时不实现actions
      };
    } catch (error) {
      console.error('Error fetching plugin config:', error);
      throw error;
    }
  },

  updatePluginSettings: async (pluginId: string, settings: Record<string, any>): Promise<void> => {
    try {
      await api.post('/plugins/set_config', {
        module_name: pluginId,
        config: settings
      });
    } catch (error) {
      console.error('Error updating plugin settings:', error);
      throw error;
    }
  },

  triggerPluginAction: async (pluginId: string, actionEndpoint: string): Promise<{ success: boolean; message: string }> => {
    // 由于后端API没有提供action相关的接口，暂时保持原有的模拟实现
    await new Promise(resolve => setTimeout(resolve, 1000));

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
  }
};

export default api;