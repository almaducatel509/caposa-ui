'use client';

// app/not-found.tsx
// Page 404 CAPOSA — affichée automatiquement par Next.js pour toute URL inexistante.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F9F9F6] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">

        {/* Icône */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <SearchX className="w-8 h-8 text-[#2E7D32]" />
        </div>

        {/* Code */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32] mb-2">
          Erreur 404
        </p>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page introuvable
        </h1>

        {/* Explication */}
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Vérifiez l&apos;adresse, ou revenez au tableau de bord.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Page précédente
          </button>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#2E7D32] to-[#1B5E20] shadow-md hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>

        {/* Signature */}
        <p className="mt-8 text-xs text-gray-400">
          CAPOSA · Caisse Populaire Solidarité Pour l&apos;Avenir
        </p>
      </div>
    </main>
  );
}