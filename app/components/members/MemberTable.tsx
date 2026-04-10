'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Edit, Trash2, Banknote,
  Mail, Phone, MapPin, Users,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Check, CheckCircle2, X, UserCheck, Clock, Archive, ShieldAlert,
} from 'lucide-react';
import { MemberData, getMemberInitials } from './validations';
import MemberBulkActionDropdown, { MemberBulkAction } from './MemberBulkActionDropdown';
import MemberBulkActionModal from './modals/MemberBulkActionModal';
import UserAvatar from '@/app/components/core/UserAvatar';

type TabId = 'actif' | 'inactif' | 'archive';

interface MemberTableProps {
  members:             MemberData[];
  isLoading:           boolean;
  onView:              (m: MemberData) => void;
  onEdit:              (m: MemberData) => void;
  onDelete:            (m: MemberData) => void;
  onViewTransactions?: (m: MemberData) => void;
  onBulkAction:        (action: MemberBulkAction, ids: string[]) => Promise<void>;
  activeTab?:          TabId;
  onTabChange?:        (tab: TabId) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  actif:    { bg: 'bg-[#DDEAD5]',  text: 'text-[#1B5E20]',  dot: 'bg-[#2E7D32]',  label: 'Actif'    },
  inactif:  { bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Inactif'  },
  suspendu: { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-500',    label: 'Suspendu' },
};

const GRID = '40px 2.5fr 2fr 1.5fr 1fr 1fr 130px';

const COLS = [
  { label: 'Membre',     field: 'last_name'   },
  { label: 'Localisation', field: 'city'      },
  { label: 'Statut',     field: 'status'      },
  { label: 'Solde',      field: null          },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getEffectiveStatus(m: MemberData): 'actif' | 'inactif' | 'suspendu' {
  const s = ((m.status as any) ?? '').toLowerCase().trim();
  if (s === 'actif' || s === 'active' || s === 'true') return 'actif';
  if (s === 'suspendu' || s === 'suspended' || s === 'archive' || s === 'archived') return 'suspendu';
  return 'inactif';
}

function formatBalance(member: MemberData): string {
  const balance = member.accounts?.[0]?.balance;
  if (balance == null) return '—';
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '—';
  return `${num.toLocaleString('fr-FR')} HTG`;
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

function SkeletonRow() {
  return (
    <div className="grid items-center px-5 py-3.5 border-b border-gray-50"
      style={{ gridTemplateColumns: GRID }}>
      <div className="flex justify-center"><div className="w-4 h-4 rounded bg-gray-100 animate-pulse" /></div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-32 bg-gray-100 animate-pulse rounded" />
          <div className="h-2.5 w-24 bg-gray-100 animate-pulse rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 w-36 bg-gray-100 animate-pulse rounded" />
        <div className="h-2.5 w-24 bg-gray-100 animate-pulse rounded" />
      </div>
      <div className="h-3 w-28 bg-gray-100 animate-pulse rounded" />
      <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-full" />
      <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
      <div className="flex justify-center gap-1">
        {[...Array(4)].map((_, i) => <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />)}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const MemberTable: React.FC<MemberTableProps> = ({
  members, isLoading, activeTab: externalTab,
  onView, onEdit, onDelete, onViewTransactions, onBulkAction, onTabChange,
}) => {
  const [localTab,     setLocalTab]     = useState<TabId>('actif');
  const [sortField,    setSortField]    = useState('last_name');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [selected,     setSelected]     = useState<Set<string | number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<MemberBulkAction | null>(null);

  const activeTab    = externalTab ?? localTab;
  const isArchiveTab = activeTab === 'archive';

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    actif:   members.filter(m => getEffectiveStatus(m) === 'actif').length,
    inactif: members.filter(m => getEffectiveStatus(m) === 'inactif').length,
    archive: members.filter(m => getEffectiveStatus(m) === 'suspendu').length,
  }), [members]);

  // ── Tab filter ────────────────────────────────────────────────────────────
  const tabMembers = useMemo(() => members.filter(m => {
    const s = getEffectiveStatus(m);
    if (activeTab === 'actif')   return s === 'actif';
    if (activeTab === 'inactif') return s === 'inactif';
    if (activeTab === 'archive') return s === 'suspendu';
    return false;
  }), [members, activeTab]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = useMemo(() => [...tabMembers].sort((a, b) => {
    let va: any = (a as any)[sortField] ?? '';
    let vb: any = (b as any)[sortField] ?? '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  }), [tabMembers, sortField, sortDir]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(m => m.id)));
  const toggleRow    = (id: string | number) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };

  const handleTabChange = (tab: TabId) => {
    setLocalTab(tab);
    onTabChange?.(tab);
    setSelected(new Set());
  };

  const selectedMembers = useMemo(
    () => sorted.filter(m => selected.has(m.id)),
    [sorted, selected],
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Onglets ── */}
      <div className="flex items-center gap-0 px-2 border-b border-gray-100 bg-white">
        {([
          { id: 'actif'   as TabId, label: 'Actifs',   icon: UserCheck, active: 'border-[#2E7D32] text-[#1B5E20]',  badge: 'bg-[#DDEAD5] text-[#1B5E20]',  count: counts.actif   },
          { id: 'inactif' as TabId, label: 'Inactifs', icon: Clock,     active: 'border-yellow-500 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', count: counts.inactif },
          { id: 'archive' as TabId, label: 'Archive',  icon: Archive,   active: 'border-red-400 text-red-600',       badge: 'bg-red-100 text-red-600',       count: counts.archive },
        ]).map(tab => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 ${
                isCurrent ? `${tab.active} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${isCurrent ? tab.badge : 'bg-gray-100 text-gray-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Bannière archive ── */}
      {isArchiveTab && (
        <div className="flex items-start gap-3 px-5 py-3 bg-red-50 border-b border-red-100">
          <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700">Membres suspendus — accès restreint</p>
            <p className="text-xs text-red-500 mt-0.5">
              Ces membres ne peuvent pas effectuer de transactions. Toute réactivation doit être approuvée.
            </p>
          </div>
        </div>
      )}

      {/* ── Barre sélection ── */}
      {selected.size > 0 && (
        <div className="px-5 py-3 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-sm font-semibold text-[#1B5E20]">
              {selected.size} membre{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            
            {!isArchiveTab && (
              <MemberBulkActionDropdown
                selectedCount={selected.size}
                isOpen={dropdownOpen}
                onToggle={() => setDropdownOpen(o => !o)}
                onAction={(action) => setActiveAction(action)}
              />
            )}
            <button onClick={() => setSelected(new Set())}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── En-tête colonnes ── */}
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

      {/* ── Lignes ── */}
      <div className="divide-y divide-gray-50">
        {isLoading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isArchiveTab ? 'bg-red-50' : 'bg-[#DDEAD5]'}`}>
              {isArchiveTab
                ? <Archive className="w-7 h-7 text-red-400" />
                : <Users   className="w-7 h-7 text-[#2E7D32]" />}
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {isArchiveTab ? 'Aucun membre suspendu' : 'Aucun membre trouvé'}
            </p>
            <p className="text-xs text-gray-400">
              {isArchiveTab ? 'Les membres suspendus apparaîtront ici' : 'Modifiez vos critères ou ajoutez un membre'}
            </p>
          </div>
        )}

        {!isLoading && sorted.map((member, i) => {
          const status     = getEffectiveStatus(member);
          const cfg        = STATUS_CFG[status] ?? STATUS_CFG['inactif'];
          const isSelected = selected.has(member.id);

          return (
            <div key={member.id}
              className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${isArchiveTab ? 'opacity-70' : ''} ${
                isSelected
                  ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
              }`}
              style={{ gridTemplateColumns: GRID }}>

              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <button onClick={() => toggleRow(member.id)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
              </div>

              {/* Membre */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`relative shrink-0 ${isArchiveTab ? 'opacity-50 grayscale' : ''}`}>
                  <UserAvatar
                    user={{
                      first_name: member.first_name ?? '',
                      last_name:  member.last_name  ?? '',
                      photo_profil:      member.photo_profil,
                    }}
                    size="sm"
                  />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate leading-tight ${isArchiveTab ? 'text-gray-400' : 'text-gray-900'}`}>
                    {member.first_name} {member.last_name}
                  </p>
                  {member.email && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="text-xs text-gray-400 truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone_number && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="text-xs text-gray-400">{member.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Localisation */}
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-600 truncate">
                  {member.city ?? '—'}{member.department ? `, ${member.department}` : ''}
                </span>
              </div>

              {/* Statut */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Solde */}
              <div className="text-sm font-semibold text-[#1B5E20]">
                {formatBalance(member)}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                <button title="Voir" onClick={() => onView(member)}
                  className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-blue-50 hover:text-blue-500">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                {!isArchiveTab ? (
                  <>
                    <button title="Modifier" onClick={() => onEdit(member)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-[#DDEAD5] hover:text-[#2E7D32]">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {onViewTransactions && (
                      <button title="Transactions" onClick={() => onViewTransactions(member)}
                        className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-purple-50 hover:text-purple-500">
                        <Banknote className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button title="Supprimer" onClick={() => onDelete(member)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button title="Réactiver" onClick={() => onEdit(member)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
                    <UserCheck className="w-3 h-3" /> Réactiver
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {!isLoading && members.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span> résultat{sorted.length !== 1 ? 's' : ''} sur cet onglet
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#DDEAD5] text-[#1B5E20]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> {counts.actif} Actif{counts.actif !== 1 ? 's' : ''}
            </span>
            {counts.inactif > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> {counts.inactif} Inactif{counts.inactif !== 1 ? 's' : ''}
              </span>
            )}
            {counts.archive > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {counts.archive} Suspendu{counts.archive !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      <MemberBulkActionModal
        action={activeAction}
        members={selectedMembers}
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

export default MemberTable;