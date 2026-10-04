"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from "@/app/components/ui/Modal";
import {
  X, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowLeftRight,
  Download, History, Banknote, Loader2, AlertCircle,
} from "lucide-react";
import UserAvatar from '@/app/components/core/UserAvatar';
import { Transaction } from '@/types/data';
import { fetchEmployeeTransactions } from '@/app/lib/api/employee';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmployeeTransactionModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  employee: {
    id: string; first_name: string; last_name: string;
    photo_profil: string | null;
  } | null;
}

// ─── Config par type de transaction bancaire ─────────────────────────────────

const TX_CFG: Record<Transaction['transaction_type'], { bg: string; iconColor: string; badge: string; label: string; credit: boolean }> = {
  deposit:    { bg: 'bg-[#DDEAD5]', iconColor: 'text-[#2E7D32]', badge: 'bg-[#DDEAD5] text-[#1B5E20]', label: 'Dépôt',    credit: true  },
  withdrawal: { bg: 'bg-red-50',    iconColor: 'text-red-600',   badge: 'bg-red-50 text-red-700',       label: 'Retrait',  credit: false },
  transfer:   { bg: 'bg-blue-50',   iconColor: 'text-[#355C7D]', badge: 'bg-blue-50 text-[#355C7D]',    label: 'Transfert',credit: false },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// NB: pas de champ `currency` sur Transaction — HTG à confirmer, USD en attendant
function fmtAmount(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(n);
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const EmployeeTransactionModal: React.FC<EmployeeTransactionModalProps> = ({
  isOpen, onClose, employee,
}) => {
  const [tab, setTab] = useState<'transactions' | 'activity'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (employeeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const tx = await fetchEmployeeTransactions(employeeId);
      setTransactions(tx);
    } catch {
      setError("Impossible de charger les transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && employee?.id) {
      loadData(employee.id);
    }
    if (!isOpen) {
      setTransactions([]);
      setError(null);
      setTab('transactions');
    }
  }, [isOpen, employee?.id, loadData]);

  if (!employee) return null;

  const stats = {
    deposits:    transactions.filter(t => t.transaction_type === 'deposit'   ).reduce((s,t) => s+t.amount, 0),
    withdrawals: transactions.filter(t => t.transaction_type === 'withdrawal').reduce((s,t) => s+t.amount, 0),
    transfers:   transactions.filter(t => t.transaction_type === 'transfer'  ).reduce((s,t) => s+t.amount, 0),
    count:       transactions.length,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className=" flex items-center justify-center shrink-0 pt-2">
            <UserAvatar user={employee} size="xl" type="employee" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Transactions traitées</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {employee.first_name} {employee.last_name}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* ── Erreur ── */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="px-6 pt-5 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Dépôts',      value: fmtAmount(stats.deposits),    color: 'text-[#2E7D32]' },
          { label: 'Retraits',    value: fmtAmount(stats.withdrawals), color: 'text-red-600'    },
          { label: 'Transferts',  value: fmtAmount(stats.transfers),   color: 'text-[#355C7D]'  },
          { label: 'Opérations',  value: String(stats.count),          color: 'text-gray-700'   },
        ] as const).map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 px-6 border-b border-gray-100">
        {([
          { key: 'transactions', label: 'Transactions', count: transactions.length, Icon: Banknote },
          { key: 'activity',     label: 'Historique',   count: 0,                   Icon: History  },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2',
              tab === t.key
                ? 'border-[#2E7D32] text-[#1B5E20] bg-[#DDEAD5]/30'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ].join(' ')}>
            <t.Icon className="w-3.5 h-3.5" />
            {t.label}
            <span className={['px-2 py-0.5 rounded-lg text-xs font-bold',
              tab === t.key ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-500',
            ].join(' ')}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="overflow-y-auto max-h-[40vh] px-6 py-4 flex flex-col gap-2">

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">Chargement...</p>
          </div>
        )}

        {!loading && tab === 'transactions' && transactions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">Aucune transaction traitée par cet employé.</p>
        )}

        {!loading && tab === 'transactions' && transactions.map(tx => {
          const cfg = TX_CFG[tx.transaction_type];
          const Icon = tx.transaction_type === 'transfer' ? ArrowLeftRight
            : cfg.credit ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={tx.id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all p-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">Compte {tx.account_number} · {fmtDate(tx.date)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${cfg.credit ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                  {cfg.credit ? '+' : '-'}{fmtAmount(tx.amount)}
                </p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}

        {tab === 'activity' && (
          <p className="text-sm text-gray-400 text-center py-12">
            Historique des modifications — pas encore disponible (aucun modèle confirmé côté backend).
          </p>
        )}

      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Fermer
        </button>
        <button
          disabled={loading || transactions.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
          <Download className="w-4 h-4" /> Exporter PDF
        </button>
      </div>

    </Modal>
  );
};

export default EmployeeTransactionModal;