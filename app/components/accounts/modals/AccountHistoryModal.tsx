'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Search, TrendingUp, TrendingDown, ArrowLeftRight,
  Receipt, Percent, Loader2, Inbox,
} from 'lucide-react';
import type { AccountData, TransactionData } from '../validationsaccount';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AccountHistoryModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  account:  AccountData | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const TX_CFG: Record<string, {
  label: string; icon: React.ReactNode;
  amount: string; badge: string;
}> = {
  deposit:    { label: 'Dépôt',     icon: <TrendingUp   className="w-3.5 h-3.5" />, amount: 'text-[#1B5E20]', badge: 'bg-[#DDEAD5] text-[#1B5E20]'  },
  withdrawal: { label: 'Retrait',   icon: <TrendingDown className="w-3.5 h-3.5" />, amount: 'text-red-600',   badge: 'bg-red-50 text-red-600'        },
  transfer:   { label: 'Transfert', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, amount: 'text-blue-600', badge: 'bg-blue-50 text-blue-600'    },
  fee:        { label: 'Frais',     icon: <Receipt      className="w-3.5 h-3.5" />, amount: 'text-amber-600', badge: 'bg-amber-50 text-amber-700'   },
  interest:   { label: 'Intérêt',  icon: <Percent      className="w-3.5 h-3.5" />, amount: 'text-purple-600',badge: 'bg-purple-50 text-purple-700' },
};

const SIGN: Record<string, string> = {
  deposit: '+', interest: '+', withdrawal: '-', fee: '-', transfer: '±',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n) + ' HTG';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AccountHistoryModal({
  isOpen, onClose, account,
}: AccountHistoryModalProps) {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [filterType,   setFilterType]   = useState('all');
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    if (!isOpen || !account) return;
    setIsLoading(true);
    setSearch('');
    setFilterType('all');
    // Si les transactions sont déjà dans l'objet compte
    if (account.transactions?.length) {
      setTransactions(account.transactions as any[]);
    } else {
      // TODO: remplacer par fetchAccountTransactions(account.id)
      setTransactions([]);
    }
    setIsLoading(false);
  }, [isOpen, account]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const filtered = useMemo(() => transactions.filter(t => {
    const matchType   = filterType === 'all' || t.transaction_type === filterType;
    const matchSearch = !search ||
      t.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  }), [transactions, filterType, search]);

  // KPIs
  const kpis = useMemo(() => {
    const deps = transactions.filter(t => t.transaction_type === 'deposit' || t.transaction_type === 'interest')
      .reduce((s, t) => s + t.amount, 0);
    const rets = transactions.filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'fee')
      .reduce((s, t) => s + t.amount, 0);
    return { deposits: deps, withdrawals: rets, net: deps - rets };
  }, [transactions]);

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-[#DDEAD5]/40 to-[#F9F9F6] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Historique des transactions</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {account.account_number} · {account.member_details?.full_name ?? account.id_membre ?? '—'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 bg-[#F9F9F6] border-b border-gray-100 shrink-0">
          {[
            { label: 'Total dépôts',   value: kpis.deposits,    color: 'text-[#1B5E20]', bg: 'bg-[#DDEAD5]' },
            { label: 'Total retraits', value: kpis.withdrawals, color: 'text-red-600',   bg: 'bg-red-50'    },
            { label: 'Flux net',       value: kpis.net,         color: kpis.net >= 0 ? 'text-[#1B5E20]' : 'text-red-600', bg: 'bg-blue-50' },
          ].map(k => (
            <div key={k.label} className={`${k.bg} rounded-xl px-4 py-3`}>
              <p className="text-xs text-gray-500 mb-1">{k.label}</p>
              <p className={`text-sm font-bold ${k.color}`}>{formatHTG(k.value)}</p>
            </div>
          ))}
        </div>

        {/* ── Filtres ── */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Référence, description…"
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all bg-white"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 bg-white text-gray-700"
          >
            <option value="all">Tous les types</option>
            <option value="deposit">Dépôts</option>
            <option value="withdrawal">Retraits</option>
            <option value="transfer">Transferts</option>
            <option value="fee">Frais</option>
            <option value="interest">Intérêts</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-[#2E7D32] animate-spin" />
              <p className="text-sm text-gray-400">Chargement de l'historique…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Inbox className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Aucune transaction trouvée</p>
              <p className="text-xs text-gray-400">
                {transactions.length === 0
                  ? 'Ce compte n\'a pas encore de transactions'
                  : 'Modifiez vos filtres'}
              </p>
            </div>
          ) : (
            <>
              {/* En-tête table */}
              <div className="grid px-6 py-2.5 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500"
                style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1.5fr 1fr' }}>
                <span>Date</span>
                <span>Type</span>
                <span>Montant</span>
                <span>Solde après</span>
                <span>Référence</span>
                <span>Statut</span>
              </div>

              <div className="divide-y divide-gray-50">
                {filtered.map((tx, i) => {
                  const cfg  = TX_CFG[tx.transaction_type] ?? TX_CFG['fee'];
                  const sign = SIGN[tx.transaction_type] ?? '';
                  const { date, time } = formatDate(tx.date ?? tx.created_at ?? '');
                  const isCredit = tx.transaction_type === 'deposit' || tx.transaction_type === 'interest';

                  return (
                    <div key={tx.id}
                      className={`grid items-center px-6 py-3 transition-colors ${
                        i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
                      }`}
                      style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1.5fr 1fr' }}>

                      {/* Date */}
                      <div>
                        <p className="text-xs font-medium text-gray-800">{date}</p>
                        <p className="text-xs text-gray-400">{time}</p>
                      </div>

                      {/* Type */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium ${cfg.badge}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>

                      {/* Montant */}
                      <div className={`text-sm font-bold ${cfg.amount}`}>
                        {sign}{formatHTG(tx.amount)}
                      </div>

                      {/* Solde après */}
                      <div className="text-sm font-semibold text-gray-700">
                        {formatHTG(tx.balance_after)}
                      </div>

                      {/* Référence + description */}
                      <div className="min-w-0">
                        <p className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded inline-block max-w-full truncate">
                          {tx.reference_number || 'N/A'}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{tx.description}</p>
                        )}
                      </div>

                      {/* Statut */}
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          tx.status === 'completed' ? 'bg-[#DDEAD5] text-[#1B5E20]' :
                          tx.status === 'pending'   ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === 'completed' ? 'bg-[#2E7D32]' :
                            tx.status === 'pending'   ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          {tx.status === 'completed' ? 'Complété' :
                           tx.status === 'pending'   ? 'En attente' : tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-[#F9F9F6] shrink-0">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{filtered.length}</span> transaction{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''} sur {transactions.length}
          </p>
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}