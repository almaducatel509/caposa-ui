import type { NextAuthConfig } from "next-auth";
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [], // Les providers seront ajoutés dans auth.ts
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
// C:\Users\alma2\Documents\Final Project\caposa-ui\auth.config.ts
// auth.config.ts — Config de base, séparée exprès pour rester compatible 
// edge runtime (Next.js middleware tourne en edge, qui ne supporte pas certains modules Node). 
// Il ne contient que ce qui est edge-safe : pages, trustHost, session.strategy. 
// Les providers sont vides ici et remplis dans auth.ts 
// pattern standard NextAuth v5 pour que le middleware puisse importer authConfig sans faire planter l'edge runtime.