'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, set, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Logo } from '@/components/chat/Logo';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
    firstName: z.string().min(2, { message: "الاسم الأول يجب أن يكون حرفين على الأقل." }),
    lastName: z.string().min(2, { message: "اسم العائلة يجب أن يكون حرفين على الأقل." }),
    phone: z.string().optional(),
});


export default function RegisterPage() {
  const { firebaseUser, user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        // Not authenticated, send to login
        router.push('/login');
      } else if (user) {
        // Authenticated and already has a profile, send to main app
        router.push('/');
      } else if (firebaseUser?.displayName) {
        // New user, pre-fill from Google account if available
        const nameParts = firebaseUser.displayName.split(' ');
        form.setValue('firstName', nameParts[0] || '');
        form.setValue('lastName', nameParts.slice(1).join(' ') || '');
      }
    }
  }, [firebaseUser, user, loading, router, form]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firebaseUser) {
        toast({
            variant: 'destructive',
            title: 'خطأ',
            description: 'يجب أن تكون مسجلاً للدخول لإكمال التسجيل.',
          });
      return;
    }

    const generateUniquePistyId = async (): Promise<string> => {
        const usersRef = ref(db, 'users');
        const allUsersSnap = await get(usersRef);
        const allUsersData = allUsersSnap.val() || {};
        const existingIds = new Set(Object.values(allUsersData).map((u: any) => u.pistyId));

        let newId = '';
        let isUnique = false;
        while (!isUnique) {
            newId = Math.floor(100000000 + Math.random() * 900000000).toString();
            if (!existingIds.has(newId)) {
                isUnique = true;
            }
        }
        return newId;
    };

    const pistyId = await generateUniquePistyId();

    const newUser = {
        uid: firebaseUser.uid,
        pistyId,
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || `https://placehold.co/100x100.png`,
        firstName: values.firstName,
        lastName: values.lastName,
        name: `${values.firstName} ${values.lastName}`,
        phone: values.phone,
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

  if (loading || !firebaseUser || user) {
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-right">
               <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الأول</FormLabel>
                    <FormControl>
                      <Input placeholder="الاسم الأول" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العائلة</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم العائلة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="رقم الهاتف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "جاري الحفظ..." : "حفظ ومتابعة"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
