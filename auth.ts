import { loginUser} from "@/app/lib/actions";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
// petit helper pour décoder le JWT sans dépendance externe
// pour décoder un JWT dans un environnement moderne (NextAuth v5, Next.js 16, Edge Runtime).
export function decodeJwt<T = any>(token: string): T {
  const [, payload] = token.split(".");

  // Base64URL → Base64 + padding correct
  const base64 = payload
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(payload.length + (4 - (payload.length % 4)) % 4, "=");

  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));

  return JSON.parse(new TextDecoder().decode(bytes));
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt", // Important pour Credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1) Valider les champs
        const parsed = z.object({
          username: z.string().min(3),
          password: z.string().min(6),
        }).safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        // 2) Login côté Django -> récupère { access, refresh }
        const result = await loginUser(username, password);
        if (!result.success) return null;

        const { access, refresh } = result.details as { access: string; refresh: string };
        if (!access) return null;

        // 3) Décoder l’`access` pour extraire l’info utilisateur
        //    (SimpleJWT met typiquement user_id et/ou username selon ta config)
        const payload = decodeJwt<{ user_id?: number; username?: string }>(access);

        // 4) Retourner l'objet user attendu par NextAuth username: YT1; passwd: 123456 et securepassword123 Aluser
      //   return {
      //    id: (payload.user_id ?? payload.username ?? username).toString(), // identifiant unique
      //    username: payload.username ?? username, // nom d'utilisateur
      //   //  email: payload.email,                   // email s'il existe
      //   //  roles: payload.roles || [],             // rôles éventuels
      //  };
      
       const ADMIN_USERNAMES = ["YT1", "Karimc", "Claudin"]; // 👈 mets tes admins ici
        return {
          id: (payload.user_id ?? payload.username ?? username).toString(),
          username: payload.username ?? username,
          isAdmin: ADMIN_USERNAMES.includes(payload.username ?? username), // 👈 ajout
          accessToken: access,   // 👈 ajouter
          refreshToken: refresh, // 👈 ajouter
        };
      },
    }),
  ],callbacks: {
  // async jwt({ token, user }) {
  //   if (user) {
  //     token.username = (user as any).username;
  //     token.isAdmin = (user as any).isAdmin;
  //   }
  //   return token;
  // },
  async jwt({ token, user }) {
    if (user) {
      token.name = (user as any).name;
      token.email = (user as any).email;
      token.username = (user as any).username;
      token.isAdmin = (user as any).isAdmin;
      token.accessToken  = (user as any).accessToken;  // new
      token.refreshToken = (user as any).refreshToken; // new
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      (session.user as any).username = token.username;
      (session.user as any).isAdmin = token.isAdmin;
      (session.user as any).accessToken   = token.accessToken;  // new
      (session.user as any).refreshToken  = token.refreshToken; // new
    session.user.name = token.username as string;
    }
    return session;
  },
},
});
// vérifier qu'aucun serializer custom n'ajoute des données sensibles au token.
// # settings.py
// SIMPLE_JWT = {
//     'SIGNING_KEY': SECRET_KEY,  # ← doit venir de .env, jamais hardcodé
// }
//  C:\Users\alma2\Documents\Final Project\caposa-ui\auth.ts