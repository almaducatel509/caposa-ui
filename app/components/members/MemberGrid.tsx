'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users } from 'lucide-react';
// API
import { fetchMembers }  from '@/app/lib/api/members';
// UI
import PageHeader        from '../header';
import MemberFilterBar   from '@/app/components/members/MemberFilterBar';
// Modals
import MemberDetailModal from '@/app/components/members/MemberDetailModal';
import EditMemberModal   from '@/app/components/members/EditMemberModal';
import DeleteMemberModal from '@/app/components/members/DeleteMemberModal';
// Types
import { MemberData } from '@/app/components/members/validations';
import MemberTable from './MemberTable';
// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="bg-linear-to-br from-[#F9F9F6] to-[#DDEAD5]/20 pt-6 pb-10 flex justify-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="px-5 pb-5 -mt-6 flex flex-col gap-3">
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-3 w-16 bg-gray-100 animate-pulse rounded-lg" />
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="h-3 w-full  bg-gray-100 animate-pulse rounded-lg" />
          <div className="h-3 w-3/4  bg-gray-100 animate-pulse rounded-lg" />
          <div className="h-3 w-2/3  bg-gray-100 animate-pulse rounded-lg" />
          <div className="h-3 w-1/2  bg-gray-100 animate-pulse rounded-lg" />
        </div>
        <div className="flex justify-center gap-2 pt-3 border-t border-gray-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ hasFilter, onClear, onAdd }: {
  hasFilter: boolean; onClear: () => void; onAdd: () => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-[#DDEAD5] rounded-full flex items-center justify-center mb-5">
        <Users className="w-10 h-10 text-[#2E7D32]" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {hasFilter ? 'Aucun membre trouvé' : 'Aucun membre'}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        {hasFilter
          ? 'Essayez de modifier vos critères de recherche'
          : 'Commencez par ajouter votre premier membre'
        }
      </p>
      <button
        onClick={hasFilter ? onClear : onAdd}
        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
          hasFilter
            ? 'bg-white border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#DDEAD5]'
            : 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {hasFilter ? 'Effacer les filtres' : 'Ajouter un membre'}
      </button>
    </div>
  );
}

// ─── Main Grid ──────────────────────────────────────────────────────────────────
const MemberGrid: React.FC = () => {

  // ── Data ──
  const [members,   setMembers]   = useState<MemberData[]>([]);

  // ── UI ──
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // ── Filters ──
  const [filterValue,    setFilterValue]    = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // ── Modals ──
  const [selectedMember,       setSelectedMember]       = useState<MemberData | null>(null);
  const [showDetailModal,      setShowDetailModal]      = useState(false);
  const [showEditModal,        setShowEditModal]        = useState(false);
  const [showDeleteModal,      setShowDeleteModal]      = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les données des membres.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  // ── Debounce ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(filterValue), 300);
    return () => clearTimeout(t);
  }, [filterValue]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filteredMembers = useMemo(() => {
    let list = [...members];

    if (debouncedValue) {
      const v = debouncedValue.toLowerCase();
      list = list.filter(m =>
        m.first_name?.toLowerCase().includes(v)              ||
        m.last_name?.toLowerCase().includes(v)               ||
        m.email?.toLowerCase().includes(v)                   ||
        m.phone_number?.toLowerCase().includes(v)            ||
        m.city?.toLowerCase().includes(v)                    ||
        m.department?.toLowerCase().includes(v)              ||
        m.accounts?.[0]?.account_number?.toLowerCase().includes(v)
      );
    }

    if (selectedStatus !== 'all') {
      // MemberData n'a pas de champ status explicite — à adapter selon ton API
      // list = list.filter(m => m.status === selectedStatus);
    }

    const now = new Date();
    if (selectedFilter === 'recent') {
      list = list.filter(m => m.created_at &&
        (now.getTime() - new Date(m.created_at).getTime()) / 86400000 <= 30);
    }
    if (selectedFilter === 'thisMonth') {
      list = list.filter(m => {
        if (!m.created_at) return false;
        const d = new Date(m.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (selectedFilter === 'thisYear') {
      list = list.filter(m => m.created_at &&
        new Date(m.created_at).getFullYear() === now.getFullYear());
    }

    return list.sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
  }, [members, debouncedValue, selectedFilter, selectedStatus]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd              = () => { setSelectedMember(null); setShowEditModal(true); };
  const handleView             = (m: MemberData) => { setSelectedMember(m); setShowDetailModal(true); };
  const handleEdit             = (m: MemberData) => { setSelectedMember(m); setShowEditModal(true); };
  const handleDelete           = (m: MemberData) => { setSelectedMember(m); setShowDeleteModal(true); };
  const handleViewTransactions = (m: MemberData) => { setSelectedMember(m); setShowTransactionModal(true); };
  const onSearchChange         = useCallback((v?: string) => setFilterValue(v ?? ''), []);
  const onClear                = useCallback(() => setFilterValue(''), []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20">

      <PageHeader
        title="Gestion des Membres"
        subtitle="Gérez tous les membres et leurs informations"
        icon={<Users className="w-8 h-8 text-[#2E7D32]" />}
      />

      <MemberFilterBar
        filterValue={filterValue}
        selectedFilter={selectedFilter}
        selectedStatus={selectedStatus}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onFilterChange={setSelectedFilter}
        onStatusChange={setSelectedStatus}
        onAdd={handleAdd}
        onImport={() => console.log('Import')}
        onExport={() => console.log('Export')}
        totalCount={filteredMembers.length}
      />

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
          <button
            onClick={loadMembers}
            className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Table */}
      <div>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-500">
            Chargement des membres...
          </div>
        ) : filteredMembers.length > 0 ? (
          <MemberTable
            members={filteredMembers}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewTransactions={handleViewTransactions}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState
              hasFilter={!!filterValue}
              onClear={onClear}
              onAdd={handleAdd}
            />
          </div>
        )}
      </div>

      {/* Modals */}
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