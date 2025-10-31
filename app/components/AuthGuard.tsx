'use client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/login?callbackUrl=/dashboard"); // or keep whatever target you want
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null; // ou un loader j'ai besoin d'un loader

  return <>{children}</>;
}
