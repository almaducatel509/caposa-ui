'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { SessionReconciliation, Ecart } from '@/types/reconciliation.types';

interface SessionRowProps {
  session: SessionReconciliation;
  onExplainEcart: (ecart: Ecart) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

const EcartBadge: React.FC<{ ecart: number }> = ({ ecart }) => {
  if (ecart === 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]">
      ✓ Aucun
    </span>
  );
  const isManque = ecart < 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      isManque ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
    }`}>
      {isManque ? '−' : '+'}{fmt(ecart)}
    </span>
  );
};

const StatutIcon: React.FC<{ statut: SessionReconciliation['statut'] }> = ({ statut }) => {
  if (statut === 'ok')       return <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />;
  if (statut === 'explique') return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
  return <AlertTriangle className="w-4 h-4 text-amber-500" />;
};

const SessionRow: React.FC<SessionRowProps> = ({ session: s, onExplainEcart }) => {
  const [open, setOpen] = useState(false);

  const allExplained = s.ecarts.every(e => e.statut !== 'en_attente');
  const hasEcarts    = s.ecarts.length > 0 && s.ecart !== 0;

  return (
    <div className="border-b border-gray-50 last:border-0">

      {/* ── Ligne résumé session ── */}
      <div
        onClick={() => hasEcarts && setOpen(o => !o)}
        className={`grid grid-cols-[36px_1.4fr_1fr_1fr_1fr_100px_40px] gap-3 items-center px-5 py-4 transition-colors ${
          hasEcarts ? 'cursor-pointer hover:bg-[#FAFAF6]' : ''
        } ${open ? 'bg-[#F5F9F3]' : ''}`}
      >
        {/* Statut icon */}
        <StatutIcon statut={s.statut} />

        {/* Caissière */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#DDEAD5] text-[#1B5E20] flex items-center justify-center text-xs font-semibold shrink-0">
            {s.cashier_initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{s.cashier_name}</p>
            <p className="text-xs text-gray-400">{s.session_id}</p>
          </div>
        </div>

        {/* Cash ouverture */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Ouverture</p>
          <p className="text-sm font-medium text-gray-700">{fmt(s.cash_ouverture)}</p>
        </div>

        {/* Cash théorique */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Théorique</p>
          <p className="text-sm font-medium text-gray-700">{fmt(s.cash_theorique)}</p>
        </div>

        {/* Cash réel */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Réel compté</p>
          <p className="text-sm font-medium text-gray-700">{fmt(s.cash_reel)}</p>
        </div>

        {/* Écart */}
        <EcartBadge ecart={s.ecart} />

        {/* Chevron si écarts */}
        <div className="flex justify-center">
          {hasEcarts && (open
            ? <ChevronUp   className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* ── Expand : détail des écarts ── */}
      {open && hasEcarts && (
        <div className="bg-[#F5F9F3] border-t border-[#DDEAD5] px-5 py-4">

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Détail des écarts — {s.cashier_name}
          </p>

          <div className="space-y-2">
            {s.ecarts.map(e => (
              <div
                key={e.id}
                className="grid grid-cols-[1.8fr_80px_80px_80px_100px_auto] gap-3 items-center bg-white rounded-xl px-4 py-3 border border-gray-100"
              >
                {/* Source */}
                <div>
                  <p className="text-sm font-medium text-gray-800">{e.label}</p>
                  {e.note && (
                    <p className="text-xs text-blue-600 mt-0.5 italic">{e.note}</p>
                  )}
                </div>

                {/* Attendu */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Attendu</p>
                  <p className="text-xs font-medium text-gray-600">{fmt(e.attendu)}</p>
                </div>

                {/* Réel */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Réel</p>
                  <p className="text-xs font-medium text-gray-600">{fmt(e.reel)}</p>
                </div>

                {/* Écart */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Écart</p>
                  <p className={`text-xs font-bold ${e.ecart < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {e.ecart < 0 ? '−' : '+'}{fmt(e.ecart)}
                  </p>
                </div>

                {/* Statut */}
                <div>
                  {e.statut === 'en_attente' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                      <Clock className="w-2.5 h-2.5" /> En attente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Expliqué
                    </span>
                  )}
                </div>

                {/* Action */}
                <div>
                  {e.statut === 'en_attente' ? (
                    <button
                      onClick={() => onExplainEcart(e)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B5E20] border border-[#A7D1A2] hover:bg-[#DDEAD5] transition-colors"
                    >
                      Expliquer
                    </button>
                  ) : (
                    <button
                      onClick={() => onExplainEcart(e)}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Résumé session */}
          {allExplained && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tous les écarts de cette session sont expliqués
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SessionRow;