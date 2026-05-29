'use client';
import React, { useMemo } from 'react';
import { FaLock, FaUniversity } from 'react-icons/fa';
import { FiBell } from 'react-icons/fi';

import PageHeader from '../header';
import RemisesTable from './RemisesTable';
import { TreasuryDashboard, CurrencyCode } from '@/types/tresorerie';
import { MOCK_DASHBOARD, MOCK_PENDING_COUNT } from '@/app/lib/api/treasury.mock';
// Remplace les deux constantes MOCK_* par :
// const [pending, setPending]   = useState<Remise[]>([]);
// const [archived, setArchived] = useState<Remise[]>([]);

// useEffect(() => {
//   fetch('/api/treasury/handovers?status=pending').then(r => r.json()).then(setPending);
//   fetch('/api/treasury/handovers?status=archived').then(r => r.json()).then(setArchived);
// }, []);
// ─── Mock (remplacer par fetch('/api/treasury/dashboard') ) ──────────────────


// ─── Helper ──────────────────────────────────────────────────────────────────
const formatCurrency = (value: number, currency: CurrencyCode = 'HTG') =>
  new Intl.NumberFormat(currency === 'HTG' ? 'fr-HT' : 'fr-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'HTG' ? 0 : 2,
    maximumFractionDigits: currency === 'HTG' ? 0 : 2,
  }).format(value);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });

// ─── Composant ───────────────────────────────────────────────────────────────
const TreasuryOverview: React.FC = () => {
  const dashboard    = MOCK_DASHBOARD;      // TODO: useState + useEffect + fetch
  const pendingCount = MOCK_PENDING_COUNT;  // TODO: fetch('/api/treasury/handovers?status=pending&count=true')
 
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
 
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <PageHeader
          title="Trésorerie"
          subtitle={`${dashboard.branch_name} · Mis à jour à ${formatTime(dashboard.generated_at)}`}
        />
 
        {/* Cloche remises en attente */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
            title="Remises en attente de validation"
          >
            <FiBell className="w-4 h-4" />
            Remises en attente
          </button>
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {pendingCount}
            </span>
          )}
        </div>
      </div>
 
      {/* ── Banner solde consolidé ── */}
      <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-white/15">
 
          <div className="md:pr-6">
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-2">
              Solde total consolidé
            </p>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(
                dashboard.cash_balance.total_consolidated,
                dashboard.cash_balance.reference_currency,
              )}
            </p>
            <p className="text-white/60 text-xs mt-2">Caisses physiques + comptes bancaires</p>
          </div>
 
          <div className="md:px-6">
            <div className="flex items-center gap-2 mb-2">
              <FaLock className="w-3 h-3 text-white/70" />
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                Encaisse physique
              </p>
            </div>
            <p className="text-2xl font-semibold text-white">
              {formatCurrency(
                dashboard.cash_balance.cash_physical,
                dashboard.cash_balance.reference_currency,
              )}
            </p>
          </div>
 
          <div className="md:pl-6">
            <div className="flex items-center gap-2 mb-2">
              <FaUniversity className="w-3 h-3 text-white/70" />
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                Comptes bancaires
              </p>
            </div>
            <p className="text-2xl font-semibold text-white">
              {formatCurrency(
                dashboard.cash_balance.bank_accounts,
                dashboard.cash_balance.reference_currency,
              )}
            </p>
          </div>
 
        </div>
      </div>
 
      {/* ── Tableau remises ── */}
      <RemisesTable />
 
    </div>
  );
};

export default TreasuryOverview;