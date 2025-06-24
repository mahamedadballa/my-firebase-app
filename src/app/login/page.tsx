'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/chat/Logo';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // The AuthContext will handle redirection automatically.
    } catch (error) {
      const fbError = error as FirebaseError;

      if (fbError.code === 'auth/popup-closed-by-user' || fbError.code === 'auth/cancelled-popup-request') {
        // This is a user action, not a system error.
        // We can show a gentle notification, but no need to log it as an error.
        toast({
          title: 'تم إلغاء تسجيل الدخول',
          description: 'لقد أغلقت نافذة تسجيل الدخول. يمكنك المحاولة مرة أخرى.',
        });
        return;
      }
      
      console.error('Error signing in with Google:', fbError.code, fbError.message);
      
      let description = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      if (fbError.code === 'auth/invalid-credential' || fbError.code === 'auth/user-disabled' ) {
        description = 'بيانات الاعتماد غير صالحة أو تم تعطيل المستخدم.';
      } else if (fbError.code === 'auth/unauthorized-domain') {
        description = 'هذا النطاق غير مصرح له. يرجى الاتصال بالدعم.';
      } else if (fbError.message.includes('INVALID_LOGIN_CREDENTIALS') || fbError.message.includes('The requested action is invalid')) {
        description = 'بيانات الاعتماد المقدمة غير صحيحة أو أن الإجراء المطلوب غير صالح. تأكد من صحة إعدادات Firebase.';
      }

      toast({
        variant: 'destructive',
        title: 'خطأ في تسجيل الدخول',
        description: description,
      });
    }
  };

  if (loading || user) {
    return <div className="flex min-h-screen items-center justify-center bg-background p-4">جاري التحميل...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">مرحباً بك في Pisty</CardTitle>
          <CardDescription>سجّل دخولك للمتابعة إلى المحادثات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button onClick={handleGoogleSignIn} className="w-full">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-67.4 64.8C309.1 101.4 279.9 88 248 88c-73.2 0-133.1 59.2-133.1 131.9s59.9 131.9 133.1 131.9c76.2 0 119.4-49.2 123.9-73.2h-124V261.8h238.2z"></path></svg>
              تسجيل الدخول باستخدام جوجل
            </Button>
            {/* Phone auth can be added here */}
          </div>
           <p className="mt-4 text-xs text-muted-foreground text-center">
            إذا واجهت مشكلة، تأكد من تفعيل "Google" كطريقة تسجيل دخول في إعدادات المصادقة بمشروع Firebase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
