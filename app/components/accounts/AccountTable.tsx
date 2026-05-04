'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, XCircle, Phone, Mail, Receipt,
  ChevronDown, ChevronUp, ChevronsUpDown,
  Check, CheckCircle2, X, Archive,
  Wallet, ShieldAlert, TrendingUp, TrendingDown, Minus,
  ShieldOff, ShieldCheck,
} from 'lucide-react';
import { AccountData } from './validationsaccount';
import AccountBulkActionDropdown, { AccountBulkAction } from './AccountBulkActionDropdown';
import AccountBulkActionModal from './modals/AccountBulkActionModal';
import UserAvatar from '../core/UserAvatar';

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// 1. Suppression COMPLÈTE des références à 'en_attente', 'archive', 'suspendu',
//    'inactif', 'ferme' et `statutCompte`.
//
// 2. Modèle unifié : 3 statuts seulement → 'ouvert' | 'gelé' | 'fermé'.
//    Onglet "Archive" est juste le LABEL UI pour le statut métier 'fermé'.
//
// 3. `getEffectiveStatus` lit `acc.statusAccount` directement (plus aucune
//    conversion `archive ↔ fermé` ni `suspendu ↔ gelé`).
//
// 4. Bannière "comptes en attente" supprimée — le concept n'existe plus.
//
// 5. Action "Activer" (qui prenait un compte 'en_attente' vers 'ouvert')
//    supprimée. Il ne reste que : Voir, Transactions, Geler, Débloquer, Fermer.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountStatus = 'ouvert' | 'gelé' | 'fermé';
type TabId         = AccountStatus;

interface AccountTableProps {
  accounts:           AccountData[];
  isLoading:          boolean;
  onView:             (a: AccountData) => void;
  onSuspend:          (a: AccountData) => void;
  onClose:            (a: AccountData) => void;
  onViewTransactions: (a: AccountData) => void;
  onBulkAction:       (action: AccountBulkAction, ids: string[]) => Promise<void>;
  activeTab?:         TabId;
  onTabChange?:       (tab: TabId) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<AccountStatus, { bg: string; text: string; dot: string; label: string }> = {
  ouvert: { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', label: 'Ouvert' },
  gelé:   { bg: 'bg-blue-50',   text: 'text-[#355C7D]', dot: 'bg-[#355C7D]', label: 'Gelé'   },
  fermé:  { bg: 'bg-gray-100',  text: 'text-gray-500',  dot: 'bg-gray-400',  label: 'Fermé'  },
};

const TYPE_CFG: Record<string, { bg: string; text: string; label: string }> = {
  epargne: { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', label: 'Épargne' },
  cheques: { bg: 'bg-blue-50',   text: 'text-[#355C7D]', label: 'Chèques' },
  terme:   { bg: 'bg-yellow-50', text: 'text-[#854F0B]', label: 'Terme'   },
};

const COLS = [
  { label: 'Compte / Membre', field: 'account_number' },
  { label: 'Type',            field: 'typeCompte'     },
  { label: 'Solde',           field: 'solde'          },
  { label: 'Depuis',          field: 'created_at'     },
  { label: 'Statut',          field: 'statusAccount'  },
];

const GRID = '40px 2.5fr 1fr 1.2fr 1fr 1fr 130px';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Lit directement `statusAccount`. Fallback minimal sur le booléen API.
function getEffectiveStatus(a: AccountData): AccountStatus {
  if (a.statusAccount === 'gelé')  return 'gelé';
  if (a.statusAccount === 'fermé') return 'fermé';
  if (a.statusAccount === 'ouvert') return 'ouvert';
  // Fallback : si statusAccount est vide, on déduit du booléen API
  return a.account_status ? 'ouvert' : 'fermé';
}

function formatHTG(n?: number | null) {
  if (n == null) return '0 HTG';
  return new Intl.NumberFormat('fr-HT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n) + ' HTG';
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDir }: {
  field: string; sortField: string; sortDir: string;
}) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="grid items-center px-5 py-3.5 border-b border-gray-50"
      style={{ gridTemplateColumns: GRID }}>
      <div className="flex justify-center"><div className="w-4 h-4 rounded bg-gray-100 animate-pulse" /></div>
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-36 bg-gray-100 animate-pulse rounded" />
        <div className="h-2.5 w-44 bg-gray-100 animate-pulse rounded" />
      </div>
      <div className="h-3 w-28 bg-gray-100 animate-pulse rounded" />
      <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-lg" />
      <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
      <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-full" />
      <div className="flex justify-center gap-1">
        {[...Array(3)].map((_, i) => <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />)}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  isLoading,
  onView,
  onSuspend,
  onClose,
  onViewTransactions,
  onBulkAction,
  activeTab: externalTab,
  onTabChange,
}) => {
  const [localTab,     setLocalTab]     = useState<TabId>('ouvert');
  const activeTab = externalTab ?? localTab;

  const [sortField,    setSortField]    = useState('account_number');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<AccountBulkAction | null>(null);

  // ── Counts (3 statuts seulement) ──────────────────────────────────────────
  const counts = useMemo(() => ({
    ouvert: accounts.filter(a => getEffectiveStatus(a) === 'ouvert').length,
    gelé:   accounts.filter(a => getEffectiveStatus(a) === 'gelé').length,
    fermé:  accounts.filter(a => getEffectiveStatus(a) === 'fermé').length,
  }), [accounts]);

  // ── Tab filter ────────────────────────────────────────────────────────────
  const tabAccounts = useMemo(
    () => accounts.filter(a => getEffectiveStatus(a) === activeTab),
    [accounts, activeTab],
  );

  // ── Sort ──────────────────────────────────────────────────────────────────
  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = useMemo(() => [...tabAccounts].sort((a, b) => {
    let va: any = sortField === 'member' ? a.member_details?.full_name ?? ''
                : sortField === 'solde'  ? (a.soldeActuel ?? 0)
                : (a as any)[sortField] ?? '';
    let vb: any = sortField === 'member' ? b.member_details?.full_name ?? ''
                : sortField === 'solde'  ? (b.soldeActuel ?? 0)
                : (b as any)[sortField] ?? '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  }), [tabAccounts, sortField, sortDir]);

  const selectedAccounts = useMemo(
    () => sorted.filter(a => selected.has(a.id as string)),
    [sorted, selected],
  );

  // ── Selection ─────────────────────────────────────────────────────────────
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected
    ? setSelected(new Set())
    : setSelected(new Set(sorted.map(a => a.id as string)));
  const toggleRow = (id: string) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };

  const handleTabChange = (tab: TabId) => {
    setLocalTab(tab);
    onTabChange?.(tab);
    setSelected(new Set());
  };

  const isFermeTab = activeTab === 'fermé';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Onglets (3 seulement) ── */}
      <div className="flex items-center px-2 border-b border-gray-100 bg-white">
        {([
          { id: 'ouvert' as TabId, label: 'Ouverts', icon: Wallet,    active: 'border-[#2E7D32] text-[#1B5E20]', badge: 'bg-[#DDEAD5] text-[#1B5E20]', count: counts.ouvert },
          { id: 'gelé'   as TabId, label: 'Gelés',   icon: ShieldOff, active: 'border-[#355C7D] text-[#355C7D]', badge: 'bg-blue-100 text-[#355C7D]',  count: counts.gelé   },
          { id: 'fermé'  as TabId, label: 'Archive', icon: Archive,   active: 'border-gray-400 text-gray-600',   badge: 'bg-gray-100 text-gray-600',   count: counts.fermé  },
        ]).map(tab => {
          const Icon      = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 ${
                isCurrent ? `${tab.active} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                  isCurrent ? tab.badge : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Bannières ── */}
      {isFermeTab && (
        <div className="flex items-start gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
          <Archive className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-600">Comptes fermés — Lecture seule</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Ces comptes ne peuvent plus recevoir ni émettre de transactions.
            </p>
          </div>
        </div>
      )}

      {!isFermeTab && counts.gelé > 0 && (
        <div className="flex items-start gap-3 px-5 py-3 bg-blue-50 border-b border-blue-100">
          <ShieldAlert className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
          <p className="text-xs text-[#355C7D]">
            <strong>{counts.gelé}</strong> compte{counts.gelé > 1 ? 's' : ''} gelé{counts.gelé > 1 ? 's' : ''} nécessite{counts.gelé > 1 ? 'nt' : ''} une action
          </p>
        </div>
      )}

      {/* ── Barre sélection multiple ── */}
      {selected.size > 0 && (
        <div className="px-5 py-3 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-sm font-semibold text-[#1B5E20]">
              {selected.size} compte{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {!isFermeTab && (
              <AccountBulkActionDropdown
                selectedCount={selected.size}
                isOpen={dropdownOpen}
                onToggle={() => setDropdownOpen(o => !o)}
                onAction={(action) => setActiveAction(action)}
              />
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── En-tête colonnes ── */}
      {(isLoading || sorted.length > 0) && (
        <div className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
          style={{ display: 'grid', gridTemplateColumns: GRID }}>
          <div className="flex items-center justify-center">
            <button onClick={toggleAll}
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                allSelected || someSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
              }`}>
              {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </button>
          </div>
          {COLS.map(col => (
            <button key={col.label} onClick={() => col.field && toggleSort(col.field)}
              className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left transition-colors ${
                col.field ? 'text-gray-600 hover:text-[#1B5E20] cursor-pointer' : 'text-gray-600 cursor-default'
              }`}>
              {col.label}
              {col.field && <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />}
            </button>
          ))}
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">Actions</span>
        </div>
      )}

      {/* ── Lignes ── */}
      <div className="divide-y divide-gray-50">

        {isLoading && [...Array(8)].map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isFermeTab ? 'bg-gray-100' : 'bg-[#DDEAD5]'}`}>
              <Wallet className={`w-7 h-7 ${isFermeTab ? 'text-gray-400' : 'text-[#2E7D32]'}`} />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Aucun compte trouvé</p>
            <p className="text-xs text-gray-400">Modifiez vos critères de recherche</p>
          </div>
        )}

        {!isLoading && sorted.map((acc, i) => {
          const status     = getEffectiveStatus(acc);
          const statusCfg  = STATUS_CFG[status];
          const typeCfg    = acc.typeCompte
            ? (TYPE_CFG[acc.typeCompte] ?? { bg: 'bg-gray-100', text: 'text-gray-500', label: acc.typeCompte })
            : { bg: 'bg-gray-100', text: 'text-gray-500', label: '—' };
          const isSelected = selected.has(acc.id as string);
          const solde      = acc.soldeActuel ?? 0;

          return (
            <div key={acc.id}
              className={`cursor-default grid items-center px-5 py-3.5 transition-all duration-150 ${
                isFermeTab ? 'opacity-65' : ''
              } ${
                isSelected
                  ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
              }`}
              style={{ gridTemplateColumns: GRID }}>

              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <button onClick={() => toggleRow(acc.id as string)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
              </div>

              {/* Compte + Membre */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`relative shrink-0 ${isFermeTab ? 'opacity-50 grayscale' : ''}`}>
                  <UserAvatar
                    user={{
                      first_name:   acc.member_details?.first_name ?? '',
                      last_name:    acc.member_details?.last_name  ?? '',
                      photo_profil: acc.member_details?.photo_profil,
                    }}
                    size="sm"
                  />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold font-mono tracking-wide truncate ${isFermeTab ? 'text-gray-400' : 'text-gray-900'}`}>
                    {acc.account_number}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {acc.member_details?.full_name ?? acc.id_membre ?? '—'}
                  </p>
                  {acc.member_details?.email && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="text-xs text-gray-400 truncate">{acc.member_details.email}</span>
                    </div>
                  )}
                  {acc.member_details?.phone_number && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="text-xs text-gray-400">{acc.member_details.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Type */}
              <div>
                <span className={`inline-flex px-2 py-0.5 text-xs rounded-lg font-medium ${typeCfg.bg} ${typeCfg.text}`}>
                  {typeCfg.label}
                </span>
              </div>

              {/* Solde */}
              <div className="flex items-center gap-1.5">
                {solde > 0
                  ? <TrendingUp   className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                  : solde < 0
                    ? <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    : <Minus        className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                <span className={`text-sm font-bold ${
                  isFermeTab ? 'text-gray-400' :
                  solde > 0  ? 'text-[#2E7D32]' :
                  solde < 0  ? 'text-red-500'   : 'text-gray-400'
                }`}>
                  {formatHTG(solde)}
                </span>
              </div>

              {/* Depuis */}
              <div>
                <span className="text-xs text-gray-500">
                  {acc.created_at
                    ? new Date(acc.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>

              {/* Statut */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                <button title="Voir" onClick={() => onView(acc)}
                  className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-blue-50 hover:text-blue-500">
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button title="Transactions" onClick={() => onViewTransactions(acc)}
                  className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-purple-50 hover:text-purple-500">
                  <Receipt className="w-3.5 h-3.5" />
                </button>

                {status === 'ouvert' && (
                  <>
                    <button title="Geler" onClick={() => onSuspend(acc)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-blue-50 hover:text-[#355C7D]">
                      <ShieldOff className="w-3.5 h-3.5" />
                    </button>
                    <button title="Fermer" onClick={() => onClose(acc)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {status === 'gelé' && (
                  <>
                    <button title="Débloquer" onClick={() => onSuspend(acc)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
                      <ShieldCheck className="w-3 h-3" /> Débloquer
                    </button>
                    <button title="Fermer" onClick={() => onClose(acc)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {status === 'fermé' && (
                  <span className="px-2 py-1 text-xs text-gray-400 bg-gray-50 rounded-lg">Archivé</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {!isLoading && accounts.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span> résultat{sorted.length !== 1 ? 's' : ''} sur cet onglet
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> {counts.ouvert} Ouvert{counts.ouvert !== 1 ? 's' : ''}
            </span>
            {counts.gelé > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-[#355C7D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#355C7D]" /> {counts.gelé} Gelé{counts.gelé !== 1 ? 's' : ''}
              </span>
            )}
            {counts.fermé > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {counts.fermé} Fermé{counts.fermé !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      <AccountBulkActionModal
        action={activeAction}
        accounts={selectedAccounts}
        onClose={() => setActiveAction(null)}
        onConfirm={async (action, eligibleIds) => {
          await onBulkAction(action, eligibleIds);
          setSelected(new Set());
          setActiveAction(null);
        }}
      />
    </div>
  );
};

export default AccountTable;