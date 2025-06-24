'use client';

import type { Chat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChats = useMemo(() => {
        return chats.filter(chat => {
            const participant = chat.participants.find(p => p.id !== currentUser.id);
            return participant?.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [chats, searchTerm]);
    
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">Chats</h2>
        <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search chats..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filteredChats.map(chat => {
            const participant = chat.participants.find(p => p.id !== currentUser.id);
            const lastMessage = chat.messages[chat.messages.length - 1];

            return (
              <button
                key={chat.id}
                className={cn(
                  'flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors w-full',
                  selectedChatId === chat.id && 'bg-muted'
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant?.avatar} alt={participant?.name} data-ai-hint="profile picture" />
                      <AvatarFallback>{participant?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {participant?.status === 'online' && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />}
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold">{participant?.name}</p>
                    {lastMessage && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.senderId === currentUser.id && "You: "}
                        {lastMessage?.type === 'image' ? "Sent an image" : lastMessage?.text}
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
