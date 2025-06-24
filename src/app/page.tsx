'use client';

import React, { useState, useMemo } from 'react';
import { MessageSquare, Users, UserCircle, Settings, KeyRound } from 'lucide-react';
import { initialChats, initialUsers, currentUser } from '@/lib/data';
import type { Chat, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/chat/Logo';
import ChatList from '@/components/chat/ChatList';
import ChatView from '@/components/chat/ChatView';
import ContactsList from '@/components/chat/ContactsList';
import Profile from '@/components/chat/Profile';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type View = 'chats' | 'contacts' | 'profile' | 'settings';

export default function ChatPage() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>('chats');
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats.length > 0 ? chats[0].id : null);
  
  const selectedChat = useMemo(() => chats.find(c => c.id === selectedChatId), [chats, selectedChatId]);

  const handleSendMessage = (chatId: string, text: string, type: 'text' | 'image' = 'text') => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            text,
            timestamp: new Date(),
            status: 'sent',
            type,
          };
          return { ...chat, messages: [...chat.messages, newMessage] };
        }
        return chat;
      });
    });

    // Simulate message delivery status updates
    setTimeout(() => {
        setChats(prev => prev.map(c => c.id === chatId ? {...c, messages: c.messages.map(m => m.id.startsWith('msg-') ? {...m, status: 'delivered'} : m) } : c))
    }, 1000);
    setTimeout(() => {
        setChats(prev => prev.map(c => c.id === chatId ? {...c, messages: c.messages.map(m => m.id.startsWith('msg-') ? {...m, status: 'read'} : m) } : c))
    }, 3000);
  };
  
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    if(isMobile) {
      setView('chats');
    }
  }

  const NavItem = ({ navView, label, children }: { navView: View, label: string, children: React.ReactNode }) => (
     <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-lg",
              view === navView && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            )}
            onClick={() => setView(navView)}
            aria-label={label}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>{label}</TooltipContent>
      </Tooltip>
  );

  const listViewContent = () => {
    switch(view) {
      case 'chats':
        return <ChatList chats={chats} selectedChatId={selectedChatId} onSelectChat={handleSelectChat} />;
      case 'contacts':
        return <ContactsList users={initialUsers} />;
      case 'profile':
        return <Profile user={currentUser} />;
      case 'settings':
         return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <p>End-to-end Encryption Enabled</p>
            </div>
          </div>
        )
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-full bg-background">
        <aside className="flex flex-col items-center gap-4 border-r bg-card px-2 py-4 sm:px-4">
          <div className="mb-2">
            <Logo />
          </div>
          <Separator />
          <nav className="flex flex-col items-center gap-2 mt-4">
            <NavItem navView="chats" label="Chats"><MessageSquare /></NavItem>
            <NavItem navView="contacts" label="Contacts"><Users /></NavItem>
            <NavItem navView="profile" label="Profile"><UserCircle /></NavItem>
          </nav>
          <div className="mt-auto flex flex-col items-center gap-2">
            <NavItem navView="settings" label="Settings"><Settings /></NavItem>
          </div>
        </aside>

        {isMobile ? (
          <main className="flex-1">
             {selectedChatId && selectedChat ? (
                <ChatView
                  key={selectedChat.id}
                  chat={selectedChat}
                  currentUser={currentUser}
                  onSendMessage={handleSendMessage}
                  onBack={() => setSelectedChatId(null)}
                />
             ) : (
                <div className="h-full flex flex-col">
                  {listViewContent()}
                </div>
             )}
          </main>
        ) : (
          <>
            <div className="w-[380px] border-r bg-card flex flex-col">
               {listViewContent()}
            </div>
            <main className="flex-1">
              {selectedChat ? (
                <ChatView
                  key={selectedChat.id}
                  chat={selectedChat}
                  currentUser={currentUser}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center bg-muted/20 text-center p-4">
                  <MessageSquare className="h-16 w-16 text-muted-foreground" />
                  <h2 className="mt-4 text-xl font-semibold">Welcome to CircleChat</h2>
                  <p className="text-muted-foreground">Select a chat from the list to start a conversation.</p>
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
