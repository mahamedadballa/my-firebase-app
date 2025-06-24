'use client';

import type { User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { ref, set, get, child, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface ContactsListProps {
  users: User[];
  currentUser: User;
  onSelectChat: (id: string) => void;
  setView: (view: 'chats' | 'contacts' | 'profile' | 'settings') => void;
}

export default function ContactsList({ users, currentUser, onSelectChat, setView }: ContactsListProps) {
  const otherUsers = users.filter(u => u.id !== currentUser.id);
  const { toast } = useToast();
    
  const handleStartChat = async (user: User) => {
    if (!currentUser) return;
    const chatId = [currentUser.id, user.id].sort().join('-');

    const chatRef = ref(db, `chats/${chatId}`);
    const chatSnap = await get(chatRef);

    if (!chatSnap.exists()) {
        try {
            await set(chatRef, {
                participantIds: {
                    [currentUser.id]: true,
                    [user.id]: true
                },
                createdAt: new Date().toISOString()
            });

            await set(ref(db, `user-chats/${currentUser.id}/${chatId}`), true);
            await set(ref(db, `user-chats/${user.id}/${chatId}`), true);
            
        } catch(e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: "خطأ",
                description: "لم نتمكن من بدء المحادثة."
            })
            return;
        }
    }
    onSelectChat(chatId);
    setView('chats');
  }

  return (
    <div className="flex flex-col h-full text-right">
         <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">جهات الاتصال</h2>
            <p className="text-sm text-muted-foreground">تواصل مع الآخرين في دائرتك.</p>
        </div>
        <ScrollArea className="flex-1">
            <div className="flex flex-col">
            {otherUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors flex-row-reverse">
                <div className="flex items-center gap-4 flex-row-reverse">
                    <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                    <p className="font-semibold">{user.name}</p>
                    <div className="flex items-center gap-2 flex-row-reverse">
                        <p className="text-xs text-muted-foreground">{user.status === 'online' ? 'متصل' : 'غير متصل'}</p>
                        <div className={`h-2 w-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleStartChat(user)}>
                    <MessageSquarePlus className="h-5 w-5" />
                    <span className="sr-only">بدء محادثة مع {user.name}</span>
                </Button>
                </div>
            ))}
            </div>
        </ScrollArea>
    </div>
  );
}
