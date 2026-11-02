'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Search, TrendingUp, TrendingDown, ArrowLeftRight,
  Receipt, Percent, Loader2, Inbox, HandCoins, Landmark, RefreshCw,
} from 'lucide-react';
import type { AccountData } from '../validationsaccount';
import AxiosInstance from '@/app/lib/axiosInstance';

// ─── Données Django (GET /api/transactions/) ──────────────────────────────────

interface TransactionApiRaw {
  id:                        string;
  transaction_type:          string;          // « DEPOSIT », « WITHDRAWAL »…
  transaction_type_display?: string | null;
  account?:                  string | null;
  account_id?:               string | null;
  account_number?:           string | null;
  to_account?:               string | null;
  to_account_number?:        string | null;
  amount:                    string;          // « 1500.00 »
  currency?:                 string | null;
  method?:                   string | null;
  reference?:                string | null;
  status?:                   string | null;
  note?:                     string | null;
  reason?:                   string | null;
  member_name?:              string | null;
  new_balance?:              string | null;
  created_at?:               string | null;
}

type Kind = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'loan_payment' | 'loan_disbursement' | 'fee' | 'interest' | 'other';

interface HistoryRow {
  id:          string;
  kind:        Kind;
  label:       string;
  amount:      number;
  isCredit:    boolean;
  balanceAfter: number | null;
  reference:   string;
  description: string;
  status:      string;
  date:        string;
}

const KIND_OF: Record<string, Kind> = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal', WITHDRAW: 'withdrawal',
  LOAN_PAYMENT: 'loan_payment', LOAN_REPAYMENT: 'loan_payment', REPAYMENT: 'loan_payment',
  LOAN_DISBURSEMENT: 'loan_disbursement', DISBURSEMENT: 'loan_disbursement',
  FEE: 'fee', FEES: 'fee',
  INTEREST: 'interest',
};

/**
 * Transforme une transaction Django en ligne d'historique, du point de vue
 * du compte affiché : un transfert sort de `account` et entre dans `to_account`.
 */
function toRow(t: TransactionApiRaw, accountId: string): HistoryRow | null {
  const type   = (t.transaction_type ?? '').toUpperCase();
  const source = t.account_id ?? t.account ?? null;
  const isSource = source === accountId;
  const isTarget = t.to_account === accountId;
  if (!isSource && !isTarget) return null;       // n'appartient pas à ce compte

  let kind: Kind = KIND_OF[type] ?? 'other';
  if (type === 'TRANSFER') kind = isTarget && !isSource ? 'transfer_in' : 'transfer_out';

  const isCredit = ['deposit', 'transfer_in', 'loan_disbursement', 'interest'].includes(kind);
  const amount   = Number(t.amount) || 0;
  const label    = kind === 'transfer_in'  ? 'Transfert reçu'
                 : kind === 'transfer_out' ? 'Transfert envoyé'
                 : (t.transaction_type_display || TX_CFG[kind].label);

  const description =
    kind === 'transfer_out' && t.to_account_number ? `Vers ${t.to_account_number}` :
    kind === 'transfer_in'  && t.account_number    ? `De ${t.account_number}` :
    (t.note || t.reason || '');

  return {
    id: t.id,
    kind,
    label,
    amount,
    isCredit,
    // new_balance est le solde du compte source : inconnu pour un transfert reçu
    balanceAfter: isSource && t.new_balance != null ? Number(t.new_balance) : null,
    reference:   t.reference || '',
    description,
    status:      (t.status || 'completed').toLowerCase(),
    date:        t.created_at || '',
  };
}

async function fetchAccountHistory(accountId: string): Promise<HistoryRow[]> {
  // Le filtre ?account= est demandé au serveur ; s'il est ignoré, toRow()
  // écarte de toute façon les transactions des autres comptes.
  const { data } = await AxiosInstance.get<TransactionApiRaw[] | { results: TransactionApiRaw[] }>(
    'transactions/', { params: { account: accountId } },
  );
  const list = Array.isArray(data) ? data : (data?.results ?? []);
  return list
    .map(t => toRow(t, accountId))
    .filter((r): r is HistoryRow => r !== null)
    .sort((a, b) => b.date.localeCompare(a.date));      // plus récentes d'abord
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AccountHistoryModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  account:  AccountData | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const TX_CFG: Record<Kind, {
  label: string; icon: React.ReactNode; badge: string;
}> = {
  deposit:           { label: 'Dépôt',              icon: <TrendingUp     className="w-3.5 h-3.5" />, badge: 'bg-[#DDEAD5] text-[#1B5E20]'  },
  withdrawal:        { label: 'Retrait',            icon: <TrendingDown   className="w-3.5 h-3.5" />, badge: 'bg-red-50 text-red-600'        },
  transfer_in:       { label: 'Transfert reçu',     icon: <ArrowLeftRight className="w-3.5 h-3.5" />, badge: 'bg-blue-50 text-blue-600'      },
  transfer_out:      { label: 'Transfert envoyé',   icon: <ArrowLeftRight className="w-3.5 h-3.5" />, badge: 'bg-blue-50 text-blue-600'      },
  loan_payment:      { label: 'Remboursement prêt', icon: <HandCoins      className="w-3.5 h-3.5" />, badge: 'bg-yellow-50 text-yellow-700'  },
  loan_disbursement: { label: 'Décaissement prêt',  icon: <Landmark       className="w-3.5 h-3.5" />, badge: 'bg-yellow-50 text-yellow-700'  },
  fee:               { label: 'Frais',              icon: <Receipt        className="w-3.5 h-3.5" />, badge: 'bg-amber-50 text-amber-700'    },
  interest:          { label: 'Intérêt',            icon: <Percent        className="w-3.5 h-3.5" />, badge: 'bg-purple-50 text-purple-700'  },
  other:             { label: 'Opération',          icon: <Receipt        className="w-3.5 h-3.5" />, badge: 'bg-gray-100 text-gray-600'     },
};

/** Filtre du menu déroulant → types inclus */
const FILTER_KINDS: Record<string, Kind[]> = {
  deposit:    ['deposit'],
  withdrawal: ['withdrawal'],
  transfer:   ['transfer_in', 'transfer_out'],
  loan:       ['loan_payment', 'loan_disbursement'],
  fee:        ['fee'],
  interest:   ['interest'],
};

const STATUS_LABEL: Record<string, { label: string; cls: string; dot: string }> = {
  completed: { label: 'Complété',   cls: 'bg-[#DDEAD5] text-[#1B5E20]', dot: 'bg-[#2E7D32]' },
  pending:   { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
  failed:    { label: 'Échoué',     cls: 'bg-red-50 text-red-600',       dot: 'bg-red-400' },
  cancelled: { label: 'Annulé',     cls: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
  reversed:  { label: 'Annulé',     cls: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n) + ' HTG';
}

function formatDate(iso: string) {
  if (!iso) return { date: '—', time: '' };
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
  const [transactions, setTransactions] = useState<HistoryRow[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const [reloadKey,    setReloadKey]    = useState(0);
  const [filterType,   setFilterType]   = useState('all');
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    if (!isOpen || !account?.id) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setSearch('');
    setFilterType('all');
    fetchAccountHistory(String(account.id))
      .then(rows => { if (!cancelled) setTransactions(rows); })
      .catch(() => {
        if (!cancelled) {
          setTransactions([]);
          setLoadError("Impossible de charger l'historique. Vérifiez la connexion puis réessayez.");
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, account?.id, reloadKey]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter(t => {
      const matchType   = filterType === 'all' || FILTER_KINDS[filterType]?.includes(t.kind);
      const matchSearch = !q ||
        t.reference.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [transactions, filterType, search]);

  // KPIs — seules les opérations complétées ont modifié le solde
  const kpis = useMemo(() => {
    const done = transactions.filter(t => t.status === 'completed');
    const ins  = done.filter(t =>  t.isCredit).reduce((s, t) => s + t.amount, 0);
    const outs = done.filter(t => !t.isCredit).reduce((s, t) => s + t.amount, 0);
    return { deposits: ins, withdrawals: outs, net: ins - outs };
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
                {account.account_number} · <span className="capitalize">{account.member_details?.full_name ?? account.id_membre ?? '—'}</span>
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
            { label: 'Total entrées',  value: kpis.deposits,    color: 'text-[#1B5E20]', bg: 'bg-[#DDEAD5]' },
            { label: 'Total sorties',  value: kpis.withdrawals, color: 'text-red-600',   bg: 'bg-red-50'    },
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
            <option value="loan">Prêts</option>
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
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p className="text-sm font-semibold text-red-600">{loadError}</p>
              <button onClick={() => setReloadKey(k => k + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2E7D32] border border-[#2E7D32]/30 rounded-lg hover:bg-[#DDEAD5]/40">
                <RefreshCw className="w-3.5 h-3.5" /> Réessayer
              </button>
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
            <div>
              {/* En-tête table */}
              <div className="grid px-6 py-2.5 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500"
                style={{ gridTemplateColumns: '1fr 1.6fr 1.1fr 1fr 1.4fr 0.9fr' }}>
                <span>Date</span>
                <span>Type</span>
                <span>Montant</span>
                <span>Solde après</span>
                <span>Référence</span>
                <span>Statut</span>
              </div>

              <div className="divide-y divide-gray-50">
                {filtered.map((tx, i) => {
                  const cfg  = TX_CFG[tx.kind];
                  const { date, time } = formatDate(tx.date);
                  const st   = STATUS_LABEL[tx.status] ?? { label: tx.status, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

                  return (
                    <div key={tx.id}
                      className={`grid items-center px-6 py-3 transition-colors ${
                        i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
                      } ${tx.status === 'completed' ? '' : 'opacity-70'}`}
                      style={{ gridTemplateColumns: '1fr 1.6fr 1.1fr 1fr 1.4fr 0.9fr' }}>

                      {/* Date */}
                      <div>
                        <p className="text-xs font-medium text-gray-800">{date}</p>
                        <p className="text-xs text-gray-400">{time}</p>
                      </div>

                      {/* Type */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap ${cfg.badge}`}>
                          {cfg.icon}
                          {tx.label}
                        </span>
                      </div>

                      {/* Montant */}
                      <div className={`text-sm font-bold whitespace-nowrap ${tx.isCredit ? 'text-[#1B5E20]' : 'text-red-600'}`}>
                        {tx.isCredit ? '+' : '−'} {formatHTG(tx.amount)}
                      </div>

                      {/* Solde après */}
                      <div className="text-sm font-semibold text-gray-700">
                        {tx.balanceAfter != null ? formatHTG(tx.balanceAfter) : '—'}
                      </div>

                      {/* Référence + description */}
                      <div className="min-w-0">
                        <p className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded inline-block max-w-full truncate">
                          {tx.reference || '—'}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{tx.description}</p>
                        )}
                      </div>

                      {/* Statut */}
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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