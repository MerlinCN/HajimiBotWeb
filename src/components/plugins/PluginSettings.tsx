import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Plugin, PluginSetting } from '../../types';
import { Pencil } from 'lucide-react';

interface PluginSettingsProps {
  plugin: Plugin;
  onSaveSettings: (settings: Record<string, any>) => void;
}

const PluginSettings: React.FC<PluginSettingsProps> = ({ plugin, onSaveSettings }) => {
  const [settings, setSettings] = useState<Record<string, any>>(
    plugin.settings.reduce((acc, setting) => ({ ...acc, [setting.key]: setting.value }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSettingKey, setActiveSettingKey] = useState<string>('');

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    await onSaveSettings(settings);
    setIsLoading(false);
    setHasChanges(false);
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
          <div className="flex items-center space-x-2">
            <Switch
              id={setting.key}
              checked={settings[setting.key] === true}
              onCheckedChange={(checked) => handleChange(setting.key, checked)}
            />
            <Label htmlFor={setting.key}>{setting.label}</Label>
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

      <div className="flex justify-end">
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
    </div>
  );
};

export default PluginSettings;