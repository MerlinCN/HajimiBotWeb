import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Plugin, PluginSetting } from '../../types';
import { Pencil, Plus, Minus, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { pluginsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// 添加全局样式
const numberInputStyles = `
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

interface PluginSettingsProps {
  plugin: Plugin;
  onSaveSettings: (settings: Record<string, any>) => void;
}

const PluginSettings: React.FC<PluginSettingsProps> = ({ plugin, onSaveSettings }) => {
  const [settings, setSettings] = useState<Record<string, any>>(
    plugin.settings.reduce((acc, setting) => ({ ...acc, [setting.key]: setting.value }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSettingKey, setActiveSettingKey] = useState<string>('');
  const [reloadDialogOpen, setReloadDialogOpen] = useState(false);
  const { addToast } = useToast();
  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await api.post('/plugins/set_config', {
        module_name: plugin.id,
        config: settings
      });

      if (response.data.code === 0) {
        addToast({
          title: "成功",
          description: "设置保存成功",
          type: "success"
        });
        await onSaveSettings(settings);
        setHasChanges(false);
      } else {
        addToast({
          title: "错误",
          description: response.data.message || '保存失败',
          type: "destructive"
        });
      }
    } catch (error) {
      addToast({
        title: "错误",
        description: "保存设置时发生错误",
        type: "destructive"
      });
      console.error('保存设置错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    if (isReloading) return;
    setIsReloading(true);
    try {
      const result = await api.get(`/plugins/reload?module_name=${plugin.id}`);
      if (result.data.code === 0) {
        addToast({
          title: "成功",
          description: result.data.message || "插件重新加载成功",
          type: "success"
        });
        // 重新获取插件数据
        const updatedPlugin = await pluginsApi.getPluginConfig(plugin.id);
        onSaveSettings(updatedPlugin.settings.reduce((acc: Record<string, any>, setting: PluginSetting) => ({ ...acc, [setting.key]: setting.value }), {}));
      } else {
        addToast({
          title: "错误",
          description: result.data.message || "插件重新加载失败",
          type: "destructive"
        });
      }
    } catch (error) {
      addToast({
        title: "错误",
        description: "插件重新加载时发生错误",
        type: "destructive"
      });
      console.error('重新加载插件错误:', error);
    } finally {
      setIsReloading(false);
      setReloadDialogOpen(false);
    }
  };

  const openMultilineDialog = (key: string) => {
    setActiveSettingKey(key);
    setDialogOpen(true);
  };

  const handleDialogSave = (value: string) => {
    handleChange(activeSettingKey, value);
    setDialogOpen(false);
  };

  const renderSettingField = (setting: PluginSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <div className="flex items-center">
              <Switch
                id={setting.key}
                checked={settings[setting.key] === true}
                onCheckedChange={(checked) => handleChange(setting.key, checked)}
              />
            </div>
          </div>
        );
      case 'string':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <div className="flex gap-2">
              <Input
                id={setting.key}
                value={settings[setting.key] || ''}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                placeholder={`输入${setting.label}`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => openMultilineDialog(setting.key)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 'stringArray':
        const values = settings[setting.key] || [''];
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <div className="space-y-2">
              {(values.length === 0 ? [''] : values).map((value: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    id={`${setting.key}-${index}`}
                    value={value}
                    onChange={(e) => {
                      const newValues = [...values];
                      newValues[index] = e.target.value;
                      handleChange(setting.key, newValues);
                    }}
                    placeholder={`输入${setting.label}`}
                  />
                  {values.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newValues = values.filter((_: string, i: number) => i !== index);
                        handleChange(setting.key, newValues.length ? newValues : ['']);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  {index === values.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        handleChange(setting.key, [...values, '']);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'numberArray':
        const numberValues = settings[setting.key] || [];
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <div className="space-y-2">
              {(numberValues.length === 0 ? [''] : numberValues).map((value: number | string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    id={`${setting.key}-${index}`}
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const newValues = [...numberValues];
                      newValues[index] = e.target.value === '' ? '' : Number(e.target.value);
                      // 过滤掉空值
                      const filteredValues = newValues.filter(v => v !== '');
                      handleChange(setting.key, filteredValues.length ? filteredValues : []);
                    }}
                    placeholder={`输入${setting.label}`}
                  />
                  {numberValues.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newValues = numberValues.filter((_: number | string, i: number) => i !== index);
                        handleChange(setting.key, newValues.length ? newValues : []);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  {index === numberValues.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        handleChange(setting.key, [...numberValues, '']);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <Input
              id={setting.key}
              type="number"
              value={settings[setting.key] || 0}
              onChange={(e) => handleChange(setting.key, Number(e.target.value))}
            />
          </div>
        );
      case 'array':
        if (Array.isArray(setting.options)) {
          return (
            <div className="space-y-2">
              <Label htmlFor={setting.key}>{setting.label}</Label>
              <Select
                value={String(settings[setting.key])}
                onValueChange={(value) => handleChange(setting.key, value)}
              >
                <SelectTrigger id={setting.key}>
                  <SelectValue placeholder={`选择${setting.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {setting.options.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  if (plugin.settings.length === 0) {
    return (
      <div className="rounded-md bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">此插件没有可配置的设置项</p>
      </div>
    );
  }

  const activeSetting = plugin.settings.find(s => s.key === activeSettingKey);
  const dialogTitleId = "plugin-settings-dialog-title";

  return (
    <div className="space-y-6">
      <style>{numberInputStyles}</style>
      <div>
        <h4 className="text-lg font-medium">插件设置</h4>
        <p className="text-sm text-muted-foreground">配置此插件的行为和响应方式</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plugin.settings.map((setting) => (
          <div key={setting.key} className="space-y-2">
            {renderSettingField(setting)}
            {setting.description && (
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        {plugin.can_reload && (
          <Button
            variant="outline"
            onClick={() => setReloadDialogOpen(true)}
            disabled={isReloading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
            重新加载
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
        >
          保存设置
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-labelledby={dialogTitleId}>
          <DialogHeader>
            <DialogTitle id={dialogTitleId}>{activeSetting?.label || '编辑内容'}</DialogTitle>
            <DialogDescription>
              在此处编辑多行文本内容
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={settings[activeSettingKey] || ''}
              onChange={(e) => handleChange(activeSettingKey, e.target.value)}
              placeholder={`输入${activeSetting?.label || ''}`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => handleDialogSave(settings[activeSettingKey])}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reloadDialogOpen} onOpenChange={setReloadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>❗注意</DialogTitle>
            <DialogDescription>
              重新加载插件是危险且未知的行为，是否继续？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReloadDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleReload}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PluginSettings;