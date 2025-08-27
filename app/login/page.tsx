import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/app/login/login-form";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous pour accéder au panel admin",
};

export default function Home() {
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
