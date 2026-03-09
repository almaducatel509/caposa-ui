'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, XCircle, Phone, Mail,
  ChevronDown, ChevronUp, ChevronsUpDown,
  Check, CheckCircle2, X, Archive,
  Wallet, ShieldAlert, TrendingUp, TrendingDown, Minus,
  ShieldOff, ShieldCheck
} from 'lucide-react';
import { AccountData } from './validationsaccount';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TabId = 'actif' | 'ferme';

interface AccountTableProps {
  accounts:        AccountData[];
  isLoading:       boolean;
  onView:          (a: AccountData) => void;
  onSuspend:       (a: AccountData) => void;
  onClose:         (a: AccountData) => void;
  forceSuspended?: boolean; // true quand filtre statut = 'suspendu' dans FilterBar
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  actif:    { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', label: 'Actif'    },
  suspendu: { bg: 'bg-blue-50',   text: 'text-[#355C7D]', dot: 'bg-[#355C7D]', label: 'Suspendu' },
  ferme:    { bg: 'bg-gray-100',  text: 'text-gray-500',  dot: 'bg-gray-400',  label: 'Fermé'    },
};

const TYPE_CFG: Record<string, { bg: string; text: string; label: string }> = {
  epargne: { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', label: 'Épargne'  },
  cheques: { bg: 'bg-blue-50',   text: 'text-[#355C7D]', label: 'Chèques'  },
  terme:   { bg: 'bg-yellow-50', text: 'text-[#D4AF37]', label: 'Terme'    },
};

const TAB_STATUSES: Record<TabId, string[]> = {
  actif: ['actif'],
  ferme: ['ferme'],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatHTG(n?: number) {
  if (n == null) return '0 HTG';
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}

function getEffectiveStatus(a: AccountData): string {
  return a.statutCompte ?? 'actif';
}

// ─── Sort icon ─────────────────────────────────────────────────────────────────
function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="grid items-center px-5 py-3.5 border-b border-gray-50"
      style={{ gridTemplateColumns: '40px 2fr 1.5fr 1fr 1.5fr 1fr 110px' }}>
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

// ─── Main ──────────────────────────────────────────────────────────────────────
const AccountTable: React.FC<AccountTableProps> = ({
  accounts, isLoading, onView, onSuspend, onClose, forceSuspended = false,
}) => {
  const [activeTab,     setActiveTab]     = useState<TabId>('actif');
  const [showSuspended, setShowSuspended] = useState(false);
  const [sortField,     setSortField]     = useState('account_number');
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('asc');
  const [selected,      setSelected]      = useState<Set<string>>(new Set());

  // Sync toggle avec le filtre externe (FilterBar)
  const effectiveSuspended = showSuspended || forceSuspended;

  // Counts
  const counts = useMemo(() => ({
    actif:    accounts.filter(a => getEffectiveStatus(a) === 'actif').length,
    suspendu: accounts.filter(a => getEffectiveStatus(a) === 'suspendu').length,
    ferme:    accounts.filter(a => getEffectiveStatus(a) === 'ferme').length,
  }), [accounts]);

  // Filter by tab + toggle suspendus
  const tabAccounts = useMemo(() => {
    if (activeTab === 'ferme') return accounts.filter(a => getEffectiveStatus(a) === 'ferme');
    const statuses = effectiveSuspended ? ['actif', 'suspendu'] : ['actif'];
    return accounts.filter(a => statuses.includes(getEffectiveStatus(a)));
  }, [accounts, activeTab, effectiveSuspended]);

  // Sort
  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = useMemo(() => [...tabAccounts].sort((a, b) => {
    let va: any = sortField === 'member'  ? a.member_details?.full_name ?? ''
                : sortField === 'solde'   ? a.soldeActuel ?? 0
                : (a as any)[sortField] ?? '';
    let vb: any = sortField === 'member'  ? b.member_details?.full_name ?? ''
                : sortField === 'solde'   ? b.soldeActuel ?? 0
                : (b as any)[sortField] ?? '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  }), [tabAccounts, sortField, sortDir]);

  // Selection
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(a => a.id as string)));
  const toggleRow    = (id: string) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };
  const handleTabChange = (tab: TabId) => { setActiveTab(tab); setSelected(new Set()); };

  const isFermeTab = activeTab === 'ferme';
  const isReadOnly = isFermeTab;

  const COLS = [
    { label: 'Compte / Membre', field: 'account_number' },
    { label: 'Contact',         field: null              },
    { label: 'Type',            field: 'typeCompte'      },
    { label: 'Solde',           field: 'solde'           },
    { label: 'Statut',          field: 'statutCompte'    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Onglets + toggle suspendus ── */}
      <div className="flex items-center px-2 border-b border-gray-100 bg-white">
        {/* Onglets Actifs / Fermés */}
        <div className="flex items-center flex-1">
          {([
            { id: 'actif' as TabId, label: 'Actifs', icon: Wallet,  active: 'border-[#2E7D32] text-[#1B5E20]', badge: 'bg-[#DDEAD5] text-[#1B5E20]' },
            { id: 'ferme' as TabId, label: 'Fermés', icon: Archive, active: 'border-gray-400 text-gray-600',   badge: 'bg-gray-100 text-gray-600'    },
          ]).map(tab => {
            const Icon     = tab.icon;
            const isActive = activeTab === tab.id;
            const count    = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 ${
                  isActive ? `${tab.active} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${isActive ? tab.badge : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toggle suspendus — visible seulement sur l'onglet Actifs */}
        {activeTab === 'actif' && counts.suspendu > 0 && (
          <button
            onClick={() => { setShowSuspended(s => !s); setSelected(new Set()); }}
            className={`flex items-center gap-2 px-3 py-1.5 mr-2 rounded-xl text-xs font-medium transition-all border ${
              effectiveSuspended
                ? 'bg-blue-50 border-[#355C7D]/30 text-[#355C7D]'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ShieldOff className="w-3.5 h-3.5" />
            {effectiveSuspended ? 'Masquer suspendus' : 'Voir suspendus'}
            <span className={`px-1.5 py-0.5 rounded-md font-semibold ${
              effectiveSuspended ? 'bg-[#355C7D]/10 text-[#355C7D]' : 'bg-gray-100 text-gray-500'
            }`}>
              {counts.suspendu}
            </span>
          </button>
        )}
      </div>

      {/* ── Bannière comptes fermés ── */}
      {isFermeTab && (
        <div className="flex items-start gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
          <Archive className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-600">Comptes fermés — Lecture seule</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Ces comptes ne peuvent plus recevoir ni émettre de transactions. Historique consultable uniquement.
            </p>
          </div>
        </div>
      )}

      {/* ── Bannière suspendus visibles ── */}
      {effectiveSuspended && activeTab === 'actif' && counts.suspendu > 0 && (
        <div className="flex items-start gap-3 px-5 py-3 bg-blue-50 border-b border-blue-100">
          <ShieldAlert className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#355C7D]">
              {counts.suspendu} compte{counts.suspendu > 1 ? 's' : ''} suspendu{counts.suspendu > 1 ? 's' : ''} affiché{counts.suspendu > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-blue-400 mt-0.5">
              Aucune transaction autorisée. La réactivation nécessite une validation superviseur.
            </p>
          </div>
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
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
              Exporter
            </button>
            {!isReadOnly && (
              <button className="px-3 py-1.5 text-xs font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl hover:shadow-md transition-all">
                Actions groupées
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── En-tête colonnes ── */}
      <div
        className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
        style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1.5fr 1fr 1.5fr 1fr 110px' }}
      >
        <div className="flex items-center justify-center">
          <button
            onClick={toggleAll}
            className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
              allSelected || someSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
            }`}
          >
            {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </button>
        </div>
        {COLS.map(col => (
          <button
            key={col.label}
            onClick={() => col.field && toggleSort(col.field)}
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left transition-colors ${
              col.field ? 'text-gray-600 hover:text-[#1B5E20] cursor-pointer' : 'text-gray-600 cursor-default'
            }`}
          >
            {col.label}
            {col.field && <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />}
          </button>
        ))}
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">Actions</span>
      </div>

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
          const statusCfg  = STATUS_CFG[status]  ?? STATUS_CFG['actif'];
          const typeCfg    = (acc.typeCompte ? TYPE_CFG[acc.typeCompte] : undefined) ?? { bg: 'bg-gray-100', text: 'text-gray-500', label: acc.typeCompte ?? '—' };
          const isSelected = selected.has(acc.id as string);
          const solde      = acc.soldeActuel ?? 0;

          return (
            <div
              key={acc.id}
              className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${
                isFermeTab ? 'opacity-65' : ''
              } ${
                isSelected
                  ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
              }`}
              style={{ gridTemplateColumns: '40px 2fr 1.5fr 1fr 1.5fr 1fr 110px' }}
            >
              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => toggleRow(acc.id as string)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
              </div>

              {/* Compte + Membre */}
              <div className="min-w-0">
                <p className={`text-sm font-semibold font-mono tracking-wide truncate ${isFermeTab ? 'text-gray-400' : 'text-gray-900'}`}>
                  {acc.account_number}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {acc.member_details?.full_name ?? acc.id_membre ?? '—'}
                </p>
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-0.5 min-w-0">
                {acc.member_details?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="text-xs text-gray-400 truncate">{acc.member_details.email}</span>
                  </div>
                )}
                {acc.member_details?.phone_number && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="text-xs text-gray-400">{acc.member_details.phone_number}</span>
                  </div>
                )}
                {!acc.member_details?.email && !acc.member_details?.phone_number && (
                  <span className="text-xs text-gray-400">—</span>
                )}
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
                    : <Minus        className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                }
                <span className={`text-sm font-bold ${
                  isFermeTab ? 'text-gray-400' :
                  solde > 0  ? 'text-[#2E7D32]' :
                  solde < 0  ? 'text-red-500'   : 'text-gray-400'
                }`}>
                  {formatHTG(solde)}
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

                {/* Voir — toujours disponible */}
                <button title="Voir le détail" onClick={() => onView(acc)}
                  className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-blue-50 hover:text-blue-500">
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Compte actif → Suspendre + Fermer */}
                {status === 'actif' && (
                  <>
                    <button title="Suspendre le compte" onClick={() => onSuspend(acc)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-blue-50 hover:text-[#355C7D]">
                      <ShieldOff className="w-3.5 h-3.5" />
                    </button>
                    <button title="Fermer le compte" onClick={() => onClose(acc)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {/* Compte suspendu → Réactiver seulement */}
                {status === 'suspendu' && (
                  <button title="Réactiver le compte" onClick={() => onSuspend(acc)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
                    <ShieldCheck className="w-3 h-3" /> Réactiver
                  </button>
                )}

                {/* Compte fermé → lecture seule */}
                {status === 'ferme' && (
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
          <p>
            <span className="font-semibold text-gray-600"> je prefere les boutons de compte</span> 
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> {counts.actif} Actif{counts.actif !== 1 ? 's' : ''}
            </span>
            {counts.suspendu > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-[#355C7D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#355C7D]" /> {counts.suspendu} Suspendu{counts.suspendu !== 1 ? 's' : ''}
              </span>
            )}
            {counts.ferme > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {counts.ferme} Fermé{counts.ferme !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountTable;