import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { PluginAction } from '../../types';

interface ActionParameter {
  name: string;
  type: 'string' | 'number';
  label: string;
  required?: boolean;
}

// Actions that require parameters
const ACTION_PARAMETERS: Record<string, ActionParameter[]> = {
  'run-task': [
    {
      name: 'taskId',
      type: 'string',
      label: '任务ID',
      required: true
    }
  ],
  'import-config': [
    {
      name: 'configContent',
      type: 'string',
      label: '配置内容',
      required: true
    }
  ],
  'update-keywords': [
    {
      name: 'keywords',
      type: 'string',
      label: '关键词列表',
      required: true
    },
    {
      name: 'category',
      type: 'string',
      label: '分类',
      required: false
    }
  ]
};

interface PluginActionsProps {
  pluginId: string;
  actions: PluginAction[];
  onTriggerAction: (actionEndpoint: string, params?: Record<string, any>) => Promise<void>;
}

const PluginActions: React.FC<PluginActionsProps> = ({ 
  pluginId, 
  actions, 
  onTriggerAction 
}) => {
  const [actionStates, setActionStates] = useState<Record<string, boolean>>(
    actions.reduce((acc, action) => ({ ...acc, [action.endpoint]: false }), {})
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<PluginAction | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});

  const handleActionClick = async (action: PluginAction) => {
    const params = ACTION_PARAMETERS[action.endpoint];
    if (params) {
      setActiveAction(action);
      setParameters({});
      setDialogOpen(true);
    } else {
      handleTriggerAction(action.endpoint);
    }
  };

  const handleTriggerAction = async (actionEndpoint: string, params?: Record<string, any>) => {
    setActionStates((prev) => ({ ...prev, [actionEndpoint]: true }));
    
    try {
      await onTriggerAction(actionEndpoint, params);
    } finally {
      setActionStates((prev) => ({ ...prev, [actionEndpoint]: false }));
      setDialogOpen(false);
    }
  };

  const handleDialogSubmit = () => {
    if (!activeAction) return;

    const params = ACTION_PARAMETERS[activeAction.endpoint];
    if (params) {
      const missingRequired = params.some(
        param => param.required && !parameters[param.name]
      );
      
      if (missingRequired) return;
      
      handleTriggerAction(activeAction.endpoint, parameters);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium">插件操作</h4>
        <p className="text-sm text-muted-foreground">手动触发此插件的功能</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <div key={action.endpoint} className="space-y-1">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              isLoading={actionStates[action.endpoint]}
              disabled={actionStates[action.endpoint]}
              onClick={() => handleActionClick(action)}
            >
              <PlayCircle className="h-4 w-4" />
              {action.name}
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeAction?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {activeAction && ACTION_PARAMETERS[activeAction.endpoint]?.map((param) => (
              <div key={param.name} className="space-y-2">
                <Label htmlFor={param.name}>
                  {param.label}
                  {param.required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id={param.name}
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={parameters[param.name] || ''}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    [param.name]: e.target.value
                  }))}
                  placeholder={`请输入${param.label}`}
                />
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleDialogSubmit}
              disabled={
                !activeAction || 
                !ACTION_PARAMETERS[activeAction.endpoint]?.every(
                  param => !param.required || parameters[param.name]
                )
              }
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PluginActions;