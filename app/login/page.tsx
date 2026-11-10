import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/app/login/login-form";
import { Loader2 } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCookie } from "cookies-next/server";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous pour accéder au panel admin",
};

interface LoginPageProps {
  searchParams?: Promise<{ expired?: string; callbackUrl?: string }>;
}

export default async function Home({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isExpired = params?.expired === "1";

  // Si on est redirigé pour cause d'expiration, on ne renvoie JAMAIS vers le dashboard
  if (!isExpired) {
    const session = await auth();
    const tokenName = process.env.TOKEN_NAME || process.env.NEXT_PUBLIC_TOKEN_NAME || "auth_token";
    const backendToken = await getCookie(tokenName, { cookies });

    // On ne redirige vers /dashboard que si NextAuth ET le jeton backend sont présents
    if (session?.user && backendToken) {
      redirect("/dashboard");
    }
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
