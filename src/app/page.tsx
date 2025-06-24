'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MessageSquare, Users, UserCircle, Settings, KeyRound } from 'lucide-react';
import type { Chat, Message, User } from '@/lib/types';
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
import { ProtectedRoute, useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, set, get, child } from 'firebase/database';

type View = 'chats' | 'contacts' | 'profile' | 'settings';

function ChatPage() {
  const isMobile = useIsMobile();
  const { user: currentUser } = useAuth();
  const [view, setView] = useState<View>('chats');
  const [chats, setChats] = useState<Chat[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        if (usersData) {
            const usersList = Object.entries(usersData).map(([uid, data]) => ({
              ...(data as Omit<User, 'id' | 'uid'>),
              id: uid,
              uid,
            }));
            setAllUsers(usersList);
        }
    });

    const userChatsRef = ref(db, `user-chats/${currentUser.uid}`);
    const unsubscribeChats = onValue(userChatsRef, async (snapshot) => {
        const userChatIds = snapshot.val();
        if (userChatIds) {
            const chatPromises = Object.keys(userChatIds).map(chatId => 
                get(child(ref(db), `chats/${chatId}`))
            );
            const chatSnapshots = await Promise.all(chatPromises);
            
            const fetchedChats = chatSnapshots.map(snap => ({
                ...snap.val(),
                id: snap.key,
                messages: snap.val().messages ? Object.values(snap.val().messages) : []
            })).filter(Boolean);

            setChats(fetchedChats as Chat[]);
            if(!selectedChatId && fetchedChats.length > 0) {
              setSelectedChatId(fetchedChats[0].id)
            }
        }
    });

    return () => {
        unsubscribeUsers();
        unsubscribeChats();
    }
  }, [currentUser, selectedChatId]);
  
  const selectedChat = useMemo(() => {
    const chat = chats.find(c => c.id === selectedChatId);
    if (chat && allUsers.length > 0) {
        const participantIds = Object.keys(chat.participantIds);
        chat.participants = participantIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    }
    return chat;
  }, [chats, selectedChatId, allUsers]);

  const handleSendMessage = (chatId: string, text: string, type: 'text' | 'image' = 'text') => {
    if (!currentUser) return;
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    const newMessage: Omit<Message, 'id'> = {
      senderId: currentUser.id,
      text,
      timestamp: serverTimestamp() as any, // Firebase will replace this
      status: 'sent',
      type,
    };
    set(newMessageRef, newMessage);

    const chatRef = ref(db, `chats/${chatId}`);
    set(child(chatRef, 'lastMessage'), newMessage);
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
        <TooltipContent side="left" sideOffset={5}>{label}</TooltipContent>
      </Tooltip>
  );

  const listViewContent = () => {
    if (!currentUser) return null;
    switch(view) {
      case 'chats':
        return <ChatList chats={chats} allUsers={allUsers} selectedChatId={selectedChatId} onSelectChat={handleSelectChat} currentUser={currentUser} />;
      case 'contacts':
        return <ContactsList users={allUsers} currentUser={currentUser} onSelectChat={handleSelectChat} setView={setView} />;
      case 'profile':
        return <Profile user={currentUser} />;
      case 'settings':
         return (
          <div className="p-4 text-right">
            <h2 className="text-xl font-bold mb-4">الإعدادات</h2>
            <div className="flex items-center space-x-2 justify-end">
                <p>التشفير من طرف إلى طرف مفعل</p>
                <KeyRound className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        )
    }
  }

  if (!currentUser) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-full bg-background flex-row-reverse">
        <aside className="flex flex-col items-center gap-4 border-l bg-card px-2 py-4 sm:px-4">
          <div className="mb-2">
            <Logo />
          </div>
          <Separator />
          <nav className="flex flex-col items-center gap-2 mt-4">
            <NavItem navView="chats" label="المحادثات"><MessageSquare /></NavItem>
            <NavItem navView="contacts" label="جهات الاتصال"><Users /></NavItem>
            <NavItem navView="profile" label="الملف الشخصي"><UserCircle /></NavItem>
          </nav>
          <div className="mt-auto flex flex-col items-center gap-2">
            <NavItem navView="settings" label="الإعدادات"><Settings /></NavItem>
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
            <div className="w-[380px] border-l bg-card flex flex-col">
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
                  <h2 className="mt-4 text-xl font-semibold">مرحباً بك في Pisty</h2>
                  <p className="text-muted-foreground">اختر محادثة من القائمة لبدء الدردشة.</p>
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}


export default function Page() {
  return (
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  )
}
