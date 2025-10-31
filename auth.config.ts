import type { NextAuthConfig } from "next-auth";
export const authConfig = {
  trustHost: ["localhost"].includes(
    process.env.NEXT_PUBLIC_APP_DOMAIN || ""
  ),
  pages: {
    signIn: "/login",
  },
  providers: [], // Les providers seront ajoutés dans auth.ts
} satisfies NextAuthConfig;