"use client";

import React from 'react';
import {
  Search, Upload, X,
  Plus,
} from 'lucide-react';
import { MemberData } from './validations';
import { ExportAllButton } from '@/app/ExportAllButton';
import { computeMemberFinancials } from './utils';
import { accountTypeLabel, formatMemberName } from './validations';
import { DatePeriodFilter } from '@/app/components/common/DatePeriodFilter';

interface MemberFilterBarProps {
  filterValue: string;
  selectedFilter: string;
  startDate?: string;
  endDate?: string;
  selectedStatus?: string;
  totalCount: number;
  onSearchChange: (v: string) => void;
  onClear: () => void;
  onFilterChange: (v: string) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onStatusChange?: (v: string) => void;
  onImport?: () => void;
  onAdd: () => void;
  importLoading?: boolean;
  members: MemberData[];
  // Compatibilité ascendante
  selectedType?: string;
  onTypeChange?: (v: string) => void;
}

// ─── Main Component ────────────────────────────────────────────────────────────
const MemberFilterBar: React.FC<MemberFilterBarProps> = ({
  filterValue,
  selectedFilter,
  startDate = '',
  endDate = '',
  totalCount,
  onSearchChange,
  onClear,
  onFilterChange,
  onDateRangeChange,
  onAdd,
  onImport,
  importLoading = false,
  members,
  // Props de compatibilité
  selectedType,
  onTypeChange,
}) => {
  const currentPeriod = selectedFilter ?? selectedType ?? 'all';
  const handlePeriodChange = onFilterChange ?? onTypeChange ?? (() => {});

  const isPeriodActive = currentPeriod !== 'all' || !!startDate || !!endDate;
  const isSearchActive = !!filterValue.trim();
  const activeCount = (isPeriodActive ? 1 : 0) + (isSearchActive ? 1 : 0);

  const membersForExport = members.map((m) => {
    const hasAccounts = (m.accounts?.length ?? 0) > 0;

    const { totalAssets, totalLiabilities, netBalance, activeAccountsCount } = 
      computeMemberFinancials(m.accounts);

    // Types de comptes uniques
    const accountTypes = hasAccounts
      ? Array.from(new Set(
          m.accounts!
            .filter(acc => acc.account_status !== false)
            .map(acc => accountTypeLabel(acc.account_type))
        )).join(', ') || '—'
      : '—';

    return {
      member_id: m.member_number ?? m.id_member ?? m.id,
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

  return (
    <div className="flex flex-col gap-4">
      {/* ── Ligne 1 : Recherche + Actions ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher par nom, prénom, N° membre, compte, email, téléphone..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent hover:border-[#2E7D32]/40 transition-all shadow-xs"
          />
          {filterValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={onAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={importLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-4 h-4" /> {importLoading ? 'Import…' : 'Importer'}
          </button>
          <ExportAllButton
            data={membersForExport}
            filename="membres"
            documentTitle="LISTE DES MEMBRES"
            columns={[
              'member_id',
              'first_name',
              'last_name',
              'email',
              'phone_number',
              'city',
              'department',
              'status',
            ]}
            headerLabels={{
              member_id: 'N° Membre',
              first_name: 'Prénom',
              last_name: 'Nom',
              email: 'E-mail',
              phone_number: 'Téléphone',
              city: 'Ville',
              department: 'Département',
              status: 'Statut',
            }}
          />
        </div>
      </div>

      {/* ── Ligne 2 : Filtres & Période ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs px-5 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Résultats :</span>
          <span className="bg-[#DDEAD5] text-[#1B5E20] font-bold text-sm px-3 py-0.5 rounded-lg">
            {totalCount}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* Filtre Période avec Date début & Date fin personnalisées */}
        <DatePeriodFilter
          selectedPeriod={currentPeriod}
          startDate={startDate}
          endDate={endDate}
          onPeriodChange={handlePeriodChange}
          onDateRangeChange={onDateRangeChange}
        />

        {/* Badge Filtre Actif & Réinitialiser */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
            >
              <X className="w-3 h-3" /> Effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberFilterBar;
