import React, { useState, useEffect } from 'react';
import { LogOut, MessageSquare, PlugIcon, Moon, Sun, Users, Menu } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { groupsApi } from '../services/api';
import { ChatGroup } from '../types';
import PluginManager from '../components/plugins/PluginManager';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, botInfo } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const fetchedGroups = await groupsApi.getGroups();
        setGroups(fetchedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsMobileMenuOpen(false);
  };

  const DashboardNavItems = () => (
    <>
      <TabsTrigger 
        value="overview" 
        className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-background"
        onClick={() => handleTabChange('overview')}
      >
        <Users className="h-4 w-4" />
        群聊总览
      </TabsTrigger>
      <TabsTrigger 
        value="plugins" 
        className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-background"
        onClick={() => handleTabChange('plugins')}
      >
        <PlugIcon className="h-4 w-4" />
        插件管理
      </TabsTrigger>
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0">
                <div className="flex h-16 items-center border-b px-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="ml-2 font-semibold">导航菜单</span>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                  <TabsList className="flex h-full w-full flex-col justify-start gap-2 bg-transparent p-4">
                    <DashboardNavItems />
                  </TabsList>
                </Tabs>
              </SheetContent>
            </Sheet>
            <div className="rounded-full bg-primary/10 p-1">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">QQ群聊机器人</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {botInfo && (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={botInfo.avatar_url} alt={botInfo.nickname} />
                  <AvatarFallback>{botInfo.nickname.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{botInfo.nickname}</p>
                  <p className="text-xs text-muted-foreground">QQ: {botInfo.qq}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex flex-1"
        >
          <div className="hidden w-[240px] border-r bg-muted/40 md:block">
            <TabsList className="flex w-full flex-col items-start gap-2 bg-transparent p-6 pt-16">
              <DashboardNavItems />
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="container p-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold">群聊总览</h2>
                    <p className="text-muted-foreground">
                      当前加入了 {groups.length} 个群聊
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="mb-4 h-16 w-16 text-muted-foreground" />
                      <h3 className="text-lg font-medium">暂无群聊</h3>
                      <p className="text-sm text-muted-foreground">
                        添加机器人到QQ群聊即可在此处显示
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {groups.map((group) => (
                        <div
                          key={group.group_id}
                          className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {group.members} 人
                            </span>
                          </div>
                          <h3 className="mb-2 text-lg font-semibold">
                            {group.group_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            群号：{group.group_id}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="plugins" className="h-full overflow-hidden m-0">
              <PluginManager />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;