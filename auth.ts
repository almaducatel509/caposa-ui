import { loginUser} from "@/app/lib/actions";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
// petit helper pour décoder le JWT sans dépendance externe
function decodeJwt<T = any>(token: string): T {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
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

        const { access } = result.details as { access: string; refresh: string };
        if (!access) return null;

        // 3) Décoder l’`access` pour extraire l’info utilisateur
        //    (SimpleJWT met typiquement user_id et/ou username selon ta config)
        const payload = decodeJwt<{ user_id?: number; username?: string }>(access);

        // 4) Retourner l'objet user attendu par NextAuth
        return {
         id: (payload.user_id ?? payload.username ?? username).toString(), // identifiant unique
         username: payload.username ?? username, // nom d'utilisateur
        //  email: payload.email,                   // email s'il existe
        //  roles: payload.roles || [],             // rôles éventuels
       };
      },
    }),
  ],
});

//  