// ─── Source de vérité unique ──────────────────────────────────────────────────
// La réconciliation est une vue de santé AUTOMATIQUE et EN LECTURE SEULE.
// Elle agrège ce qui a déjà été décidé à l'étape Remise (par session/terminal).
// Aucune action n'est possible ici — pas d'explication d'écart, pas de
// soumission. Le trésorier consulte, il n'agit pas.
'use client';
import React, { useState, useEffect } from 'react';
import {
  Inbox, TrendingUp, TrendingDown, Minus, Check, X, AlertCircle,
} from 'lucide-react';
import AxiosInstance from '@/app/lib/axiosInstance';
import { AxiosError } from 'axios';
import { ReconciliationReport } from '@/types/reconciliation.types';
import PageHeader from '../../header';
import { Skeleton } from '../../ui/skeleton';
import { TableSkeleton } from '../../ui/TableSkeleton';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(Math.abs(n)) + ' G';

const fmtSigned = (n: number) => {
  if (n === 0) return '—';
  return (n > 0 ? '+' : '−') + fmt(n);
};

// ─── Micro-composants (mêmes codes visuels que RemisesTable) ──────────────────
const Avatar: React.FC<{ initials: string }> = ({ initials }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-[#DDEAD5] text-[#1B5E20]">
    {initials}
  </div>
);

const headerBase =
  'bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600';

// ─── État vide — cohérent avec celui de RemisesTable ──────────────────────────
const NoHandoversYet: React.FC = () => (
  <div className="py-14 text-center text-sm text-gray-400">
    <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
    <p className="text-gray-500 font-medium">Aucune remise à réconcilier</p>
    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
      Aucune session n&apos;a encore été clôturée et remise aujourd&apos;hui.
      La réconciliation se construit automatiquement dès qu&apos;une remise est traitée.
    </p>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────
const ReconciliationPage: React.FC = () => {
  const [report,  setReport]  = useState<ReconciliationReport | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: branches } = await AxiosInstance.get('/branches/');
        const branchId = branches[0]?.id;
        if (!branchId) { setLoading(false); return; }

        const { data } = await AxiosInstance.get(`/treasury/reconciliation/?branch=${branchId}`);
        setReport(data);
      } catch (e) {
        const err = e as AxiosError<{ detail?: string }>;
        if (err.response?.status === 404) {
          // Pas de rapport pour cette branche/date = état normal, pas une erreur
          setReport(null);
        } else {
          console.error('Erreur chargement réconciliation:', err);
          const detail = err.response?.data?.detail;
          setError(
            detail
              ? `${detail} (HTTP ${err.response?.status})`
              : err.response
                ? `Erreur serveur (HTTP ${err.response.status}). Vérifiez les logs backend.`
                : 'Impossible de joindre le serveur. Le backend tourne-t-il ?'
          );
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <TableSkeleton columns={6} rows={4} />
      </div>
    );
  }

  // ── Erreur technique réelle ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
        <PageHeader title="Réconciliation" subtitle="Vue de santé de la succursale" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="py-14 text-center text-sm text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 font-medium">Réconciliation temporairement indisponible</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Un problème technique empêche le chargement des données pour le moment.
              Réessayez dans quelques instants, ou contactez le support si le problème persiste.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-[11px] text-gray-300 mt-3 font-mono">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Aucune donnée — état normal, vraie page stylée ──────────────────────
  if (!report || report.sessions.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
        <PageHeader title="Réconciliation" subtitle="Vue de santé de la succursale" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <NoHandoversYet />
        </div>
      </div>
    );
  }

  // ── Données présentes ────────────────────────────────────────────────────
  const ecartColor =
    report.ecart_total < 0 ? 'text-red-600'
    : report.ecart_total > 0 ? 'text-amber-600'
    : 'text-[#1B5E20]';

  const EcartIcon =
    report.ecart_total < 0 ? TrendingDown
    : report.ecart_total > 0 ? TrendingUp
    : Minus;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* ── Header ── */}
      <PageHeader
        title="Réconciliation"
        subtitle={`${report.branch_name} · ${report.date}`}
      />

      {/* ── Banner consolidé — même style que TreasuryOverview ── */}
      <div className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-white/15">
          <div className="md:pr-6">
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-2">
              Ouverture de la branche
            </p>
            <p className="text-3xl font-bold text-white">{fmt(report.total_ouverture)}</p>
            <p className="text-white/60 text-xs mt-2">Total distribué aux terminaux ce matin</p>
          </div>
          <div className="md:px-6">
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-2">
              Fermeture de la branche
            </p>
            <p className="text-3xl font-bold text-white">{fmt(report.total_fermeture)}</p>
            <p className="text-white/60 text-xs mt-2">Total remis par tous les terminaux</p>
          </div>
          <div className="md:pl-6">
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-2">
              Écart total
            </p>
            <p className="text-3xl font-bold text-white flex items-center gap-2">
              <EcartIcon className="w-6 h-6" />
              {fmtSigned(report.ecart_total)}
            </p>
            <p className="text-white/60 text-xs mt-2">
              Théorique {fmt(report.total_theorique)} · déjà tranché en remise
            </p>
          </div>
        </div>
      </div>

      {/* ── Tableau par terminal — lecture seule ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Détail par terminal</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Lecture seule — chaque écart a déjà été traité à l&apos;étape remise
          </p>
        </div>

        <div className={`${headerBase} grid grid-cols-[1.6fr_110px_110px_110px_110px_120px] gap-3`}>
          <span>Caissière</span>
          <span>Ouverture</span>
          <span>Théorique</span>
          <span>Fermeture</span>
          <span>Écart</span>
          <span>Décision</span>
        </div>

        <div className="divide-y divide-gray-50">
          {report.sessions.map(s => (
            <div
              key={s.session_id}
              className="grid grid-cols-[1.6fr_110px_110px_110px_110px_120px] gap-3 items-center px-5 py-3.5 hover:bg-[#FAFAF6] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Avatar initials={s.cashier_initials} />
                <div>
                  <p className="text-sm font-medium text-gray-700">{s.cashier_name}</p>
                  <p className="text-xs text-gray-400">{s.session_id}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{fmt(s.cash_ouverture)}</p>
              <p className="text-sm text-gray-600">{fmt(s.cash_theorique)}</p>
              <p className="text-sm font-semibold text-gray-800">{fmt(s.cash_fermeture)}</p>
              <p className={`text-sm font-bold ${
                s.ecart === 0 ? 'text-gray-400' : s.ecart < 0 ? 'text-red-600' : 'text-amber-600'
              }`}>
                {fmtSigned(s.ecart)}
              </p>
              {s.decision === 'approved' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] w-fit">
                  <Check className="w-3 h-3" /> Approuvé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 w-fit">
                  <X className="w-3 h-3" /> Rejeté
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Totaux en pied de tableau */}
        <div className="grid grid-cols-[1.6fr_110px_110px_110px_110px_120px] gap-3 items-center px-5 py-3.5 bg-[#F5F9F3] border-t border-[#DDEAD5]">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Total branche</p>
          <p className="text-sm font-bold text-gray-800">{fmt(report.total_ouverture)}</p>
          <p className="text-sm font-bold text-gray-800">{fmt(report.total_theorique)}</p>
          <p className="text-sm font-bold text-gray-800">{fmt(report.total_fermeture)}</p>
          <p className={`text-sm font-bold ${ecartColor}`}>{fmtSigned(report.ecart_total)}</p>
          <span />
        </div>
      </div>
    </div>
  );
};

export default ReconciliationPage;