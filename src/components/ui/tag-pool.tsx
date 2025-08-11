import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { X, Plus } from 'lucide-react';

interface TagPoolProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  description?: string;
}

const TagPool: React.FC<TagPoolProps> = ({
  label,
  value = [],
  onChange,
  placeholder = '添加新项目',
  description
}) => {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(value[index]);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && !value.includes(editValue.trim())) {
      const newValue = [...value];
      newValue[editingIndex!] = editValue.trim();
      onChange(newValue);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'add') {
        handleAdd();
      } else {
        handleSaveEdit();
      }
    } else if (e.key === 'Escape' && action === 'edit') {
      handleCancelEdit();
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* 标签池容器 */}
      <div className="min-h-[100px] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-4">
        {/* 标签显示区域 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((tag, index) => (
            <div
              key={index}
              className="group flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm"
            >
              {editingIndex === index ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, 'edit')}
                  onBlur={handleSaveEdit}
                  className="h-6 min-w-[80px] px-1 py-0 text-xs flex-1"
                  autoFocus
                />
              ) : (
                <>
                  <span 
                    className="text-primary font-medium cursor-pointer hover:underline flex-1"
                    onClick={() => handleEdit(index)}
                  >
                    {tag}
                  </span>
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 p-0 hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          
        </div>

        {/* 输入框和添加按钮 */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, 'add')}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            onClick={handleAdd}
            disabled={!inputValue.trim() || value.includes(inputValue.trim())}
            size="sm"
          >
            <Plus className="h-4 w-4" />
            添加
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TagPool;