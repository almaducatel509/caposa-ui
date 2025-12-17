'use client';
import React from 'react';
import { z } from 'zod';
import { treasurySchema } from './validation';

type TreasuryData = z.infer<typeof treasurySchema>;

interface TreasuryStatsProps {
  treasury: TreasuryData[];
}

const TreasuryStats: React.FC<TreasuryStatsProps> = ({ treasury }) => {
  const stats = {
    total: treasury.length,
    inflows: treasury.filter(t => t.type === 'deposit').length,
    outflows: treasury.filter(t => t.type === 'withdrawal').length,
    transfers: treasury.filter(t => t.type === 'transfer').length,
    loans: treasury.filter(t => t.type === 'loan').length,
    totalAmount: treasury.reduce((sum, t) => sum + (t.amount || 0), 0),
    pendingAmount: treasury
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total opérations */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
        <div>
          <p className="text-blue-100 text-sm">Total Opérations</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
      </div>

      {/* Montant total */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
        <div>
          <p className="text-green-100 text-sm">Montant total</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      {/* En attente */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
        <div>
          <p className="text-orange-100 text-sm">Montant en attente</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</p>
        </div>
      </div>

      {/* Répartition */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
        <p className="text-purple-100 text-sm mb-2">Répartition</p>
        <div className="text-sm space-y-1">
          <p>💵 Entrées : {stats.inflows}</p>
          <p>💸 Sorties : {stats.outflows}</p>
          <p>🔄 Transferts : {stats.transfers}</p>
          <p>🏦 Prêts : {stats.loans}</p>
        </div>
      </div>
    </div>
  );
};

export default TreasuryStats;
