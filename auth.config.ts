import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: ["localhost"].includes(
    process.env.NEXT_PUBLIC_APP_DOMAIN || ""
  ),
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLogin = nextUrl.pathname === "/login";

      // Si la page est protégée (/dashboard), rediriger si non connecté
      if (isOnDashboard) {
        return isLoggedIn;
      }

      // Si l'utilisateur est connecté et essaie d'accéder à /login, rediriger vers /dashboard
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Toutes les autres pages sont accessibles à tous
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
