'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Edit, Trash2, Receipt, Phone, Mail, MapPin,
  ChevronDown, ChevronUp, ChevronsUpDown,
  Check, CheckCircle2, X, Archive,
  UserCheck, Clock, ShieldAlert
} from 'lucide-react';
import { EmployeeData } from '@/app/components/employees/validations';

// ── NOUVEAUX IMPORTS ──────────────────────────────────────────────────────────
import BulkActionDropdown, { BulkAction } from './BulkActionDropdown';
import BulkActionModal                    from './BulkActionModal';
import { BranchData, Post }               from '@/app/components/employees/validations';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TabId = 'active' | 'inactive' | 'archive';

interface EmployeeTableProps {
  employees:           EmployeeData[];
  isLoading:           boolean;
  branches:            BranchData[];   // ← NOUVEAU
  posts:               Post[];         // ← NOUVEAU
  onView:              (e: EmployeeData) => void;
  onEdit:              (e: EmployeeData) => void;
  onDelete:            (e: EmployeeData) => void;
  onViewTransactions:  (e: EmployeeData) => void;
  onBulkAction:        (action: BulkAction, ids: (string | number)[], payload?: string) => Promise<void>; // ← NOUVEAU
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:                { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]',  dot: 'bg-[#2E7D32]',  label: 'Actif'        },
  inactive:              { bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Inactif'      },
  suspended:             { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-500',    label: 'Suspendu'     },
  archive:               { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Archivé'      },
  en_conge:              { bg: 'bg-blue-50',    text: 'text-blue-600',   dot: 'bg-blue-400',   label: 'En congé'     },
  en_attente_validation: { bg: 'bg-purple-50',  text: 'text-purple-600', dot: 'bg-purple-400', label: 'En attente'   },
};

const TAB_STATUSES: Record<TabId, string[]> = {
  active:   ['active', 'en_conge', 'en_attente_validation'],
  inactive: ['inactive'],
  archive:  ['suspended', 'archive'],
};

const AVATAR_GRADIENTS = [
  'from-[#2E7D32] to-[#1B5E20]',
  'from-[#355C7D] to-[#2A4A5E]',
  'from-[#D4AF37] to-[#C9A227]',
  'from-[#5C6BC0] to-[#3949AB]',
  'from-[#00897B] to-[#00695C]',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}
function getEffectiveStatus(e: EmployeeData): string {
  return e.status ?? 'active';
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ employee, dimmed }: { employee: EmployeeData; dimmed?: boolean }) {
  const gradient = AVATAR_GRADIENTS[
    [...employee.id].reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length
  ];
  const base = `w-9 h-9 rounded-xl ring-2 ring-white ${dimmed ? 'grayscale opacity-50' : ''}`;
  return (
    <div className="relative shrink-0">
      {employee.photo_profil ? (
        <img src={employee.photo_profil} alt="" className={`${base} object-cover`} />
      ) : (
        <div className={`${base} bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">
            {getInitials(employee.first_name, employee.last_name)}
          </span>
        </div>
      )}
      {dimmed && (
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <X className="w-2 h-2 text-white" strokeWidth={3} />
        </div>
      )}
    </div>
  );
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
      style={{ gridTemplateColumns: '40px 2.5fr 1.5fr 1.5fr 1fr 1fr 130px' }}>
      <div className="flex justify-center"><div className="w-4 h-4 rounded bg-gray-100 animate-pulse" /></div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-32 bg-gray-100 animate-pulse rounded" />
          <div className="h-2.5 w-40 bg-gray-100 animate-pulse rounded" />
        </div>
      </div>
      <div className="h-5 w-20 bg-gray-100 animate-pulse rounded-lg" />
      <div className="h-3 w-28 bg-gray-100 animate-pulse rounded" />
      <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-full" />
      <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
      <div className="flex justify-center gap-1">
        {[...Array(3)].map((_, i) => <div key={i} className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />)}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const   EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees, isLoading, branches, posts,
  onView, onEdit, onDelete, onViewTransactions, onBulkAction,
}) => {
  const [activeTab,  setActiveTab]  = useState<TabId>('active');
  const [sortField,  setSortField]  = useState('last_name');
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('asc');
  const [selected,   setSelected]   = useState<Set<string | number>>(new Set());

  // ── NOUVEAU : état dropdown + modale ────────────────────────────────────────
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [activeAction,  setActiveAction]  = useState<BulkAction | null>(null);

  // Counts
  const counts = useMemo(() => ({
    active:   employees.filter(e => TAB_STATUSES.active.includes(getEffectiveStatus(e))).length,
    inactive: employees.filter(e => TAB_STATUSES.inactive.includes(getEffectiveStatus(e))).length,
    archive:  employees.filter(e => TAB_STATUSES.archive.includes(getEffectiveStatus(e))).length,
  }), [employees]);

  const tabEmployees = useMemo(
    () => employees.filter(e => TAB_STATUSES[activeTab].includes(getEffectiveStatus(e))),
    [employees, activeTab],
  );

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = useMemo(() => [...tabEmployees].sort((a, b) => {
    let va: any = sortField === 'branch' ? a.branch_details?.branch_name ?? ''
                : sortField === 'email'  ? a.user?.email ?? ''
                : (a as any)[sortField] ?? '';
    let vb: any = sortField === 'branch' ? b.branch_details?.branch_name ?? ''
                : sortField === 'email'  ? b.user?.email ?? ''
                : (b as any)[sortField] ?? '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  }), [tabEmployees, sortField, sortDir]);

  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected ? setSelected(new Set()) : setSelected(new Set(sorted.map(e => e.id)));
  const toggleRow    = (id: string | number) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };

  const handleTabChange = (tab: TabId) => { setActiveTab(tab); setSelected(new Set()); };
  const isArchiveTab    = activeTab === 'archive';

  // ── NOUVEAU : employés sélectionnés pour la modale ─────────────────────────
  const selectedEmployees = useMemo(
    () => sorted.filter(e => selected.has(e.id)),
    [sorted, selected],
  );
// dans handleBulkConfirm, avant d'appeler onConfirm
const alreadyActive = selectedEmployees.filter(e => (e.status ?? 'active') === 'active').length;
  // ── NOUVEAU : handler confirm modale ──────────────────────────────────────
  const handleBulkConfirm = async (action: BulkAction, payload?: string) => {
    await onBulkAction(action, Array.from(selected), payload);
    setSelected(new Set());
  };

  const COLS = [
    { label: 'Employé',    field: 'last_name'  },
    { label: 'Poste(s)',   field: null          },
    { label: 'Succursale', field: 'branch'      },
    { label: 'Statut',     field: 'status'      },
    { label: 'Depuis',     field: 'created_at'  },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Onglets — inchangés */}
      <div className="flex items-center gap-0 px-2 border-b border-gray-100 bg-white">
        {([
          { id: 'active'   as TabId, label: 'Actifs',   icon: UserCheck, active: 'border-[#2E7D32] text-[#1B5E20]',  badge: 'bg-[#DDEAD5] text-[#1B5E20]'   },
          { id: 'inactive' as TabId, label: 'Inactifs', icon: Clock,     active: 'border-yellow-500 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
          { id: 'archive'  as TabId, label: 'Archive',  icon: Archive,   active: 'border-red-400 text-red-600',       badge: 'bg-red-100 text-red-600'       },
        ]).map(tab => {
          const Icon = tab.icon; const isActive = activeTab === tab.id; const count = counts[tab.id];
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 ${
                isActive ? `${tab.active} font-semibold` : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
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

      {/* Bannière archive — inchangée */}
      {isArchiveTab && (
        <div className="flex items-start gap-3 px-5 py-3 bg-red-50 border-b border-red-100">
          <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700">Section réservée — RH, Direction, Contrôle interne</p>
            <p className="text-xs text-red-500 mt-0.5">
              Ces employés ne peuvent pas opérer de transactions ni ouvrir de caisse.
              Toute réactivation doit être documentée et approuvée.
            </p>
          </div>
        </div>
      )}

      {/* ── MODIFIÉ : Barre sélection multiple ── */}
      {selected.size > 0 && (
        <div className="px-5 py-3 bg-[#DDEAD5] border-b border-[#2E7D32]/15 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="text-sm font-semibold text-[#1B5E20]">
              {selected.size} employé{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
              Exporter
            </button>
            {!isArchiveTab && (
              // ── REMPLACÉ : ancien btn statique → dropdown actif ──
              <BulkActionDropdown
                selectedCount={selected.size}
                isOpen={dropdownOpen}
                onToggle={() => setDropdownOpen(o => !o)}
                onAction={(action) => setActiveAction(action)}
              />
            )}
            <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête colonnes — inchangé */}
      <div
        className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
        style={{ display: 'grid', gridTemplateColumns: '40px 2.5fr 1.5fr 1.5fr 1fr 1fr 130px' }}
      >
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

      {/* Lignes — inchangées */}
      <div className="divide-y divide-gray-50">
        {isLoading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isArchiveTab ? 'bg-red-50' : 'bg-[#DDEAD5]'}`}>
              {isArchiveTab ? <Archive className="w-7 h-7 text-red-400" /> : <UserCheck className="w-7 h-7 text-[#2E7D32]" />}
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {isArchiveTab ? 'Aucun employé archivé' : 'Aucun employé trouvé'}
            </p>
            <p className="text-xs text-gray-400">
              {isArchiveTab ? 'Les employés suspendus apparaîtront ici' : 'Modifiez vos critères ou ajoutez un employé'}
            </p>
          </div>
        )}
        {!isLoading && sorted.map((emp, i) => {
          const status     = getEffectiveStatus(emp);
          const cfg        = STATUS_CFG[status] ?? STATUS_CFG['active'];
          const isSelected = selected.has(emp.id);
          const branchName = emp.branch_details?.branch_name ?? '—';
          return (
            <div key={emp.id}
              className={`grid items-center px-5 py-3.5 transition-all duration-150 group ${isArchiveTab ? 'opacity-70' : ''} ${
                isSelected ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                : i % 2 === 0 ? 'bg-white hover:bg-[#DDEAD5]/10' : 'bg-gray-50/40 hover:bg-[#DDEAD5]/10'
              }`}
              style={{ gridTemplateColumns: '40px 2.5fr 1.5fr 1.5fr 1fr 1fr 130px' }}>
              <div className="flex items-center justify-center">
                <button onClick={() => toggleRow(emp.id)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <Avatar employee={emp} dimmed={isArchiveTab} />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate leading-tight ${isArchiveTab ? 'text-gray-400' : 'text-gray-900'}`}>
                    {emp.first_name} {emp.last_name}
                  </p>
                  {emp.user?.email && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="text-xs text-gray-400 truncate">{emp.user.email}</span>
                    </div>
                  )}
                  {emp.phone_number && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="text-xs text-gray-400">{emp.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {(emp.posts_details?.length ?? 0) > 0 ? (
                  <>
                    {emp.posts_details!.slice(0, 2).map(post => (
                      <span key={String(post.id)}
                        className={`px-2 py-0.5 text-xs rounded-lg font-medium capitalize whitespace-nowrap ${
                          isArchiveTab ? 'bg-gray-100 text-gray-400' : 'bg-[#DDEAD5] text-[#1B5E20]'
                        }`}>
                        {post.name}
                      </span>
                    ))}
                    {emp.posts_details!.length > 2 && (
                      <span className="px-2 py-0.5 text-xs rounded-lg bg-gray-100 text-gray-500 font-medium">
                        +{emp.posts_details!.length - 2}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-600 truncate">{branchName}</span>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500">
                  {emp.created_at
                    ? new Date(emp.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <button title="Voir" onClick={() => onView(emp)}
                  className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-blue-50 hover:text-blue-500">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                {!isArchiveTab ? (
                  <>
                    <button title="Modifier" onClick={() => onEdit(emp)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-[#DDEAD5] hover:text-[#2E7D32]">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button title="Transactions" onClick={() => onViewTransactions(emp)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-purple-50 hover:text-purple-500">
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                    <button title="Supprimer" onClick={() => onDelete(emp)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button title="Historique" onClick={() => onViewTransactions(emp)}
                      className="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-purple-50 hover:text-purple-500">
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                    <button title="Réactiver" onClick={() => onEdit(emp)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
                      <UserCheck className="w-3 h-3" /> Réactiver
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — inchangé */}
      {!isLoading && employees.length > 0 && (
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
            {counts.archive > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {counts.archive} Archivé{counts.archive !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── NOUVEAU : Modale actions groupées ── */}
      <BulkActionModal
        action={activeAction}
        employees={selectedEmployees}
        branches={branches}
        posts={posts}
        onClose={() => setActiveAction(null)}
        onConfirm={handleBulkConfirm}
      />

    </div>
  );
};

export default EmployeeTable;