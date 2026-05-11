"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Upload, X,
  ChevronDown, CheckCircle,
  Calendar, Filter, Plus, Wallet,
} from 'lucide-react';
import { MemberData } from './validations';
import { ExportAllButton } from '@/app/ExportAllButton';

import { computeMemberFinancials } from './utils';
import { accountTypeLabel, formatMemberName } from './validations';

interface MemberFilterBarProps {
  filterValue:    string;
  selectedType:   string;
  selectedStatus: string;
  totalCount:     number;
  onSearchChange: (v: string) => void;
  onClear:        () => void;
  onTypeChange:   (v: string) => void;
  onStatusChange: (v: string) => void;
  onImport?:      () => void;
  onAdd:          () => void;
  importLoading?: boolean;
  members:MemberData[];
}

// ─── Custom Dropdown ───────────────────────────────────────────────────────────
function Dropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px]">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const MemberFilterBar: React.FC<MemberFilterBarProps> = ({
  filterValue, selectedType, selectedStatus, totalCount,
  onSearchChange, onClear, onTypeChange, onStatusChange, onAdd,
  onImport, importLoading = false, members,
}) => {

  const TYPE_OPTIONS = [
    { key: 'all',       label: 'Tous',          icon: Filter   },
    { key: 'recent',    label: 'Récents (30j)', icon: Calendar },
    { key: 'thisMonth', label: 'Ce mois',       icon: Calendar },
    { key: 'thisYear',  label: 'Cette année',   icon: Calendar },
  ];

  
  const typeLabel   = TYPE_OPTIONS.find(o => o.key === selectedType)?.label   ?? 'Période';
  // const statusLabel = STATUS_OPTIONS.find(o => o.key === selectedStatus)?.label ?? 'Statut';
  const activeCount = [selectedType !== 'all', selectedStatus !== 'all'].filter(Boolean).length;
 
const membersForExport = members.map((m) => {
  const hasAccounts = (m.accounts?.length ?? 0) > 0;

  const { totalAssets, totalLiabilities, netBalance, activeAccountsCount } = 
    computeMemberFinancials(m.accounts);

  // Types de comptes uniques (pour éviter "Épargne, Épargne, Chèques")
  const accountTypes = hasAccounts
    ? Array.from(new Set(
        m.accounts!
          .filter(acc => acc.account_status !== false)
          .map(acc => accountTypeLabel(acc.account_type))
      )).join(', ') || '—'
    : '—';

  return {
    member_id: m.member_number ?? '—',
    name: formatMemberName(m),
    first_name: m.first_name ?? '—',
    last_name: m.last_name ?? '—',
    email: m.email ?? '—',
    phone_number: m.phone_number ?? '—',
    city: m.city ?? '—',
    department: m.department ?? '—',
    status: m.status ?? '—',
    accounts_count: hasAccounts ? activeAccountsCount : '—',
    account_types: accountTypes,
    total_assets: hasAccounts ? totalAssets : '—',
    total_liabilities: hasAccounts ? totalLiabilities : '—',
    net_balance: hasAccounts ? netBalance : '—',
  };
});
  
  console.log('📊 Données pour export :', membersForExport);
  console.table(membersForExport);  // ← bonus : vue tableau dans la console
  
  return (
    <div className="flex flex-col gap-4">

      {/* ── Ligne 1 : Recherche + Actions ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">

        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher un membre par nom, email, téléphone..."
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent hover:border-[#2E7D32]/40 transition-all shadow-sm"
          />
          {filterValue && (
            <button
              onClick={() => { onSearchChange(''); onClear(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={onAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
          <button
            onClick={onImport}
            disabled={importLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {importLoading ? 'Import…' : 'Importer'}
          </button>
          <ExportAllButton
            data={membersForExport}
            filename="membres"
            columns={[
              'first_name',
              'last_name',
              'email',
              'phone_number',
              'city',
              'department',
              'status',
              // 'balance',
            ]}
            headerLabels={{
              first_name: 'Prénom',
              last_name: 'Nom',
              email: 'E-mail',
              phone_number: 'Téléphone',
              city: 'Ville',
              department: 'Département',
              status: 'Statut',
              // balance: 'Solde',
            }}
            separator=";"
          />
        </div>
      </div>

      {/* ── Ligne 2 : Filtres ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex flex-wrap items-center gap-3">

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Résultats :</span>
          <span className="bg-[#DDEAD5] text-[#1B5E20] font-bold text-sm px-3 py-0.5 rounded-lg">
            {totalCount}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Filtre période */}
        <Dropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all ${
              selectedType !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
              <Wallet className="w-3.5 h-3.5" />
              {typeLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          }
        >
          {TYPE_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => onTypeChange(opt.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                  selectedType === opt.key ? 'bg-[#DDEAD5] text-[#1B5E20] font-medium' : 'text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 text-[#2E7D32]" />
                {opt.label}
              </button>
            );
          })}
        </Dropdown>


        {/* Réinitialiser */}
        {activeCount > 0 && (
          <>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => { onTypeChange('all'); onStatusChange('all'); }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
            >
              <X className="w-3 h-3" /> Effacer
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberFilterBar;