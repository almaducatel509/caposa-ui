import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/app/login/login-form";
import { Loader2 } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous pour accéder au panel admin",
};

interface LoginPageProps {
  searchParams?: Promise<{ expired?: string; callbackUrl?: string }>;
}

export default async function Home(props?: LoginPageProps) {
  try {
    const searchParams = props?.searchParams ? await props.searchParams : undefined;
    const isExpired = searchParams?.expired === "1";

    // Si on arrive avec un flag d'expiration, on ne redirige jamais vers /dashboard
    if (!isExpired) {
      const session = await auth();
      if (session?.user) {
        const cookieStore = await cookies();
        const tokenName = process.env.TOKEN_NAME || process.env.NEXT_PUBLIC_TOKEN_NAME || "auth_token";
        const backendToken = cookieStore.get(tokenName)?.value;

        // On ne redirige vers /dashboard que si NextAuth ET le jeton backend sont présents
        if (backendToken) {
          redirect("/dashboard");
        }
      }
    }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err) {
      const digest = String((err as { digest?: string }).digest || "");
      if (digest.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
    }
    // En cas d'erreur de lecture de session ou de cookie, on affiche simplement le formulaire de connexion
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
