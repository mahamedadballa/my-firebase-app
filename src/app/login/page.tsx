'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, type FirebaseError } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/chat/Logo';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (error) {
      const fbError = error as FirebaseError;
      console.error('Error signing in with Google:', fbError);
      toast({
        variant: 'destructive',
        title: 'خطأ في تسجيل الدخول',
        description: `حدث خطأ: ${fbError.message}`,
      });
    }
  };

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
        </CardContent>
      </Card>
    </div>
  );
}
