'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';


interface CoffreDashboardHeaderProps {
   periodLabel?: string;   // ex: "7 derniers jours"

}

export default function CoffreDashboardHeader({
   periodLabel,

}: CoffreDashboardHeaderProps) {
  return (
    <div className="mb-6 print:mb-4">

      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 print:hidden">
        <Link href="/dashboard" className="hover:text-[#2E7D32] flex items-center gap-1">
          <Home className="w-3 h-3" />
          Tableau de bord
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link
          href="/dashboard/treasury"
          className="hover:text-[#2E7D32] transition-colors"
        >
          Trésorerie
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="font-medium text-gray-700">Coffre</span>
      </nav>

      {/* ── Header ── */}
     <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* 🧾 TITRE */}
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Coffre
            </h1>
            {/* Badge période */}
            {periodLabel && (
              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                {periodLabel}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Gestion des liquidités et mouvements de trésorerie
          </p>
        </div>

        

      </div>
    </div>
  );
}