'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users } from 'lucide-react';
// API
import { fetchMembers, updateMember } from '@/app/lib/api/members';
// UI
import PageHeader      from '../header';
import MemberFilterBar from '@/app/components/members/MemberFilterBar';
// Modals
import MemberDetailModal from '@/app/components/members/modals/MemberDetailModal';
import EditMemberModal   from '@/app/components/members/modals/EditMemberModal';
import DeleteMemberModal from '@/app/components/members/modals/DeleteMemberModal';
// Types
import { MemberData, normalizeMemberStatus } from '@/app/components/members/validations';
import MemberTable from './MemberTable';
import { MemberBulkAction } from './MemberBulkActionDropdown';
import MemberTransactionModal from './modals/MemberTransactionModal';
import { exportToXLSXFile } from '@/app/utils/excelExport';
import { matchesDateFilter } from '@/app/components/common/DatePeriodFilter';

// ─── Main Grid ──────────────────────────────────────────────────────────────────
const MemberGrid: React.FC = () => {

  // ── Data ──
  const [members,   setMembers]   = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── Filters ──
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedFilter,  setSelectedFilter]  = useState('all');
  const [selectedStatus,  setSelectedStatus]  = useState('all');
  const [startDate,       setStartDate]       = useState('');
  const [endDate,         setEndDate]         = useState('');

  // ── Tab ──
  const [activeMemberTab, setActiveMemberTab] = useState<'actif' | 'inactif' | 'archive'>('actif');

  // ── Modals ──
  const [selectedMember,       setSelectedMember]       = useState<MemberData | null>(null);
  const [showDetailModal,      setShowDetailModal]      = useState(false);
  const [showEditModal,        setShowEditModal]        = useState(false);
  const [showDeleteModal,      setShowDeleteModal]      = useState(false);
  const [selectedAccount,      setSelectedAccount]      = useState<MemberData | null>(null);
  const [showHistory,          setShowHistory]          = useState(false);
  const [showClose,            setShowClose]            = useState(false);
const [showTransactionModal, setShowTransactionModal] = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMembers();
      setMembers(data);
    } catch (err) {
      console.error('Erreur chargement membres:', err);
      setError('Impossible de charger les données des membres.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // 1. Recherche exhaustive
      let matchSearch = true;
      if (debouncedSearch) {
        const q = debouncedSearch;
        const cleanQ = q.replace(/\D/g, '');

        const firstName = m.first_name?.toLowerCase() ?? '';
        const lastName = m.last_name?.toLowerCase() ?? '';
        const fullName1 = `${firstName} ${lastName}`.trim();
        const fullName2 = `${lastName} ${firstName}`.trim();
        const email = m.email?.toLowerCase() ?? '';
        const phone = (m.phone_number ?? '').toLowerCase();
        const cleanPhone = phone.replace(/\D/g, '');
        const city = m.city?.toLowerCase() ?? '';
        const department = m.department?.toLowerCase() ?? '';
        const memberNum = (m.member_number ?? m.id_member ?? m.id ?? '').toLowerCase();
        const idNum = (m.id_number ?? '').toLowerCase();

        const matchAccounts = (m.accounts ?? []).some(acc =>
          acc.account_number?.toLowerCase().includes(q)
        );

        matchSearch =
          fullName1.includes(q) ||
          fullName2.includes(q) ||
          firstName.includes(q) ||
          lastName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          (cleanQ.length >= 3 && cleanPhone.includes(cleanQ)) ||
          city.includes(q) ||
          department.includes(q) ||
          memberNum.includes(q) ||
          idNum.includes(q) ||
          matchAccounts;
      }

      // 2. Filtre par date / période (avec support date début seule ou début + fin)
      const matchDate = matchesDateFilter(m.created_at, selectedFilter, startDate, endDate);

      return matchSearch && matchDate;
    }).sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
  }, [members, debouncedSearch, selectedFilter, startDate, endDate]);

  const handleClear = () => {
    setSearch('');
    setSelectedFilter('all');
    setStartDate('');
    setEndDate('');
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd              = () => { setSelectedMember(null); setShowEditModal(true); };
  const handleView             = (m: MemberData) => { setSelectedMember(m); setShowDetailModal(true); };
  const handleEdit             = (m: MemberData) => { setSelectedMember(m); setShowEditModal(true); };
  const handleDelete           = (m: MemberData) => { setSelectedMember(m); setShowDeleteModal(true); };
  const handleViewTransactions = (m: MemberData) => { 
    setSelectedMember(m); 
    setShowTransactionModal(true); 
  };
  // ← dropdown envoie 'actif' | 'inactif' | 'suspended' — tout aligné
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if      (status === 'inactif')   setActiveMemberTab('inactif');
    else if (status === 'suspended') setActiveMemberTab('archive');
    else                             setActiveMemberTab('actif');
  };

  // ── Bulk action ────────────────────────────────────────────────────────────
  const handleBulkAction = async (action: MemberBulkAction, ids: string[]) => {
    switch (action) {
      case 'activate':
      case 'deactivate':
      case 'archive':
        await Promise.all(ids.map(id => updateMember(String(id), new FormData())));
        break;
      case 'export':
        exportToCSV(ids);
        return;
    }
    await loadMembers();
  };

  // ── Export Excel / XLSX ───────────────────────────────────────────────────
  const exportToCSV = (ids: string[]) => {
    const selected = filteredMembers.filter(m => ids.includes(m.id));
    const headers  = ['ID Membre', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Ville', 'Département', 'Statut', 'Créé le'];
    const rows     = selected.map(m => [
      m.id_member ?? m.id,
      m.first_name ?? '',
      m.last_name ?? '',
      m.email ?? '',
      m.phone_number ?? '',
      m.city ?? '',
      m.department ?? '',
      m.status ?? '',
      m.created_at ?? '',
    ]);

    exportToXLSXFile({
      filename: 'membres',
      documentTitle: 'LISTE DES MEMBRES',
      headers,
      rows,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const displayedCount = useMemo(() => {
    return filteredMembers.filter(m => {
      const s = normalizeMemberStatus(m.status);
      if (activeMemberTab === 'actif') return s === 'actif';
      if (activeMemberTab === 'inactif') return s === 'inactif';
      if (activeMemberTab === 'archive') return s === 'suspendu';
      return true;
    }).length;
  }, [filteredMembers, activeMemberTab]);

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-4 sm:p-6 md:p-8 flex flex-col gap-6">

      <PageHeader
        title="Gestion des Membres"
        subtitle="Gérez tous les membres et leurs informations"
        icon={<Users className="w-6 h-6 text-[#2E7D32]" />}
        className="mb-0"
      />

      <MemberFilterBar
        members={members}
        filterValue={search}
        selectedFilter={selectedFilter}
        startDate={startDate}
        endDate={endDate}
        onSearchChange={setSearch}
        onFilterChange={setSelectedFilter}
        onDateRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
        onClear={handleClear}
        onAdd={handleAdd}
        onImport={() => {}}
        totalCount={displayedCount}
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
          <button onClick={loadMembers}
            className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
            Réessayer
          </button>
        </div>
      )}

      <MemberTable
        members={filteredMembers}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewTransactions={handleViewTransactions}
        onBulkAction={handleBulkAction}
        activeTab={activeMemberTab}
        // ← onglet → dropdown : clés alignées avec MemberFilterBar
        onTabChange={(tab) => {
          setActiveMemberTab(tab);
          setSelectedStatus(
            tab === 'inactif' ? 'inactif'   :
            tab === 'archive' ? 'suspended' : 'actif'
          );
        }}
      />

      <MemberDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        member={selectedMember}
        onEdit={() => { setShowDetailModal(false); setShowEditModal(true); }}
      />
      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={selectedMember}
        onSuccess={loadMembers}
      />
      <MemberTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        member={selectedMember}
      />
      <DeleteMemberModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        member={selectedMember}
        onSuccess={loadMembers}
      />
    </div>
  );
};

export default MemberGrid;