import 'next-auth';
import 'next-auth/jwt';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    username?: string;
    isAdmin?: boolean;
  }

  interface Session {
    user: {
      username?: string;
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string;
    isAdmin?: boolean;
  }
}