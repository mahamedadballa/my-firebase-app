'use client';

import type { User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { currentUser } from '@/lib/data';

interface ContactsListProps {
  users: User[];
}

export default function ContactsList({ users }: ContactsListProps) {
  const otherUsers = users.filter(u => u.id !== currentUser.id);
    
  return (
    <div className="flex flex-col h-full">
         <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">Contacts</h2>
            <p className="text-sm text-muted-foreground">Connect with others in your circle.</p>
        </div>
        <ScrollArea className="flex-1">
            <div className="flex flex-col">
            {otherUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                    <p className="font-semibold">{user.name}</p>
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <p className="text-xs text-muted-foreground">{user.status}</p>
                    </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MessageSquarePlus className="h-5 w-5" />
                    <span className="sr-only">Start chat with {user.name}</span>
                </Button>
                </div>
            ))}
            </div>
        </ScrollArea>
    </div>
  );
}
