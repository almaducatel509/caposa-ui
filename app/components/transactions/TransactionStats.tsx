'use client';
import React from 'react';
import { TransactionData } from './types';

interface TransactionStatsProps {
  transactions: TransactionData[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  // Calculs des statistiques
  const stats = {
    total: transactions.length,
    deposits: transactions.filter(t => t.type === 'deposit').length,
    withdrawals: transactions.filter(t => t.type === 'withdrawal').length,
    transfers: transactions.filter(t => t.type === 'transfer').length,
    loans: transactions.filter(t => t.type === 'loan').length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    pendingAmount: transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    completedToday: transactions.filter(t => {
      const today = new Date().toDateString();
      return new Date(t.created_at || '').toDateString() === today && t.status === 'completed';
    }).length
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Transactions */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Transactions</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
            <p className="text-blue-100 text-xs mt-1">Toutes périodes</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>

      {/* Montant Total */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Montant Total</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-green-100 text-xs mt-1">Volume traité</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      {/* En Attente */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">En Attente</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-orange-100 text-xs mt-1">À traiter</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <span className="text-2xl">⏳</span>
          </div>
        </div>
      </div>

      {/* Complétées Aujourd'hui */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Aujourd'hui</p>
            <p className="text-3xl font-bold mt-1">{stats.completedToday}</p>
            <p className="text-purple-100 text-xs mt-1">Complétées</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <span className="text-2xl">✅</span>
          </div>
        </div>
      </div>

      {/* Statistiques par type */}
      <div className="md:col-span-2 lg:col-span-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">💵</div>
              <p className="text-sm text-gray-600">Dépôts</p>
              <p className="text-xl font-bold text-blue-600">{stats.deposits}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl mb-2">💸</div>
              <p className="text-sm text-gray-600">Retraits</p>
              <p className="text-xl font-bold text-red-600">{stats.withdrawals}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🔄</div>
              <p className="text-sm text-gray-600">Virements</p>
              <p className="text-xl font-bold text-green-600">{stats.transfers}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🏦</div>
              <p className="text-sm text-gray-600">Prêts</p>
              <p className="text-xl font-bold text-purple-600">{stats.loans}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;