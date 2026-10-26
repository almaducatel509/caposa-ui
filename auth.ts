import { loginUser } from "@/app/lib/actions";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { normalizeRoles } from "@/app/lib/roles";
//C:\Users\alma2\Documents\Final Project\caposa-ui\auth.ts

// Décode le payload d'un JWT sans dépendance externe (compatible Edge Runtime).
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

        // 2) Login côté Django → { access, refresh, roles }
        const result = await loginUser(username, password);
        if (!result.success) return null;

        const { access, refresh, roles } = result.details as {
          access: string;
          refresh: string;
          roles?: unknown;
        };
        if (!access) return null;

        // 3) Le JWT SimpleJWT ne contient que user_id (+ exp, iat…)
        const payload = decodeJwt<{ user_id?: number; username?: string }>(access);

        // 4) Rôles renvoyés par Django au login, normalisés
        //    ("Trésorier" → "tresorier", accents et casse ignorés)
        const normalizedRoles = normalizeRoles(roles);

        // ⚠️ Temporaire : garde la liste en dur tant que le poste « administrateur »
        //    n'est pas assigné en base. À supprimer ensuite (isAdmin = rôle).
        const ADMIN_USERNAMES = ["YT1", "Karimc", "Claudin"];
        const finalUsername = payload.username ?? username;

        return {
          id: (payload.user_id ?? finalUsername).toString(),
          username: finalUsername,
          roles: normalizedRoles,
          isAdmin:
            normalizedRoles.includes("administrateur") ||
            ADMIN_USERNAMES.includes(finalUsername),
          accessToken: access,
          refreshToken: refresh,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = (user as any).name;
        token.email = (user as any).email;
        token.username = (user as any).username;
        token.roles = (user as any).roles ?? [];
        token.isAdmin = (user as any).isAdmin;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).username = token.username;
        (session.user as any).roles = token.roles ?? [];
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
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