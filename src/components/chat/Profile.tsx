'use client';

import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Copy, Share2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ref, update } from 'firebase/database';
import { useState } from 'react';
import QRCode from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  const handleCopyId = () => {
    if (!user.pistyId) return;
    navigator.clipboard.writeText(user.pistyId);
    toast({
        title: "تم النسخ",
        description: "تم نسخ الـ ID الخاص بك.",
    });
  }

  return (
    <div className="flex flex-col h-full text-right">
        <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">الملف الشخصي</h2>
            <p className="text-sm text-muted-foreground">قم بإدارة معلوماتك الشخصية.</p>
        </div>
        <div className="flex-1 p-6 space-y-6">
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
                     <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                        {user.pistyId ? (
                            <>
                                <span>ID: {user.pistyId}</span>
                                <button onClick={handleCopyId} className="p-1 hover:bg-muted rounded-md" aria-label="Copy ID">
                                    <Copy className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <span>جاري إنشاء الـ ID...</span>
                        )}
                    </div>
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

            <div className="space-y-2">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveChanges}>حفظ التغييرات</Button>
                
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" disabled={!user.pistyId}>
                           <Share2 className="ml-2 h-4 w-4"/> مشاركة الملف الشخصي
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md text-right">
                        <DialogHeader>
                            <DialogTitle>مشاركة ملفك الشخصي</DialogTitle>
                            <DialogDescription>
                                يمكن للآخرين إضافتك باستخدام الـ ID أو عن طريق مسح هذا الرمز.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-4 space-y-4">
                            <div className="p-4 bg-white rounded-lg">
                                <QRCode value={user.pistyId || ''} size={160} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg">{user.name}</p>
                                <p className="text-muted-foreground">ID: {user.pistyId}</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full" onClick={handleSignOut}>تسجيل الخروج</Button>
            </div>
        </div>
    </div>
  );
}
