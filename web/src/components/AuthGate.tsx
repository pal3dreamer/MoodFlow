'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname?.startsWith('/auth');

  useEffect(() => {
    if (!isAuthRoute && status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router, isAuthRoute]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-950 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null;
}
