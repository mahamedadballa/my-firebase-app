'use client';

import type { Message, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

interface ChatMessageProps {
  message: Message;
  sender: User;
  isCurrentUser: boolean;
  showAvatar: boolean;
}

export default function ChatMessage({ message, sender, isCurrentUser, showAvatar }: ChatMessageProps) {
    const MessageStatus = () => {
        if (message.status === 'read') return <CheckCheck className="h-4 w-4 text-primary" />;
        if (message.status === 'delivered') return <CheckCheck className="h-4 w-4" />;
        return <Check className="h-4 w-4" />;
    };

    return (
        <div className={cn(
            "flex items-end gap-2",
            isCurrentUser ? "justify-start flex-row-reverse" : "justify-start"
        )}>
            {!isCurrentUser && (
                <div className="w-8">
                {showAvatar && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={sender.avatar} alt={sender.name} data-ai-hint="profile picture"/>
                        <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                </div>
            )}
            
            <div className={cn(
                "max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2",
                isCurrentUser 
                    ? "bg-primary text-primary-foreground rounded-bl-none"
                    : "bg-card text-card-foreground rounded-br-none border"
            )}>
                {message.type === 'image' ? (
                    <Image 
                        src={message.text}
                        alt="صورة مشتركة"
                        width={300}
                        height={200}
                        className="rounded-lg"
                        data-ai-hint="shared image"
                    />
                ) : (
                    <p className="text-sm whitespace-pre-wrap text-right">{message.text}</p>
                )}

                 <div className={cn("flex items-center gap-2 mt-1", isCurrentUser ? 'justify-start' : 'justify-end')}>
                    <p className={cn(
                        "text-xs",
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                        {message.timestamp ? format(new Date(message.timestamp), 'p', { locale: ar }) : ''}
                    </p>
                    {isCurrentUser && <MessageStatus />}
                </div>
            </div>

            {isCurrentUser && (
                 <div className="w-8">
                    {/* Placeholder for symmetry */}
                 </div>
            )}
        </div>
    );
}
