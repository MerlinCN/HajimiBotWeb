import React, { useState, useEffect } from 'react';
import { ExitIcon, HomeIcon, ChatBubbleIcon, GearIcon, MoonIcon, SunIcon, HamburgerMenuIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PluginManager from '../components/plugins/PluginManager';
import GroupList from '../components/chat/GroupList';
import SendMessage from '../components/message/SendMessage';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, botInfo, userRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsMobileMenuOpen(false);
  };

  // 如果用户权限下访问插件管理页面，自动跳转到发送消息页面
  useEffect(() => {
    if (userRole === 'user' && activeTab === 'plugins') {
      setActiveTab('send-message');
    }
  }, [userRole, activeTab]);

  const DashboardNavItems = () => (
    <>
      <TabsTrigger 
        value="overview" 
        className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-background"
        onClick={() => handleTabChange('overview')}
      >
        <ChatBubbleIcon className="h-4 w-4" />
        群聊总览
      </TabsTrigger>
      <TabsTrigger 
        value="send-message" 
        className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-background"
        onClick={() => handleTabChange('send-message')}
      >
        <PaperPlaneIcon className="h-4 w-4" />
        发送消息
      </TabsTrigger>
      {userRole === 'admin' && (
        <TabsTrigger 
          value="plugins" 
          className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-background"
          onClick={() => handleTabChange('plugins')}
        >
          <GearIcon className="h-4 w-4" />
          插件管理
        </TabsTrigger>
      )}
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b h-16 flex items-center px-4">
        <div className="flex items-center gap-2 flex-1">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <HamburgerMenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <div className="flex h-16 items-center border-b px-4">
                <ChatBubbleIcon className="h-5 w-5 text-primary" />
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
            <HomeIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold">管理后台</h1>
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
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout}>
            <ExitIcon className="h-5 w-5" />
          </Button>
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
                      查看机器人加入的所有群聊
                    </p>
                  </div>

                  <GroupList viewMode="grid" />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="send-message" className="h-full overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="container max-w-2xl p-6">
                  <SendMessage />
                </div>
              </ScrollArea>
            </TabsContent>
            
            {userRole === 'admin' && (
              <TabsContent value="plugins" className="h-full overflow-hidden m-0">
                <PluginManager />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;