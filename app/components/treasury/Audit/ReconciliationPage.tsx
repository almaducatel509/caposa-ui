
// ─── Source de vérité unique ──────────────────────────────────────────────────
// Quand l'API est prête, remplacer cet import par un useEffect + fetch dans le composant
'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileCheck, Download, AlertTriangle, CheckCircle2,
  Lock, Clock, StickyNote,
} from 'lucide-react';
import { MOCK_RECONCILIATION } from '@/app/lib/api/treasury.mock';
import { ReconciliationReport, Ecart } from '@/types/reconciliation.types';
import PageHeader from '../../header';
import EcartModal from './EcartModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(Math.abs(n)) + ' HTG';

// ─── Composant principal ──────────────────────────────────────────────────────
const ReconciliationPage: React.FC = () => {
  const router = useRouter();

  // TODO API : remplacer par useEffect + fetch('/api/treasury/reconciliation/start', { method: 'POST' })
  const [report,     setReport]     = useState<ReconciliationReport>(MOCK_RECONCILIATION);
  const [ecartTarget, setEcartTarget] = useState<Ecart | null>(null);
  const [globalNote,  setGlobalNote]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [rapportId,   setRapportId]   = useState<string | null>(null);

  // Tous les écarts expliqués ?
  const allEcarts = useMemo(() =>
    report.sessions.flatMap(s => s.ecarts), [report]);

  const pending   = useMemo(() => allEcarts.filter(e => e.statut === 'en_attente'),  [allEcarts]);
  const explained = useMemo(() => allEcarts.filter(e => e.statut === 'explique'),    [allEcarts]);
  const canSubmit = pending.length === 0;

  // ── Expliquer un écart ────────────────────────────────────────────────────
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
      })),
    }));
    setEcartTarget(null);
  };

  // ── Soumettre ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    // TODO API :
    //   const { rapport_id } = await fetch('/api/treasury/reconciliation/submit', {
    //     method: 'POST', body: JSON.stringify({ note: globalNote }),
    //   }).then(r => r.json());
    //   setRapportId(rapport_id);
    await new Promise(r => setTimeout(r, 800));
    setRapportId('RPT-20260529-br-pap'); // mock
    setSubmitted(true);
    setSubmitting(false);
  };

  // ── Vue soumise ───────────────────────────────────────────────────────────
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
          onClick={() => router.push(
            `/dashboard/rapports?type=reconciliation${rapportId ? `&id=${rapportId}` : ''}`
          )}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white text-sm font-semibold hover:bg-[#1B5E20] transition-colors"
        >
          <FileCheck className="w-4 h-4" />
          Voir le rapport
        </button>
        <button
          onClick={() => router.push('/dashboard/treasury')}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Fermer
        </button>

      </div>
    );
  }

  const ecartTotal = report.ecart_total;
  const ecartColor = ecartTotal < 0 ? 'text-red-600' : ecartTotal > 0 ? 'text-amber-600' : 'text-[#1B5E20]';

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <PageHeader
          title="Réconciliation journalière"
          subtitle={`${report.branch_name} · ${report.date}`}
        />
        <div>
          {canSubmit ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Prêt à soumettre
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              {pending.length} écart{pending.length > 1 ? 's' : ''} en attente
            </span>
          )}
        </div>
      </div>

      {/* ── Banner consolidé ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {[
            { label: 'Cash ouverture',   value: fmt(report.total_ouverture),  sub: 'Fonds de départ',             color: 'text-gray-800' },
            { label: 'Cash théorique',   value: fmt(report.total_theorique),  sub: 'Selon transactions système',  color: 'text-gray-800' },
            { label: 'Cash réel compté', value: fmt(report.total_reel),       sub: 'Comptage physique total',     color: 'text-gray-800' },
            {
              label: 'Écart total',
              value: ecartTotal === 0 ? '—' : (ecartTotal < 0 ? '−' : '+') + fmt(ecartTotal),
              sub:   ecartTotal === 0 ? 'Aucun écart' : ecartTotal < 0 ? 'Manque' : 'Excédent',
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

      {/* ── Tableau des écarts ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* En-tête avec compteurs */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Tableau des écarts</h3>
          <div className="flex items-center gap-2">
            {pending.length > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                <Clock className="w-3 h-3" /> {pending.length} en attente
              </span>
            )}
            {explained.length > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                <CheckCircle2 className="w-3 h-3" /> {explained.length} expliqué{explained.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Colonnes */}
        <div className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3">
          <div className="grid grid-cols-[2fr_90px_90px_90px_110px_120px] gap-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <span>Source</span>
            <span>Attendu</span>
            <span>Réel</span>
            <span>Écart</span>
            <span>Statut</span>
            <span>Action</span>
          </div>
        </div>

        {/* Lignes écarts */}
        <div className="divide-y divide-gray-50">
          {allEcarts.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#2E7D32]" />
              Aucun écart détecté — journée équilibrée
            </div>
          )}

          {allEcarts.map(e => (
            <div
              key={e.id}
              className="grid grid-cols-[2fr_90px_90px_90px_110px_120px] gap-3 items-center px-5 py-3.5 hover:bg-[#FAFAF6] transition-colors"
            >
              {/* Source */}
              <div>
                <p className="text-sm font-medium text-gray-800">{e.label}</p>
                {e.note && (
                  <p className="text-xs text-blue-600 mt-0.5 italic leading-snug">{e.note}</p>
                )}
              </div>

              {/* Attendu */}
              <p className="text-sm text-gray-600">{fmt(e.attendu)}</p>

              {/* Réel */}
              <p className="text-sm text-gray-600">{fmt(e.reel)}</p>

              {/* Écart */}
              <p className={`text-sm font-bold ${e.ecart < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                {e.ecart < 0 ? '−' : '+'}{fmt(e.ecart)}
              </p>

              {/* Statut */}
              {e.statut === 'en_attente' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                  <Clock className="w-2.5 h-2.5" /> En attente
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Expliqué
                </span>
              )}

              {/* Action */}
              {e.statut === 'en_attente' ? (
                <button
                  onClick={() => setEcartTarget(e)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B5E20] border border-[#A7D1A2] hover:bg-[#DDEAD5] transition-colors"
                >
                  Expliquer
                </button>
              ) : (
                <button
                  onClick={() => setEcartTarget(e)}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Modifier
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Note globale + Footer ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 space-y-4">

        {/* Note globale optionnelle */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            <StickyNote className="w-3.5 h-3.5" />
            Note globale (optionnelle)
          </label>
          <textarea
            value={globalNote}
            onChange={e => setGlobalNote(e.target.value)}
            rows={2}
            placeholder="Ex : Journée sans incident majeur. Frais BDP confirmés par relevé bancaire."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {canSubmit
              ? 'Tous les écarts sont expliqués. La réconciliation peut être soumise.'
              : `${pending.length} écart${pending.length > 1 ? 's' : ''} doit encore être expliqué.`
            }
          </p>
          <div className="flex items-center gap-3">
           
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              title={!canSubmit ? 'Expliquez tous les écarts avant de soumettre' : ''}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                canSubmit
                  ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Soumission…'
                : canSubmit
                  ? <><FileCheck className="w-4 h-4" /> Soumettre la réconciliation</>
                  : <><Lock className="w-4 h-4" /> Réconciliation bloquée</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Modale écart */}
      <EcartModal
        ecart={ecartTarget}
        onClose={() => setEcartTarget(null)}
        onConfirm={handleExplainConfirm}
      />
    </div>
  );
};

export default ReconciliationPage;