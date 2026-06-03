import type { NextAuthConfig } from "next-auth";
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [], // Les providers seront ajoutés dans auth.ts
} satisfies NextAuthConfig;
// C:\Users\alma2\Documents\Final Project\caposa-ui\auth.config.ts