'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Upload, ArrowLeftRight } from 'lucide-react';
import TransactionStats from './TransactionStats';
import TransactionTable from './TransactionTable';
import PageHeader from '../header';
import { TransactionData } from './types';
import { fetchTransactions } from '@/app/lib/api/transactions';

const TransactionDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
      setError('Erreur lors de la récupération des transactions.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
        <PageHeader title="Transactions" subtitle="Gestion et suivi financier"
          icon={<ArrowLeftRight className="w-8 h-8 text-[#2E7D32]" />} />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#2E7D32] animate-spin" />
          <p className="text-sm font-medium text-gray-500">Chargement des transactions…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
        <PageHeader title="Transactions" subtitle="Gestion et suivi financier"
          icon={<ArrowLeftRight className="w-8 h-8 text-[#2E7D32]" />} />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Erreur de chargement</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={loadTransactions}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Transactions"
          subtitle="Gestion et suivi financier"
          icon={<ArrowLeftRight className="w-8 h-8 text-[#2E7D32]" />}
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadTransactions}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button
            onClick={() => console.log('Importer')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Upload className="w-4 h-4" /> Importer
          </button>
        </div>
      </div>

      {/* Stats */}
      <TransactionStats transactions={transactions} />

      {/* Table */}
      <TransactionTable
        transactions={transactions}
        onProcess={(t) => console.log('Traiter', t)}
        onView={(t)    => console.log('Voir',    t)}
      />
    </div>
  );
};

export default TransactionDashboard;