'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/chat/Logo';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, loading, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
        toast({
            variant: 'destructive',
            title: 'خطأ',
            description: 'يجب أن تكون مسجلاً للدخول لإكمال التسجيل.',
          });
      return;
    }
    if (!formData.firstName || !formData.lastName) {
        toast({
            variant: 'destructive',
            title: 'حقول مطلوبة',
            description: 'الاسم الأول واسم العائلة حقول إلزامية.',
          });
        return;
    }

    const newUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        status: 'online',
    };

    try {
      await set(ref(db, `users/${firebaseUser.uid}`), newUser);
      toast({
        title: 'نجاح',
        description: 'تم إكمال التسجيل بنجاح!',
      });
      router.push('/');
    } catch (error) {
      console.error('Error saving user data:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في التسجيل',
        description: 'حدث خطأ أثناء حفظ بياناتك. يرجى المحاولة مرة أخرى.',
      });
    }
  };

  if (loading || !firebaseUser) {
    return <div className="flex h-screen w-full items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">إكمال التسجيل</CardTitle>
          <CardDescription>نحتاج بعض المعلومات الإضافية للبدء.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">الاسم الأول</Label>
              <Input id="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">اسم العائلة</Label>
              <Input id="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
            </div>
            <Button type="submit" className="w-full">
              حفظ ومتابعة
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
