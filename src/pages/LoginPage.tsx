import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '../components/ui/alert-dialog';

const LoginPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('请输入有效的令牌');
      setShowError(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(token);
      
      if (!result.success) {
        setError(result.message || '登录失败，请检查您的令牌');
        setShowError(true);
      } else {
        addToast({
          title: '登录成功',
          description: result.message || '欢迎回来！',
          type: 'success',
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录时发生错误，请重试');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-fade-in space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">QQ群聊机器人管理系统</h1>
          <p className="text-sm text-muted-foreground">登录以访问控制面板</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token">访问令牌</Label>
            <Input
              id="token"
              type="password"
              placeholder="请输入您的访问令牌"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full"
              autoComplete="off"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? '验证中...' : '登录'}
          </Button>
        </form>
      </div>

      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>登录失败</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoginPage;