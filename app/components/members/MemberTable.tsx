'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Edit, Trash2, Banknote,
  Mail, Phone, Users,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Check, CheckCircle2, X, UserCheck, Clock,
  Archive,
} from 'lucide-react';
import { MemberData, getMemberInitials } from './validations';
import MemberBulkActionDropdown, { MemberBulkAction } from './MemberBulkActionDropdown';
import MemberBulkActionModal from './MemberBulkActionModal';

type TabId = 'active' | 'inactive' | 'archive';

interface MemberTableProps {
  members:             MemberData[];
  isLoading:           boolean;
  onView:              (m: MemberData) => void;
  onEdit:              (m: MemberData) => void;
  onDelete:            (m: MemberData) => void;
  onViewTransactions?: (m: MemberData) => void;
  onBulkAction:        (action: MemberBulkAction, ids: (string | number)[]) => Promise<void>;
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

function formatBalance(member: MemberData): string {
  const balance = member.accounts?.[0]?.balance;
  if (balance == null) return '—';
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '—';
  return `${num.toLocaleString('fr-FR')} HTG`;
}

function isArchivedMember(m: MemberData): boolean {
  return (m.status as any) === 'archive' || (m.status as any) === 'archived';
}

function isActiveMember(m: MemberData): boolean {
  return !isArchivedMember(m) && (m.status === true || (m.status as any) === 'true' || (m.status as any) === 'active');
}
const COLS = [
  { label: 'Membre',  field: 'last_name' },
  { label: 'Contact', field: null        },
  { label: 'Statut',  field: 'status'    },  // ← remplace Localisation
  { label: 'Solde',   field: null        },
];

const GRID = '40px 2.5fr 2fr 1.5fr 1fr 130px';

const MemberTable: React.FC<MemberTableProps> = ({
  members, isLoading, onView, onEdit, onDelete, onViewTransactions, onBulkAction,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const [sortField, setSortField] = useState('last_name');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('asc');
  const [selected,  setSelected]  = useState<Set<string | number>>(new Set());

  const counts = useMemo(() => ({
    active:   members.filter(m =>  isActiveMember(m)).length,
    inactive: members.filter(m => !isActiveMember(m) && !isArchivedMember(m)).length,
    archive:  members.filter(m =>  isArchivedMember(m)).length,
  }), [members]);

  const tabMembers = useMemo(() => members.filter(m => {
    if (activeTab === 'active')   return  isActiveMember(m);
    if (activeTab === 'inactive') return !isActiveMember(m) && !isArchivedMember(m);
    if (activeTab === 'archive')  return  isArchivedMember(m);
    return false;
  }), [members, activeTab]);

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<MemberBulkAction | null>(null);
  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(m => m.id)));
  const toggleRow    = (id: string | number) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };
  const handleTabChange = (tab: TabId) => { setActiveTab(tab); setSelected(new Set()); };

  const selectedMembers = useMemo(
    () => sorted.filter(m => selected.has(m.id)),
    [sorted, selected],
  );

  const handleBulkConfirm = async (action: MemberBulkAction) => {
    await onBulkAction(action, Array.from(selected));
    setSelected(new Set());
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Onglets ── */}
      <div className="flex items-center gap-0 px-2 border-b border-gray-100 bg-white">
        {([
          { id: 'active'   as TabId, label: 'Actifs',   icon: UserCheck, count: counts.active,
            active: 'border-[#2E7D32] text-[#1B5E20]',   badge: 'bg-[#DDEAD5] text-[#1B5E20]'   },
          { id: 'inactive' as TabId, label: 'Inactifs', icon: Clock,     count: counts.inactive,
            active: 'border-yellow-500 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
          { id: 'archive' as TabId, label: 'Archive', icon: Archive, count: counts.archive,
            active: 'border-red-400 text-red-600', badge: 'bg-red-100 text-red-600' },
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
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
              Exporter
            </button>
           <MemberBulkActionDropdown
              selectedCount={selected.size}
              isOpen={dropdownOpen}
              onToggle={() => setDropdownOpen(o => !o)}
              onAction={(action) => setActiveAction(action)}
            />
            <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all">
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
          <span className="text-xs font-semibold uppercase tracking-wide text-center text-gray-600">Actions</span>
        </div>
      )}

      {/* ── Lignes ── */}
      <div className="divide-y divide-gray-50">
        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-[#DDEAD5] flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Aucun membre trouvé</p>
            <p className="text-xs text-gray-400">Modifiez vos critères ou ajoutez un membre</p>
          </div>
        )}

        {sorted.map((member, i) => {
          const initials   = getMemberInitials(member);
          const isSelected = selected.has(member.id);
          return (
            <div key={member.id}
              className={`grid items-center px-5 py-3.5 transition-all duration-150 ${
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
                {member.photo_profil ? (
                  <img src={member.photo_profil} className="w-9 h-9 rounded-xl object-cover ring-2 ring-white shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-white">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{member.first_name} {member.last_name}</p>
                  {member.id_member && <p className="text-xs text-gray-400">#{member.id_member}</p>}
                </div>
              </div>

              {/* Contact */}
              <div className="text-xs text-gray-500 flex flex-col gap-0.5 min-w-0">
                {member.email && (
                  <div className="flex items-center gap-1 min-w-0">
                    <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone_number && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                    <span>{member.phone_number}</span>
                  </div>
                )}
              </div>

              {/* Localisation */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isActiveMember(member)
                    ? 'bg-[#DDEAD5] text-[#1B5E20]'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isActiveMember(member) ? 'bg-[#2E7D32]' : 'bg-yellow-400'
                  }`} />
                  {isActiveMember(member) ? 'Actif' : 'Inactif'}
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> {counts.active} Actif{counts.active !== 1 ? 's' : ''}
            </span>
            {counts.inactive > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> {counts.inactive} Inactif{counts.inactive !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
      <MemberBulkActionModal
        action={activeAction}
        members={selectedMembers}
        onClose={() => setActiveAction(null)}
        onConfirm={handleBulkConfirm}
      />
    </div>
  );
};

export default MemberTable;