import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowRight, ShieldCheck, TrendingUp, Users, PiggyBank } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Accueil",
  description: "Plateforme moderne de gestion coopérative et microfinance CAPOSA",
};

export default async function Page() {
  // Redirection immédiate vers /dashboard si l'utilisateur est déjà connecté
  try {
    const session = await auth();
    if (session?.user) {
      const cookieStore = await cookies();
      const tokenName = process.env.TOKEN_NAME || process.env.NEXT_PUBLIC_TOKEN_NAME || "auth_token";
      const backendToken = cookieStore.get(tokenName)?.value;
      if (backendToken) {
        redirect("/dashboard");
      }
    }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err) {
      const digest = String((err as { digest?: string }).digest || "");
      if (digest.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-50 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-emerald-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900">CAPOSA</span>
              <span className="text-xs block text-emerald-700 font-medium -mt-1">Microfinance & Coopérative</span>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-all shadow-sm hover:shadow"
          >
            Se connecter
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Système Institutionnel Sécurisé
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl">
          Plateforme Moderne de Gestion Coopérative
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl font-normal">
          Gestion intégrée des membres, comptes d&apos;épargne, octroi de prêts, transactions de caisse et audit en temps réel.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-base transition-all shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-700/30"
          >
            Accéder à mon espace
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Value Props Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Membres & Comptes</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Ouverture de comptes, gestion des parts sociales, signatures numériques et suivi des fiches sociétaires.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Crédits & Échéanciers</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Simulation d&apos;amortissements, validation des garanties, décaissements et suivi rigoureux des remboursements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sécurité & Audit</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Sessions de caisse verrouillées, journal d&apos;audit infalsifiable et réconciliation automatique des soldes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/50 py-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} CAPOSA — Caisse Populaire Sainte-Anne. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
