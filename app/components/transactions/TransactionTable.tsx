'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Zap, ChevronUp, ChevronDown, ChevronsUpDown,
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Landmark,
  CheckCircle2, Clock, XCircle, Loader2,
  Search, X, CheckCheck,
} from 'lucide-react';
import { TransactionData } from './types';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TabId = 'all' | 'pending' | 'failed';

interface TransactionTableProps {
  transactions: TransactionData[];
  isLoading?:   boolean;
  onView:       (t: TransactionData) => void;
  onProcess:    (t: TransactionData) => void;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const TYPE_CFG: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  deposit:    { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', icon: ArrowDownCircle, label: 'Dépôt'    },
  withdrawal: { bg: 'bg-blue-50',   text: 'text-[#355C7D]', icon: ArrowUpCircle,   label: 'Retrait'  },
  transfer:   { bg: 'bg-yellow-50', text: 'text-yellow-700',icon: ArrowLeftRight,  label: 'Virement' },
  loan:       { bg: 'bg-gray-100',  text: 'text-gray-600',  icon: Landmark,        label: 'Prêt'     },
};

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  completed:  { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', label: 'Complétée'  },
  pending:    { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400 animate-pulse', label: 'En attente' },
  processing: { bg: 'bg-blue-50',   text: 'text-[#355C7D]', dot: 'bg-[#355C7D] animate-pulse',  label: 'En cours'   },
  failed:     { bg: 'bg-red-50',    text: 'text-red-600',   dot: 'bg-red-500',   label: 'Échouée'    },
};

const TAB_CFG: Record<TabId, { label: string; statuses: string[] | null }> = {
  all:     { label: 'Toutes',      statuses: null                          },
  pending: { label: 'En attente',  statuses: ['pending', 'processing']     },
  failed:  { label: 'Échouées',    statuses: ['failed']                    },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatHTG(n?: number) {
  if (n == null) return '—';
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function formatDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - dt.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH   = Math.floor(diffMs / 3600000);
  const diffD   = Math.floor(diffMs / 86400000);
  if (diffMin < 60)  return `Il y a ${diffMin} min`;
  if (diffH   < 24)  return `Il y a ${diffH} h`;
  if (diffD   < 7)   return `Il y a ${diffD} j`;
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

function SkeletonRow() {
  return (
    <div className="grid items-center px-5 py-3.5 border-b border-gray-50"
      style={{ gridTemplateColumns: '40px 1.2fr 1.4fr 1fr 1.2fr 1fr 1fr 100px' }}>
      <div className="w-4 h-4 rounded bg-gray-100 animate-pulse mx-auto" />
      <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
      <div className="flex flex-col gap-1"><div className="h-3 w-28 bg-gray-100 animate-pulse rounded" /><div className="h-2.5 w-20 bg-gray-100 animate-pulse rounded" /></div>
      <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-lg" />
      <div className="h-3.5 w-24 bg-gray-100 animate-pulse rounded" />
      <div className="h-5 w-20 bg-gray-100 animate-pulse rounded-full" />
      <div className="h-3 w-16 bg-gray-100 animate-pulse rounded" />
      <div className="flex gap-1 justify-center"><div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" /></div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions, isLoading = false, onView, onProcess,
}) => {
  const [activeTab,  setActiveTab]  = useState<TabId>('all');
  const [search,     setSearch]     = useState('');
  const [sortField,  setSortField]  = useState('created_at');
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('desc');
  const [selected,   setSelected]   = useState<Set<string | number>>(new Set());

  // Counts per tab
  const counts = useMemo(() => ({
    all:     transactions.length,
    pending: transactions.filter(t => ['pending', 'processing'].includes(t.status)).length,
    failed:  transactions.filter(t => t.status === 'failed').length,
  }), [transactions]);

  // Filter
  const filtered = useMemo(() => {
    let list = transactions;
    const cfg = TAB_CFG[activeTab];
    if (cfg.statuses) list = list.filter(t => cfg.statuses!.includes(t.status));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q)   ||
        t.member_name?.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    }
    return list;
  }, [transactions, activeTab, search]);

  // Sort
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let va: any = sortField === 'amount' ? a.amount ?? 0 : (a as any)[sortField] ?? '';
    let vb: any = sortField === 'amount' ? b.amount ?? 0 : (b as any)[sortField] ?? '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  }), [filtered, sortField, sortDir]);

  const toggleSort = (f: string) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('desc'); }
  };

  const allSel  = selected.size === sorted.length && sorted.length > 0;
  const someSel = selected.size > 0 && !allSel;
  const toggleAll = () => allSel ? setSelected(new Set()) : setSelected(new Set(sorted.map(t => t.id)));
  const toggleRow = (id: string | number) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };

  const COLS = [
    { label: 'Référence', field: 'reference'   },
    { label: 'Membre',    field: 'member_name' },
    { label: 'Type',      field: 'type'        },
    { label: 'Montant',   field: 'amount'      },
    { label: 'Statut',    field: 'status'      },
    { label: 'Date',      field: 'created_at'  },
  ];

  const GRID = '40px 1.2fr 1.4fr 1fr 1.2fr 1fr 1fr 100px';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Header : onglets + recherche ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 border-b border-gray-100 bg-white gap-0">

        {/* Onglets */}
        <div className="flex items-center">
          {(Object.keys(TAB_CFG) as TabId[]).map(tab => {
            const active = activeTab === tab;
            const activeStyle =
              tab === 'pending' ? 'border-yellow-400 text-yellow-700' :
              tab === 'failed'  ? 'border-red-400 text-red-600' :
                                  'border-[#2E7D32] text-[#1B5E20]';
            const badge =
              tab === 'pending' ? 'bg-yellow-50 text-yellow-700' :
              tab === 'failed'  ? 'bg-red-50 text-red-500'       :
                                  'bg-[#DDEAD5] text-[#1B5E20]';
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelected(new Set()); }}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 ${
                  active ? `${activeStyle} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {TAB_CFG[tab].label}
                {counts[tab] > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${active ? badge : 'bg-gray-100 text-gray-500'}`}>
                    {counts[tab]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recherche */}
        <div className="relative px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Référence, membre, montant…"
            className="pl-8 pr-8 py-1.5 text-xs rounded-xl border border-gray-200 bg-[#F9F9F6] focus:outline-none focus:ring-1 focus:ring-[#DDEAD5] focus:border-[#DDEAD5] w-56 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Bannière En attente ── */}
      {activeTab === 'pending' && counts.pending > 0 && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-yellow-50 border-b border-yellow-100">
          <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
          <p className="text-xs font-semibold text-yellow-700">
            {counts.pending} transaction{counts.pending > 1 ? 's' : ''} en attente de traitement
          </p>
        </div>
      )}

      {/* ── Bannière Échouées ── */}
      {activeTab === 'failed' && counts.failed > 0 && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-red-50 border-b border-red-100">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs font-semibold text-red-600">
            {counts.failed} transaction{counts.failed > 1 ? 's' : ''} échouée{counts.failed > 1 ? 's' : ''} — vérification requise
          </p>
        </div>
      )}

      {/* ── Barre sélection multiple ── */}
      {selected.size > 0 && (
        <div className="px-5 py-2.5 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-sm font-semibold text-[#1B5E20]">
              {selected.size} sélectionnée{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
              Exporter
            </button>
            <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-lg text-gray-500 hover:bg-white/60 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Header colonnes ── */}
      <div className="grid items-center px-5 py-3 border-b border-gray-100 bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]"
        style={{ gridTemplateColumns: GRID }}>
        <div className="flex justify-center">
          <input type="checkbox" checked={allSel} ref={el => { if (el) el.indeterminate = someSel; }}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer" />
        </div>
        {COLS.map(col => (
          <button key={col.field}
            onClick={() => col.field && toggleSort(col.field)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-700 text-left transition-colors">
            {col.label}
            {col.field && <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />}
          </button>
        ))}
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 text-center">Actions</div>
      </div>

      {/* ── Rows ── */}
      <div className="divide-y divide-gray-50">

        {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F9F6] border border-gray-100 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {search ? 'Aucun résultat pour cette recherche' : 'Aucune transaction'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-[#2E7D32] hover:underline">
                Effacer la recherche
              </button>
            )}
          </div>
        )}

        {!isLoading && sorted.map(tx => {
          const typeCfg   = TYPE_CFG[tx.type]   ?? TYPE_CFG['deposit'];
          const statusCfg = STATUS_CFG[tx.status] ?? STATUS_CFG['pending'];
          const TypeIcon  = typeCfg.icon;
          const isSel     = selected.has(tx.id);
          const isDeposit = tx.type === 'deposit';

          return (
            <div key={tx.id}
              className={`grid items-center px-5 py-3 transition-colors ${
                isSel ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]' : 'hover:bg-[#DDEAD5]/10 border-l-2 border-transparent'
              }`}
              style={{ gridTemplateColumns: GRID }}>

              {/* Checkbox */}
              <div className="flex justify-center">
                <input type="checkbox" checked={isSel} onChange={() => toggleRow(tx.id)}
                  className="w-3.5 h-3.5 rounded accent-[#2E7D32] cursor-pointer" />
              </div>

              {/* Référence */}
              <div>
                <p className="text-xs font-mono font-semibold text-gray-700 truncate">
                  {tx.reference ?? `#${tx.id}`}
                </p>
                <p className="text-xs text-gray-400 truncate max-w-[150px]">{tx.description}</p>
              </div>

              {/* Membre */}
              <div>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {tx.member_name ?? '—'}
                </p>
                {tx.account_number && (
                  <p className="text-xs font-mono text-gray-400">{tx.account_number}</p>
                )}
              </div>

              {/* Type */}
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold w-fit ${typeCfg.bg} ${typeCfg.text}`}>
                <TypeIcon className="w-3 h-3 shrink-0" />
                {typeCfg.label}
              </span>

              {/* Montant */}
              <p className={`text-sm font-bold ${isDeposit ? 'text-[#2E7D32]' : 'text-gray-800'}`}>
                {isDeposit ? '+' : tx.type === 'withdrawal' ? '−' : ''}{formatHTG(tx.amount)}
              </p>

              {/* Statut */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${statusCfg.bg} ${statusCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>

              {/* Date */}
              <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                <button title="Voir" onClick={() => onView(tx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                {(tx.status === 'pending' || tx.status === 'processing') && (
                  <button title="Traiter" onClick={() => onProcess(tx)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
                    <Zap className="w-3 h-3" /> Traiter
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {!isLoading && transactions.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span> résultat{sorted.length !== 1 ? 's' : ''}
            {search && <span> pour « {search} »</span>}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> {counts.pending} en attente
            </span>
            {counts.failed > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {counts.failed} échouée{counts.failed > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;