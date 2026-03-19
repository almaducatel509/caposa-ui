// app/components/rapports/ReportDocument.tsx
// Enveloppe commune à tous les rapports réglementaires CAPOSA.
// Gère : header période, statut, export PDF/Excel, impression, footer horodatage.
'use client';

import React from 'react';
import { Download, FileText, Printer, CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ReportStatut =
  | 'Conforme'
  | 'À surveiller'
  | 'Critique'
  | 'Non conforme'
  | 'Stable'
  | 'À risque';
interface ReportDocumentProps {
  titre:            string;
  periode:          string;
  periodeAnalysee?: string;
  objectif?:        string;
  statut?:          ReportStatut;
  children:         React.ReactNode;
  onRetour?:        () => void;
  onExportPDF?:     () => void;
  onExportExcel?:   () => void;
}
// ─── Config statuts — palette CAPOSA uniquement ───────────────────────────────
const STATUT_CFG: Record<ReportStatut, {
  bg: string; border: string; text: string; barColor: string;
  icon: React.ElementType;
}> = {
  'Conforme':      { bg: '#DDEAD5',  border: '#DDEAD5', text: '#1B5E20', barColor: '#2E7D32', icon: CheckCircle2  },
  'Stable':        { bg: '#DDEAD5',  border: '#DDEAD5', text: '#1B5E20', barColor: '#2E7D32', icon: CheckCircle2  },
  'À surveiller':  { bg: '#FEF9EC',  border: '#FDE68A', text: '#B45309', barColor: '#D4AF37', icon: AlertTriangle },
  'À risque':      { bg: '#FEF9EC',  border: '#FDE68A', text: '#B45309', barColor: '#D4AF37', icon: AlertTriangle },
  'Critique':      { bg: '#FEF2F2',  border: '#FCA5A5', text: '#B91C1C', barColor: '#EF4444', icon: XCircle       },
  'Non conforme':  { bg: '#FEF2F2',  border: '#FCA5A5', text: '#B91C1C', barColor: '#EF4444', icon: XCircle       },
};

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ReportDocument({
  titre, periode, periodeAnalysee, objectif, statut, children, onRetour, onExportPDF, onExportExcel,
}: ReportDocumentProps) {
  const sc = statut ? STATUT_CFG[statut] : null;
  const StatutIcon = sc?.icon;

  return (
    
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {onRetour && (
        <div className="px-6 pt-4">
          <button onClick={onRetour}
            className="flex items-center gap-2 text-[#355C7D] hover:text-[#1E3A5F] text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux rapports
          </button>
        </div>
      )}
      {/* Header — palette CAPOSA, pas de slate/indigo */}
      <div className="bg-linear-to-r from-[#2E7D32] to-[#1B5E20] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#DDEAD5] mb-0.5">
            Rapport réglementaire BRH
          </p>
          <p className="text-base font-bold text-white">{titre}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <p className="text-xs text-[#81C784]">
            Période : <span className="font-semibold text-white">{periodeAnalysee ?? periode}</span>
          </p>
          {objectif && (
            <p className="text-xs text-[#81C784]">
              Objectif : <span className="font-semibold text-white">{objectif}</span>
            </p>
          )}
        </div>
        {/* Actions export */}
        <div className="flex items-center gap-2 shrink-0">
          {onExportPDF && (
            <button onClick={onExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-colors">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
          )}
          {onExportExcel && (
            <button onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-colors">
              <Download className="w-3.5 h-3.5" /> Excel
            </button>
          )}
          <button onClick={() => window.print()}
            className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors">
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bandeau statut */}
      {sc && StatutIcon && (
        <div className="flex items-center gap-3 px-6 py-3 border-b"
          style={{ backgroundColor: sc.bg, borderColor: sc.border }}>
          <StatutIcon className="w-4 h-4 shrink-0" style={{ color: sc.text }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: sc.text }}>
            {statut}
          </span>
          {/* Barre de couleur */}
          <div className="flex-1 h-1 rounded-full bg-gray-100 ml-2">
            <div className="h-full rounded-full w-full" style={{ backgroundColor: sc.barColor }} />
          </div>
        </div>
      )}

      {/* Corps du rapport */}
      <div className="p-6 flex flex-col gap-5">
        {children}
      </div>

      {/* Footer horodatage */}
      <div className="px-6 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Généré le {new Date().toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
        {statut && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: sc!.bg, color: sc!.text }}>
            {statut}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Sous-composants réutilisables ────────────────────────────────────────────

/** Ligne de données : label à gauche, valeur à droite */
export function ReportRow({ label, value, highlight = false, description, href }: {
  label:       string;
  value:       string | number;
  highlight?:  boolean;
  description?: string;
  href?:       string;
}) {
  return (
    <div className={`flex items-start justify-between py-3 ${
      highlight ? 'bg-[#DDEAD5]/30 px-4 rounded-xl my-1' : 'border-b border-gray-50 last:border-0'
    }`}>
      <div className="flex-1 min-w-0">
        {href ? (
          <a href={href} onClick={e => e.preventDefault()}
            className="text-sm font-semibold text-[#355C7D] hover:underline">
            {label}
          </a>
        ) : (
          <p className={`text-sm ${highlight ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
            {label}
          </p>
        )}
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <p className={`ml-4 shrink-0 ${highlight ? 'text-xl font-bold text-[#2E7D32]' : 'text-sm font-semibold text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

/** Séparateur horizontal */
export function ReportDivider() {
  return <hr className="border-t-2 border-gray-100 my-1" />;
}

/** Bloc de section avec titre */
export function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
        <span className="w-4 h-px bg-gray-300" />{title}
      </p>
      {children}
    </div>
  );
}

/** Encadré statut interprétatif */
export function ReportStatusBox({ status, message }: {
  status:  'success' | 'warning' | 'error' | 'info';
  message: string;
}) {
  const cfg = {
    success: { bg: '#DDEAD5',  border: '#DDEAD5', text: '#1B5E20', icon: CheckCircle2  },
    warning: { bg: '#FEF9EC',  border: '#FDE68A', text: '#B45309', icon: AlertTriangle },
    error:   { bg: '#FEF2F2',  border: '#FCA5A5', text: '#B91C1C', icon: XCircle       },
    info:    { bg: '#EBF2F8',  border: '#BFDBFE', text: '#355C7D', icon: AlertTriangle },
  }[status];
  const Icon = cfg.icon;
  return (
    <div className="rounded-xl border-2 p-4 flex items-start gap-3"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.text }} />
      <p className="text-sm leading-relaxed font-medium" style={{ color: cfg.text }}>{message}</p>
    </div>
  );
}

/** Barre de progression avec pourcentage */
export function ReportProgressBar({ label, value, total, colorClass }: {
  label:      string;
  value:      number;
  total:      number;
  colorClass: string; // ex: 'bg-[#2E7D32]'
}) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{pct.toFixed(1)} %</span>
      </div>
      <div className="h-7 bg-gray-100 rounded-xl overflow-hidden relative">
        <div className={`h-full ${colorClass} rounded-xl transition-all duration-700`}
          style={{ width: `${pct}%` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">{pct.toFixed(1)} %</span>
        </div>
      </div>
    </div>
  );
}

/** Plan d'action numéroté */
export function ReportActionPlan({ titre, actions, variant = 'warning' }: {
  titre:   string;
  actions: string[];
  variant?: 'warning' | 'error';
}) {
  const cfg = variant === 'error'
    ? { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C', sub: '#DC2626' }
    : { bg: '#FEF9EC', border: '#FDE68A', text: '#B45309', sub: '#D97706' };
  return (
    <div className="rounded-2xl border-2 p-5" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
      <p className="text-sm font-bold mb-3" style={{ color: cfg.text }}>{titre}</p>
      <ul className="flex flex-col gap-3">
        {actions.map((action, i) => (
          <li key={i} className="flex items-start gap-3 text-sm" style={{ color: cfg.text }}>
            <span className="font-bold shrink-0 mt-0.5">{i + 1}.</span>
            <span className="leading-relaxed">{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}