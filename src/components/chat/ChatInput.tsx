'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, SendHorizontal, Mic, Image as ImageIcon } from 'lucide-react';
import { getMessageSuggestions } from '@/app/actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChatInputProps {
  onSendMessage: (text: string, type: 'text' | 'image') => void;
  chatHistory: string;
}

export default function ChatInput({ onSendMessage, chatHistory }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message.trim().length > 5) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        startTransition(async () => {
          const result = await getMessageSuggestions({
            chatHistory,
            userInput: message,
          });
          setSuggestions(result);
        });
      }, 500);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message, chatHistory]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, 'text');
      setMessage('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setSuggestions([]);
  };

  return (
    <div>
      {suggestions.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap justify-end">
          {suggestions.map((s, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => handleSuggestionClick(s)} className="rounded-full">
              {s}
            </Button>
          ))}
        </div>
      )}
      <div className="relative">
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="اكتب رسالة..."
          className="pl-24 min-h-[50px] resize-none text-right"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
           {message.trim() ? (
            <Button size="icon" onClick={handleSend} className="rounded-full bg-primary hover:bg-primary/90">
              <SendHorizontal className="h-5 w-5" />
            </Button>
          ) : (
             <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90">
              <Mic className="h-5 w-5" />
            </Button>
          )}
          <Popover>
             <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="h-5 w-5" /></Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-2">
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => onSendMessage('https://placehold.co/600x400.png', 'image')} data-ai-hint="shared picture">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
             </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
