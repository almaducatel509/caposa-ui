'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Edit, Trash2, Receipt, Phone, Mail, MapPin,
  ChevronDown, ChevronUp, ChevronsUpDown,
  Check, CheckCircle2, X, Archive,
  UserCheck, Clock, ShieldAlert,
} from 'lucide-react';
import { EmployeeData } from '@/app/components/employees/validations';

import UserAvatar                                               from '@/app/components/core/UserAvatar';
import BulkActionDropdown, {  EmployeeBulkAction }     from './BulkActionDropdown';
import { BranchData, Post }                                     from '@/app/components/employees/validations';
import BulkActionModal                                          from './modals/BulkActionModal';
import { PostData } from './validations';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TabId = 'actif' | 'inactif' | 'archive';
type EmployeeStatus = 'actif' | 'inactif' | 'archive';

interface EmployeeTableProps {
  employees: EmployeeData[];
  isLoading: boolean;
  branches: BranchData[];
  posts: PostData[];
  onView: (e: EmployeeData) => void;
  onDelete: (e: EmployeeData) => void;
  onViewTransactions: (e: EmployeeData) => void;
  onBulkAction: (action: EmployeeBulkAction, ids: string[]) => Promise<void>;
  activeTab: string;
  onTabChange?: (tab: 'actif' | 'inactif' | 'archive') => void;
  onEdit:(e: EmployeeData) => void;
  
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  actif:                { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]',  dot: 'bg-[#2E7D32]',  label: 'Actif'      },
  inactif:              { bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Inactif'    },
  suspended:             { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-500',    label: 'Suspendu'   },
  archive:               { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Archive'    },
  en_conge:              { bg: 'bg-blue-50',    text: 'text-blue-600',   dot: 'bg-blue-400',   label: 'En conge'   },
  en_attente_validation: { bg: 'bg-purple-50',  text: 'text-purple-600', dot: 'bg-purple-400', label: 'En attente' },
};

const TYPE_CFG: Record<string, { bg: string; text: string; label: string }> = {
  epargne: { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', label: 'Épargne' },
  cheques: { bg: 'bg-blue-50',   text: 'text-[#355C7D]', label: 'Chèques' },
  terme:   { bg: 'bg-yellow-50', text: 'text-[#854F0B]', label: 'Terme'   },
};

const GRID = '40px 2fr 1.5fr 1fr 1.5fr 1fr 130px';

const COLS = [
  { label: 'Employe',    field: 'last_name'  },
  { label: 'Poste(s)',   field: null          },
  { label: 'Succursale', field: 'branch'      },
  { label: 'Statut',     field: 'status'      },
  { label: 'Depuis',     field: 'created_at'  },
];
// ─── Helpers ───────────────────────────────────────────────────────────────────
function getEffectiveStatus(e: EmployeeData): EmployeeStatus {
  // On unifie les différentes sources possibles
  const s = (e as any).statusEmployee ?? e.statutEmploye;

  // Normalisation en minuscule pour éviter les variations
  const normalized = typeof s === 'string' ? s.toLowerCase() : s;

  // Fermé / Inactif
  if (
    normalized === 'inactif' ||
    normalized === 'inactif' ||
    normalized === 'désactivé' ||
    normalized === 'desactive' ||
    normalized === 'disabled' ||
    normalized === false // fallback legacy boolean
  ) {
    return 'inactif';
  }

  // Suspendu
  if (
    normalized === 'suspendu' ||
    normalized === 'suspended'
  ) {
    return 'archive';
  }
  // Sinon, par défaut : actif
  return 'actif';
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
const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees, isLoading, branches, posts,
  onView, onEdit, onDelete, onViewTransactions, onBulkAction, activeTab: externalTab, onTabChange,
}) => {
  const [localTab, setLocalTab] = useState<TabId>('actif');
  const [sortField,    setSortField]    = useState('username');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [selected,     setSelected]     = useState<Set<string | number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeTab = externalTab ?? localTab;

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    actif: employees.filter(e => getEffectiveStatus(e) === 'actif').length,
    inactif: employees.filter(e => getEffectiveStatus(e) === 'inactif').length,
    archive:  employees.filter(e => getEffectiveStatus(e) === 'archive').length,
  }), [employees]);

  // ── Tab filter ────────────────────────────────────────────────────────────
  const tabEmployees = useMemo(
    () => employees.filter(e => getEffectiveStatus(e) === activeTab),
    [employees, activeTab],
  );

  // ── Sort ──────────────────────────────────────────────────────────────────
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

  const [activeAction, setActiveAction] = useState<EmployeeBulkAction | null>(null);
  
  const selectedEmployees = useMemo(
    () => sorted.filter(e => selected.has(e.id as string)),
    [sorted, selected],
  );
    // ── Selection ─────────────────────────────────────────────────────────────

  const allSelected  = selected.size === sorted.length && sorted.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll    = () => allSelected 
    ? setSelected(new Set()) 
    : setSelected(new Set(sorted.map(e => e.id)));
  const toggleRow    = (id: string | number) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };


  const handleTabChange = (tab: TabId) => {
    setLocalTab(tab);
    onTabChange?.(tab);
    setSelected(new Set());
  };
  
  const isFermeTab = activeTab === 'fermé';
  const isArchiveTab    = activeTab === 'archive';

  // ── Dropdown : export direct, reste → modale ───────────────────────────────
  // const handleDropdownAction = (action: BulkAction) => {
  //   if (action === 'export') { handleExportCSV(); return; }
  //   setActiveAction(action as ModalBulkAction);
  // };

  // ── Confirm modale ─────────────────────────────────────────────────────────
  // const handleBulkConfirm = async (action: ModalBulkAction, payload?: string) => {
  //   await onBulkAction(action, Array.from(selected), payload);
  //   setSelected(new Set());
  // };


  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Onglets ── */}
      <div className="flex items-center gap-0 px-2 border-b border-gray-100 bg-white">
        {([
          { id: 'actif'   as TabId, label: 'Actifs',   icon: UserCheck, active: 'border-[#2E7D32] text-[#1B5E20]',  badge: 'bg-[#DDEAD5] text-[#1B5E20]', count: counts.actif},
          { id: 'inactif' as TabId, label: 'Inactifs', icon: Clock,     active: 'border-yellow-500 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700',count: counts.inactif},
          { id: 'archive'  as TabId, label: 'Archive',  icon: Archive,   active: 'border-red-400 text-red-600',       badge: 'bg-red-100 text-red-600',count: counts.archive},
        ]).map(tab => {
          const Icon = tab.icon; 
          // const isActive = activeTab === tab.id; 
          const isCurrent = activeTab === tab.id;;
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
            <p className="text-xs font-semibold text-red-700">Section reservee — RH, Direction, Controle interne</p>
            <p className="text-xs text-red-500 mt-0.5">
              Ces employes ne peuvent pas operer de transactions ni ouvrir de caisse.
              Toute reactivation doit etre documentee et approuvee.
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
              {selected.size} employe{selected.size > 1 ? 's' : ''} selectionne{selected.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
           
            {!isArchiveTab && (
              <BulkActionDropdown
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

      {/* ── Lignes ── */}
      <div className="divide-y divide-gray-50">
        {isLoading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isArchiveTab ? 'bg-red-50' : 'bg-[#DDEAD5]'}`}>
              {isArchiveTab
                ? <Archive   className="w-7 h-7 text-red-400" />
                : <UserCheck className="w-7 h-7 text-[#2E7D32]" />}
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {isArchiveTab ? 'Aucun employe archive' : 'Aucun employe trouve'}
            </p>
            <p className="text-xs text-gray-400">
              {isArchiveTab ? 'Les employes suspendus apparaitront ici' : 'Modifiez vos criteres ou ajoutez un employe'}
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

              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <button onClick={() => toggleRow(emp.id)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#2E7D32] border-[#2E7D32]' : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>
              </div>

              {/* ── Employé — UserAvatar ── */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`relative shrink-0 ${isArchiveTab ? 'opacity-50 grayscale' : ''}`}>
                  <UserAvatar
                    user={{
                      first_name:   emp.first_name ?? '',
                      last_name:    emp.last_name  ?? '',
                      photo_profil: emp.photo_profil,
                    }}
                    size="sm"
                    type="employee"
                  />
                 
                </div>
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

              {/* Poste(s) */}
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

              {/* Succursale */}
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-600 truncate">{branchName}</span>
              </div>

              {/* Statut */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Depuis */}
              <div>
                <span className="text-xs text-gray-500">
                  {emp.created_at
                    ? new Date(emp.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>

              {/* Actions */}
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
                    <button title="Reactiver" onClick={() => onEdit(emp)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
                      <UserCheck className="w-3 h-3" /> Reactiver
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      {!isLoading && employees.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{sorted.length}</span> resultat{sorted.length !== 1 ? 's' : ''} sur cet onglet
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
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {counts.archive} Archive{counts.archive !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Modale actions groupées ── */}
      <BulkActionModal
        action={activeAction}
        employees={selectedEmployees}
        branches={branches}
        posts={posts}
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

export default EmployeeTable;