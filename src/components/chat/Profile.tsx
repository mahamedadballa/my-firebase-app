'use client';

import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  return (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">Profile</h2>
            <p className="text-sm text-muted-foreground">Manage your personal information.</p>
        </div>
        <div className="flex-1 p-6 space-y-8">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile picture" />
                        <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background">
                        <Camera className="h-4 w-4"/>
                        <span className="sr-only">Change profile picture</span>
                    </Button>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.status}</p>
                </div>
            </div>
        
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status-message">Status</Label>
                    <Input id="status-message" placeholder="Feeling great today!" />
                </div>
            </div>

            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
        </div>
    </div>
  );
}
