'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from 'react';
import { setCookie } from 'cookies-next';

const ACCESS_COOKIE = process.env.NEXT_PUBLIC_TOKEN_NAME || process.env.TOKEN_NAME || "auth_token";
const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_TOKEN || process.env.REFRESH_TOKEN || "refresh_token";

function TokenSyncer() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Si la session est non authentifiée ou en cours de chargement, ne rien synchroniser
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    // Si on est sur la page de login, ne pas réécrire les cookies
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
      return;
    }

    const access  = (session?.user as any)?.accessToken;
    const refresh = (session?.user as any)?.refreshToken;

    if (access) {
      setCookie(ACCESS_COOKIE, access, { path: '/', maxAge: 60 * 60 * 24 });
    }
    if (refresh) {
      setCookie(REFRESH_COOKIE, refresh, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    }
  }, [session, status]);

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
