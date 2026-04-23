'use client';
import Link from 'next/link';
import { ChevronRight, Home, FileDown, Printer } from 'lucide-react';
import AuditConformityBadge, { ConformityStatus } from './AuditConformityBadge';

interface AuditHeaderProps {
  sessionId:       string;
  sessionLabel:    string;    // ex: "C-02"
  caissierNom:     string;    // ex: "Alice Pierre"
  dateSession:     string;    // ex: "21/04/2026"
  conformity:      ConformityStatus;
  onExportPDF?:    () => void;
  onPrint?:        () => void;
}

export default function AuditHeader({
  sessionId, sessionLabel, caissierNom, dateSession,
  conformity, onExportPDF, onPrint,
}: AuditHeaderProps) {
  return (
    <div className="mb-6 print:mb-4">

      {/* ── Breadcrumbs (masqué à l'impression) ── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 print:hidden">
        <Link href="/dashboard" className="hover:text-[#2E7D32] flex items-center gap-1">
          <Home className="w-3 h-3" />
          Tableau de bord
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link href="/dashboard/sessions" className="hover:text-[#2E7D32]">
          Sessions
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="font-medium text-gray-700">Session {sessionLabel}</span>
      </nav>

      {/* ── Titre + Actions ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Audit de session</h1>
            <AuditConformityBadge status={conformity} />
          </div>
          <p className="text-sm text-gray-500">
            Session <span className="font-semibold text-gray-700">{sessionLabel}</span>
            {' · '}
            <span className="font-semibold text-gray-700">{caissierNom}</span>
            {' · '}
            {dateSession}
          </p>
        </div>

        {/* Actions (masquées à l'impression) */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Exporter PDF
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1a1a1a] text-white text-sm font-semibold hover:bg-[#000] transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}