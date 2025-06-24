'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, onValue, get, update } from 'firebase/database';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userRef = ref(db, `users/${fbUser.uid}`);
        onValue(userRef, async (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            
            // Backfill pistyId for existing users if it doesn't exist
            if (!userData.pistyId) {
              const generateUniquePistyId = async (): Promise<string> => {
                  const allUsersRef = ref(db, 'users');
                  const allUsersSnap = await get(allUsersRef);
                  const allUsersData = allUsersSnap.val() || {};
                  const existingIds = new Set(Object.values(allUsersData).map((u: any) => u.pistyId).filter(Boolean));
                  
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
              
              try {
                const newPistyId = await generateUniquePistyId();
                await update(userRef, { pistyId: newPistyId });
                userData.pistyId = newPistyId;
              } catch (error) {
                console.error("Failed to backfill pistyId", error)
              }
            }

            setUser({ ...userData, uid: fbUser.uid, id: fbUser.uid });
            setLoading(false);
          } else {
            router.push('/register');
            setLoading(false);
          }
        }, { onlyOnce: true });

      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);
  
    if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
      )
    }
  
    if (!user) {
      return null;
    }
  
    return <>{children}</>;
  };
