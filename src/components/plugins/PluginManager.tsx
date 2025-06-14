import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { pluginsApi } from '../../services/api';
import { Plugin } from '../../types';
import { useToast } from '../../context/ToastContext';
import PluginSettings from './PluginSettings';
import PluginActions from './PluginActions';
import { PlusIcon } from '@radix-ui/react-icons';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const PluginManager: React.FC = () => {
  const [pluginList, setPluginList] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [selectedPluginId, setSelectedPluginId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  // 获取插件列表
  useEffect(() => {
    const fetchPluginList = async () => {
      try {
        setIsLoading(true);
        const fetchedPlugins = await pluginsApi.getPlugins();
        setPluginList(fetchedPlugins);

        if (fetchedPlugins.length > 0 && !selectedPluginId) {
          setSelectedPluginId(fetchedPlugins[0].id);
        }
      } catch (error) {
        addToast({
          title: '获取插件失败',
          description: '无法加载插件列表，请刷新页面重试',
          type: 'destructive',
        });
        // 设置一个空的插件列表，防止循环请求
        setPluginList([]);
        setSelectedPluginId('');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPluginList();
  }, []);

  // 获取选中插件的配置
  useEffect(() => {
    const fetchPluginConfig = async () => {
      if (!selectedPluginId) return;

      try {
        setIsLoading(true);
        const pluginConfig = await pluginsApi.getPluginConfig(selectedPluginId);
        setSelectedPlugin(pluginConfig);
      } catch (error) {
        addToast({
          title: '获取插件配置失败',
          description: '无法加载插件配置，请重试',
          type: 'destructive',
        });
        // 设置一个空的插件配置，防止循环请求
        setSelectedPlugin({
          id: selectedPluginId,
          name: pluginList.find(p => p.id === selectedPluginId)?.name || '未知插件',
          description: '加载失败',
          settings: [],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPluginConfig();
  }, [selectedPluginId, pluginList]);

  const handleSaveSettings = async (pluginId: string, settings: Record<string, any>) => {
    try {
      await pluginsApi.updatePluginSettings(pluginId, settings);
      // 重新获取插件配置以更新本地状态
      const updatedPlugin = await pluginsApi.getPluginConfig(pluginId);
      setSelectedPlugin(updatedPlugin);
    } catch (error) {
      addToast({
        title: '获取插件设置失败',
        description: '无法获取插件设置，请重试',
        type: 'destructive',
      });
    }
  };

  const handleTriggerAction = async (pluginId: string, actionEndpoint: string) => {
    try {
      const result = await pluginsApi.triggerPluginAction(pluginId, actionEndpoint);

      addToast({
        title: result.success ? '操作成功' : '操作失败',
        description: result.message,
        type: result.success ? 'success' : 'destructive',
      });
    } catch (error) {
      addToast({
        title: '操作失败',
        description: '执行插件操作时发生错误',
        type: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (pluginList.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <PlusIcon className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">暂无插件</h2>
        <p className="text-muted-foreground">当前没有可用的插件</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs
        value={selectedPluginId}
        onValueChange={setSelectedPluginId}
        className="h-full flex flex-col"
      >
        <div className="border-b px-4">
          <TabsList className="my-2 bg-background">
            {pluginList.map((plugin) => (
              <TabsTrigger
                key={plugin.id}
                value={plugin.id}
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {plugin.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {selectedPlugin && (
            <TabsContent
              value={selectedPluginId}
              className="h-full overflow-hidden data-[state=active]:animate-fade-in"
            >
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-8 p-6">
                  <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedPlugin.description?.split('$').map((part, index) => {
                      if (index % 2 === 0) {
                        return <span key={index}>{part}</span>;
                      } else {
                        try {
                          const html = katex.renderToString(part, {
                            throwOnError: false,
                            strict: false,
                            displayMode: false,
                          });
                          return (
                            <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
                          );
                        } catch (error) {
                          console.error('KaTeX error:', error);
                          return <span key={index}>{part}</span>;
                        }
                      }
                    })}
                  </div>
                    <PluginSettings
                      plugin={selectedPlugin}
                      onSaveSettings={(settings) => handleSaveSettings(selectedPlugin.id, settings)}
                    />

                    {/* {selectedPlugin.actions.length > 0 && (
                      <PluginActions
                        pluginId={selectedPlugin.id}
                        actions={selectedPlugin.actions}
                        onTriggerAction={(actionEndpoint) => handleTriggerAction(selectedPlugin.id, actionEndpoint)}
                      />
                    )} */}
                  </div>
              </ScrollArea>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default PluginManager;