import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { pluginsApi } from '../../services/api';
import { Plugin } from '../../types';
import { useToast } from '../../context/ToastContext';
import PluginSettings from './PluginSettings';
import PluginActions from './PluginActions';
import { PlusSquare as PluginSquare } from 'lucide-react';

const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPluginId, setSelectedPluginId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const fetchedPlugins = await pluginsApi.getPlugins();
        setPlugins(fetchedPlugins);
        
        if (fetchedPlugins.length > 0 && !selectedPluginId) {
          setSelectedPluginId(fetchedPlugins[0].id);
        }
      } catch (error) {
        addToast({
          title: '获取插件失败',
          description: '无法加载插件列表，请刷新页面重试',
          type: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlugins();
  }, [addToast, selectedPluginId]);

  const handleSaveSettings = async (pluginId: string, settings: Record<string, any>) => {
    try {
      await pluginsApi.updatePluginSettings(pluginId, settings);
      
      addToast({
        title: '保存成功',
        description: '插件设置已更新',
        type: 'success',
      });
      
      // Update local state
      setPlugins(plugins.map(plugin => 
        plugin.id === pluginId 
          ? {
              ...plugin,
              settings: plugin.settings.map(setting => ({
                ...setting,
                value: settings[setting.key] !== undefined ? settings[setting.key] : setting.value
              }))
            }
          : plugin
      ));
    } catch (error) {
      addToast({
        title: '保存失败',
        description: '无法保存插件设置，请重试',
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

  if (plugins.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <PluginSquare className="mb-4 h-16 w-16 text-muted-foreground" />
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
            {plugins.map((plugin) => (
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
          {plugins.map((plugin) => (
            <TabsContent
              key={plugin.id}
              value={plugin.id}
              className="h-full overflow-hidden data-[state=active]:animate-fade-in"
            >
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-8 p-6">
                  <div>
                    <h3 className="text-xl font-semibold">{plugin.name}</h3>
                    {plugin.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{plugin.description}</p>
                    )}
                  </div>
                  
                  <PluginSettings
                    plugin={plugin}
                    onSaveSettings={(settings) => handleSaveSettings(plugin.id, settings)}
                  />
                  
                  {plugin.actions.length > 0 && (
                    <PluginActions
                      pluginId={plugin.id}
                      actions={plugin.actions}
                      onTriggerAction={(actionEndpoint) => handleTriggerAction(plugin.id, actionEndpoint)}
                    />
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default PluginManager;