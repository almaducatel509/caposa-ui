'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Upload, ArrowLeftRight } from 'lucide-react';
import TransactionStats from './TransactionStats';
import TransactionTable from './TransactionTable';
import PageHeader from '../header';
import { TransactionData } from './types';
import { fetchTransactions } from '@/app/lib/api/transactions';
import TransactionDetailModal, { TransactionDetail } from './TransactionDetailModal';

const TransactionDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [detailTx,     setDetailTx]     = useState<TransactionDetail | null>(null);

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

  const handleView = (tx: TransactionData) => {
    setDetailTx({
      id:             tx.id,
      kind:           tx.type as TransactionDetail['kind'],
      status:         tx.status,
      montant:        tx.amount ?? 0,
      created_at:     tx.created_at ?? '',
      reference:      tx.reference,
      description:    tx.description,
      member_name:    tx.member_name,
      account_number: tx.account_number,
    });
  };

  const handleProcess = (tx: TransactionData) => {
    // TODO: ouvrir modal de traitement
    console.log('Traiter transaction:', tx.id);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
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

  // ── Error ──────────────────────────────────────────────────────────────────
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
          <button onClick={loadTransactions}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Transactions" subtitle="Gestion et suivi financier"
          icon={<ArrowLeftRight className="w-8 h-8 text-[#2E7D32]" />} />
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={loadTransactions}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={() => console.log('Importer')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            <Upload className="w-4 h-4" /> Importer
          </button>
        </div>
      </div>

      <TransactionStats transactions={transactions} />

      <TransactionTable
        transactions={transactions}
        onView={handleView}
        onProcess={handleProcess}
      />

      <TransactionDetailModal
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
      />

    </div>
  );
};

export default TransactionDashboard;