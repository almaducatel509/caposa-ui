import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/app/login/login-form";
import { Loader2 } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";


export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous pour accéder au panel admin",
};

export default async function  Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

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
