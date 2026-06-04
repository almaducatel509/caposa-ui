'use client';
import React, { useMemo } from 'react';
import { FaLock, FaUniversity } from 'react-icons/fa';
import { FiBell } from 'react-icons/fi';

import PageHeader from '../header';
import RemisesTable from './RemisesTable';
import { TreasuryDashboard, CurrencyCode } from '@/types/tresorerie';
import { useEffect, useState } from 'react';
import AxiosInstance from '@/app/lib/axiosInstance';
import { Skeleton } from '../ui/skeleton';
import { CardSkeleton } from '../ui/CardSkeleton';
import { TableSkeleton } from '../ui/TableSkeleton';


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
  const [dashboard, setDashboard] = useState<TreasuryDashboard | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: branches } = await AxiosInstance.get('/branches/');
        const branchId = branches[0]?.id;
        if (!branchId) return;

        const { data: dashData } = await AxiosInstance.get(`/treasury/dashboard/?branch=${branchId}`);
        setDashboard(dashData);

        const { data: pending } = await AxiosInstance.get('/treasury/handovers/?status=pending');
        setPendingCount(pending.length);
      } catch (e) {
        console.error('Erreur chargement trésorerie:', e);
      }
    }
    loadData();
  }, []);

  if (!dashboard) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>

        {/* Banner Skeleton */}
        <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-white/15">
            <div className="md:pr-6 space-y-4">
              <Skeleton className="h-4 w-32 bg-white/20" />
              <Skeleton className="h-10 w-48 bg-white/20" />
              <Skeleton className="h-3 w-40 bg-white/20" />
            </div>
            <div className="md:px-6 space-y-4">
              <Skeleton className="h-4 w-32 bg-white/20" />
              <Skeleton className="h-8 w-36 bg-white/20" />
            </div>
            <div className="md:pl-6 space-y-4">
              <Skeleton className="h-4 w-32 bg-white/20" />
              <Skeleton className="h-8 w-36 bg-white/20" />
            </div>
          </div>
        </div>

        {/* KPIs Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TableSkeleton columns={6} rows={5} />
          </div>
          <div className="space-y-6">
            <CardSkeleton className="h-64" withIcon={false} />
            <CardSkeleton className="h-48" withIcon={false} />
          </div>
        </div>
      </div>
    );
  }
 
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