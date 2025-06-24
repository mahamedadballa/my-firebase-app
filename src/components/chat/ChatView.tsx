'use client';

import React, { useRef, useEffect } from 'react';
import type { Chat, User } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, MoreVertical, ArrowRight, Phone, Video } from 'lucide-react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

interface ChatViewProps {
  chat: Chat;
  currentUser: User;
  onSendMessage: (chatId: string, text: string, type?: 'text' | 'image') => void;
  onBack?: () => void;
}

export default function ChatView({ chat, currentUser, onSendMessage, onBack }: ChatViewProps) {
  const isMobile = useIsMobile();
  const participant = chat.participants.find(p => p.id !== currentUser.id);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
        setTimeout(() => {
            if (scrollViewportRef.current) {
                scrollViewportRef.current.scrollTo({
                    top: scrollViewportRef.current.scrollHeight,
                    behavior: 'smooth',
                  });
            }
        }, 100)
    }
  }, [chat.messages, chat.id]);

  const getChatHistory = () => {
    return chat.messages
      .map(
        (m) =>
          `${m.senderId === currentUser.id ? 'أنت' : participant?.name}: ${m.text}`
      )
      .join('\n');
  };

  if (!participant) return null;
  const sortedMessages = [...(chat.messages || [])].sort((a, b) => a.timestamp - b.timestamp);


  return (
    <div className="flex flex-col h-screen bg-muted/20">
      <header className="flex items-center justify-between p-3 border-b bg-card shadow-sm text-right">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Video className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon"><Phone className="h-5 w-5"/></Button>
        </div>
        <div className="flex items-center gap-3 flex-row-reverse">
          {isMobile && onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
           <div>
            <h3 className="font-semibold text-lg">{participant.name}</h3>
            <p className="text-xs text-muted-foreground">{participant.status === 'online' ? 'متصل' : 'غير متصل'}</p>
          </div>
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={participant.avatar} alt={participant.name} data-ai-hint="profile picture"/>
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {participant.status === 'online' && <div className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />}
          </div>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4" viewportRef={scrollViewportRef}>
        <div className="flex flex-col gap-4">
            <div className="flex justify-center my-4">
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                <p>الرسائل مشفرة من طرف إلى طرف.</p>
                <Lock className="h-3 w-3" />
              </div>
            </div>
            {sortedMessages.map((message, index) => {
                 const showAvatar = index === 0 || sortedMessages[index - 1].senderId !== message.senderId;
                 return <ChatMessage key={message.id} message={message} sender={message.senderId === currentUser.id ? currentUser : participant} isCurrentUser={message.senderId === currentUser.id} showAvatar={showAvatar}/>
            })}
        </div>
      </ScrollArea>
      <footer className="p-3 border-t bg-card">
        <ChatInput
          onSendMessage={(text, type) => onSendMessage(chat.id, text, type)}
          chatHistory={getChatHistory()}
        />
      </footer>
    </div>
  );
}
