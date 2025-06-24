'use client';

import type { Chat, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ChatListProps {
  chats: Chat[];
  allUsers: User[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  currentUser: User;
}

export default function ChatList({ chats, allUsers, selectedChatId, onSelectChat, currentUser }: ChatListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const getParticipant = (chat: Chat) => {
        if (!chat.participantIds) return null;
        const participantId = Object.keys(chat.participantIds).find(id => id !== currentUser.id);
        return allUsers.find(u => u.id === participantId) || null;
    }

    const filteredChats = useMemo(() => {
        return chats.filter(chat => {
            const participant = getParticipant(chat);
            return participant?.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [chats, searchTerm, allUsers, currentUser.id]);
    
  return (
    <div className="flex flex-col h-full text-right">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">المحادثات</h2>
        <div className="relative mt-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="ابحث في المحادثات..." 
                className="pr-9 text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filteredChats.map(chat => {
            const participant = getParticipant(chat);
            if (!participant) return null;

            const lastMessage = chat.lastMessage || (chat.messages && chat.messages[chat.messages.length - 1]);

            return (
              <button
                key={chat.id}
                className={cn(
                  'flex items-center gap-4 p-4 text-right hover:bg-muted/50 transition-colors w-full flex-row-reverse',
                  selectedChatId === chat.id && 'bg-muted'
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant?.avatar} alt={participant?.name} data-ai-hint="profile picture" />
                      <AvatarFallback>{participant?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {participant?.status === 'online' && <div className="absolute bottom-0 left-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />}
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-baseline justify-between flex-row-reverse">
                    <p className="font-semibold">{participant?.name}</p>
                    {lastMessage && lastMessage.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true, locale: ar })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between flex-row-reverse">
                    <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.type === 'image' ? "أرسل صورة" : lastMessage?.text}
                        {lastMessage?.senderId === currentUser.id && " :أنت"}
                    </p>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
