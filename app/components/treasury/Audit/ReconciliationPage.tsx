'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, Download, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import SessionRow from './SessionRow';
import EcartModal from './EcartModal';
import { MOCK_RECONCILIATION } from '@/app/lib/api/treasury.mock';
import { ReconciliationReport, Ecart } from '@/types/reconciliation.types';
import PageHeader from '../../header';

// ─── Source de vérité unique ──────────────────────────────────────────────────
// Quand l'API est prête, remplacer cet import par un useEffect + fetch dans le composant

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

// ─── Composant principal ───────────────────────────────────────────────────────
const ReconciliationPage: React.FC = () => {
  const router = useRouter();
  const [report,   setReport]   = useState<ReconciliationReport>(MOCK_RECONCILIATION);
  const [ecartTarget, setEcartTarget] = useState<Ecart | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  // Tous les écarts expliqués → peut soumettre
  const allExplained = useMemo(() =>
    report.sessions.every(s =>
      s.ecarts.every(e => e.statut !== 'en_attente')
    ), [report]);

  const totalEcarts = useMemo(() =>
    report.sessions.reduce((sum, s) => sum + s.ecarts.filter(e => e.statut === 'en_attente').length, 0),
  [report]);

  // ── Expliquer un écart ──────────────────────────────────────────────────
  const handleExplainConfirm = async (ecartId: string, note: string) => {
    // TODO API : await fetch(`/api/treasury/reconciliation/ecart/${ecartId}/explain`, {
    //   method: 'POST', body: JSON.stringify({ note }),
    // });

    setReport(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => ({
        ...s,
        ecarts: s.ecarts.map(e =>
          e.id === ecartId ? { ...e, statut: 'explique' as const, note } : e
        ),
        statut: s.ecarts.every(e =>
          e.id === ecartId ? true : e.statut !== 'en_attente'
        ) ? 'explique' as const : s.statut,
      })),
    }));
    setEcartTarget(null);
  };

  // ── Soumettre la réconciliation ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!allExplained) return;
    setSubmitting(true);
    // TODO API : await fetch('/api/treasury/reconciliation/submit', { method: 'POST' });
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  };

  const ecartColor = report.ecart_total < 0
    ? 'text-red-600' : report.ecart_total > 0
    ? 'text-amber-600' : 'text-[#1B5E20]';

  // ── Vue soumise ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-[#DDEAD5] flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-[#2E7D32]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Réconciliation soumise</h2>
          <p className="text-sm text-gray-500">
            Le rapport du {report.date} a été généré et transmis à la section Rapports.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/rapports?type=reconciliation')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white text-sm font-semibold hover:bg-[#1B5E20] transition-colors"
        >
          <FileCheck className="w-4 h-4" />
          Voir le rapport
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <PageHeader
          title="Réconciliation journalière"
          subtitle={`${report.branch_name} · ${report.date}`}
        />
        <div className="flex items-center gap-2">
          {/* Statut global */}
          {allExplained ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Prêt à soumettre
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" /> {totalEcarts} écart{totalEcarts > 1 ? 's' : ''} en attente
            </span>
          )}
        </div>
      </div>

      {/* ── Banner chiffres clés ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {[
            { label: 'Cash ouverture',  value: fmt(report.total_ouverture),  sub: 'Fonds de départ',              color: 'text-gray-800' },
            { label: 'Cash théorique',  value: fmt(report.total_theorique),  sub: 'Selon transactions système',   color: 'text-gray-800' },
            { label: 'Cash réel compté',value: fmt(report.total_reel),       sub: 'Comptage physique',            color: 'text-gray-800' },
            {
              label: 'Écart total',
              value: (report.ecart_total === 0 ? '—' :
                (report.ecart_total < 0 ? '−' : '+') + fmt(report.ecart_total)),
              sub: report.ecart_total === 0 ? 'Aucun écart' :
                   report.ecart_total < 0  ? 'Manque'      : 'Excédent',
              color: ecartColor,
            },
          ].map(c => (
            <div key={c.label} className="px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sessions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* En-tête colonnes */}
        <div className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3">
          <div className="grid grid-cols-[36px_1.4fr_1fr_1fr_1fr_100px_40px] gap-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <span></span>
            <span>Caissière</span>
            <span>Ouverture</span>
            <span>Théorique</span>
            <span>Réel compté</span>
            <span>Écart</span>
            <span></span>
          </div>
        </div>

        {/* Lignes sessions */}
        {report.sessions.map(s => (
          <SessionRow
            key={s.session_id}
            session={s}
            onExplainEcart={setEcartTarget}
          />
        ))}

      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
        <div className="text-sm text-gray-500">
          {allExplained
            ? 'Tous les écarts ont été expliqués. La réconciliation peut être soumise.'
            : `${totalEcarts} écart${totalEcarts > 1 ? 's' : ''} doit encore être expliqué avant de soumettre.`
          }
        </div>
        <div className="flex items-center gap-3">
          {/* Export PDF — toujours disponible */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Exporter PDF
          </button>

          {/* Soumettre — bloqué si écarts non expliqués */}
          <button
            onClick={handleSubmit}
            disabled={!allExplained || submitting}
            title={!allExplained ? 'Expliquez tous les écarts avant de soumettre' : ''}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              allExplained
                ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              'Soumission…'
            ) : allExplained ? (
              <><FileCheck className="w-4 h-4" /> Soumettre la réconciliation</>
            ) : (
              <><Lock className="w-4 h-4" /> Réconciliation bloquée</>
            )}
          </button>
        </div>
      </div>

      {/* ── Modale écart ── */}
      <EcartModal
        ecart={ecartTarget}
        onClose={() => setEcartTarget(null)}
        onConfirm={handleExplainConfirm}
      />

    </div>
  );
};

export default ReconciliationPage;