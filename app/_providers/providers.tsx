'use client';

import { SessionProvider } from "next-auth/react";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setCookie } from 'cookies-next';

const ACCESS_COOKIE = process.env.NEXT_PUBLIC_TOKEN_NAME || "auth_token";
const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_TOKEN || "refresh_token";

function TokenSyncer() {
  const { data: session } = useSession();

  useEffect(() => {
    const access  = (session?.user as any)?.accessToken;
    const refresh = (session?.user as any)?.refreshToken;

    if (access) {
      setCookie(ACCESS_COOKIE, access, { path: '/', maxAge: 60 * 60 * 24 });
    }
    if (refresh) {
      setCookie(REFRESH_COOKIE, refresh, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    }
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenSyncer />
      {children}
    </SessionProvider>
  );
}
