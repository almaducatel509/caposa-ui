'use client';

import Link from 'next/link';
import { ChevronRight, Home, FileDown, Printer } from 'lucide-react';

interface VaultHistoryHeaderProps {
  periodLabel?: string;   // ex: "7 derniers jours"
  onExportPDF?: () => void;
  onPrint?: () => void;
}

export default function VaultHistoryHeader({
  periodLabel,
  onExportPDF,
  onPrint,
}: VaultHistoryHeaderProps) {
  return (
    <div className="mb-6 print:mb-4">

      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 print:hidden">
        <Link href="/dashboard" className="hover:text-[#2E7D32] flex items-center gap-1">
          <Home className="w-3 h-3" />
          Tableau de bord
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link href="/dashboard/treasury" className="hover:text-[#2E7D32]">
          Trésorerie
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link href="/dashboard/treasury/vault" className="hover:text-[#2E7D32]">
          Coffre
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="font-medium text-gray-700">Historique</span>
      </nav>

      {/* ── Header principal ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* 🧾 TITRE */}
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Historique du coffre
            </h1>

            {/* Badge période */}
            {periodLabel && (
              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                {periodLabel}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Suivi des entrées, sorties et mouvements de trésorerie
          </p>
        </div>

        {/* ⚙️ ACTIONS */}
        <div className="flex items-center gap-2 print:hidden">

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
            >
              <FileDown className="w-4 h-4" />
              Exporter PDF
            </button>
          )}

          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#2E7D32] text-white text-sm font-medium hover:bg-[#256628] transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          )}

        </div>

      </div>
    </div>
  );
}