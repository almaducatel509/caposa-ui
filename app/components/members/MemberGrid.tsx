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

// ─── Main Grid ──────────────────────────────────────────────────────────────────
const MemberGrid: React.FC = () => {

  // ── Data ──
  const [members,   setMembers]   = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── Filters ──
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType,    setSelectedType]    = useState('all');
  const [selectedStatus,  setSelectedStatus]  = useState('all');
  const [selectedFilter,  setSelectedFilter]  = useState('all');

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
      const matchSearch =
        !debouncedSearch ||
        m.first_name?.toLowerCase().includes(debouncedSearch)   ||
        m.last_name?.toLowerCase().includes(debouncedSearch)    ||
        m.email?.toLowerCase().includes(debouncedSearch)        ||
        m.phone_number?.toLowerCase().includes(debouncedSearch) ||
        m.city?.toLowerCase().includes(debouncedSearch)         ||
        m.department?.toLowerCase().includes(debouncedSearch)   ||
        m.accounts?.[0]?.account_number?.toLowerCase().includes(debouncedSearch);

      const matchType = selectedType === 'all' || m.account_type === selectedType;

      // ← normalizeMemberStatus garantit que 'active' → 'actif', 'inactive' → 'inactif', etc.
      const effectiveStatus = normalizeMemberStatus(m.status);

      // ← clés alignées avec MemberFilterBar : 'actif' | 'inactif' | 'suspended'
      const matchStatus =
        selectedStatus === 'all'                                            ||
        (selectedStatus === 'actif'    && effectiveStatus === 'actif')     ||
        (selectedStatus === 'inactif'  && effectiveStatus === 'inactif')   ||
        (selectedStatus === 'suspended'&& effectiveStatus === 'suspendu');

      const now = new Date();
      const matchDate =
        selectedFilter === 'all'       ? true :
        selectedFilter === 'recent'    ? (!!m.created_at && (now.getTime() - new Date(m.created_at).getTime()) / 86400000 <= 30) :
        selectedFilter === 'thisMonth' ? (!!m.created_at && new Date(m.created_at).getMonth() === now.getMonth() && new Date(m.created_at).getFullYear() === now.getFullYear()) :
        selectedFilter === 'thisYear'  ? (!!m.created_at && new Date(m.created_at).getFullYear() === now.getFullYear()) :
        true;

      return matchSearch && matchStatus && matchDate && matchType;
    }).sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
  }, [members, debouncedSearch, selectedStatus, selectedType, selectedFilter]);

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

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportToCSV = (ids: string[]) => {
    const selected = filteredMembers.filter(m => ids.includes(m.id));
    const headers  = ['ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Ville', 'Département', 'Statut', 'Créé le'];
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
    const csv  = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `membres_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8 flex flex-col gap-6">

      <PageHeader
        title="Gestion des Membres"
        subtitle="Gérez tous les membres et leurs informations"
        icon={<Users className="w-6 h-6 text-[#2E7D32]" />}
        className="mb-0"
      />

      <MemberFilterBar
        filterValue={search}
        selectedStatus={selectedStatus}
        onSearchChange={setSearch}
        onClear={() => setSearch('')}
        onStatusChange={handleStatusChange}
        onAdd={handleAdd}
        onImport={() => console.log('Import')}
        totalCount={filteredMembers.length}
        onTypeChange={setSelectedType}
        selectedType={selectedType}
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