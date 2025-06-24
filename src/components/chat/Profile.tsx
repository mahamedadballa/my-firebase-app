'use client';

import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ref, update } from 'firebase/database';
import { useState } from 'react';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(user.name);

  const handleSignOut = async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'خطأ',
            description: "لم نتمكن من تسجيل الخروج."
        })
    }
  }

  const handleSaveChanges = async () => {
    const userRef = ref(db, `users/${user.uid}`);
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
        await update(userRef, { name, firstName, lastName });
        toast({
            title: "نجاح",
            description: "تم حفظ التغييرات."
        })
    } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: "خطأ",
            description: "لم نتمكن من حفظ التغييرات."
        })
    }
  }

  return (
    <div className="flex flex-col h-full text-right">
        <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">الملف الشخصي</h2>
            <p className="text-sm text-muted-foreground">قم بإدارة معلوماتك الشخصية.</p>
        </div>
        <div className="flex-1 p-6 space-y-8">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile picture" />
                        <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="absolute bottom-1 left-1 h-8 w-8 rounded-full bg-background">
                        <Camera className="h-4 w-4"/>
                        <span className="sr-only">تغيير صورة الملف الشخصي</span>
                    </Button>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.status === 'online' ? 'متصل' : 'غير متصل'}</p>
                </div>
            </div>
        
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">اسم العرض</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status-message">الحالة</Label>
                    <Input id="status-message" placeholder="أشعر أنني بحالة جيدة اليوم!" />
                </div>
            </div>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveChanges}>حفظ التغييرات</Button>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>تسجيل الخروج</Button>
        </div>
    </div>
  );
}
