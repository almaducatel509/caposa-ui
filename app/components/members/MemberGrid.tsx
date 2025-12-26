'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { FaUsers } from "react-icons/fa6";

// Types et API
import { fetchMembers } from '@/app/lib/api/members';
import { fetchBranches } from '@/app/lib/api/branche';

// Composants
import MemberFilterBar from '@/app/components/members/MemberFilterBar';
import MemberCard from '@/app/components/members/MemberCard';
import MemberDetailModal from '@/app/components/members/MemberDetailModal';
import EditMemberModal from '@/app/components/members/EditMemberModal';
import DeleteMemberModal from '@/app/components/members/DeleteMemberModal';
import { MemberData } from '@/app/components/members/validations';
import PageHeader from '../header';
import { PiUsersFourThin } from 'react-icons/pi';

interface MemberGridProps {
  members?: MemberData[];
  onSuccess?: () => void;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const MemberGrid: React.FC<MemberGridProps> = ({ members: initialMembers, onSuccess: parentOnSuccess }) => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États de filtrage
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(filterValue);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // États modals
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(filterValue), 300);
    return () => clearTimeout(timer);
  }, [filterValue]);

  // Charger données
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const existingMembers = await fetchMembers();
      setMembers(existingMembers);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données des membres.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialMembers && initialMembers.length) {
      setMembers(initialMembers);
      setIsLoading(false);
      setError(null);
    } else {
      loadMembers();
    }
  }, [initialMembers]);
  const header = (
    <PageHeader
      title="Gestion des Membres"
      subtitle="Gérez tous les membres et leurs informations"
      icon={<PiUsersFourThin   className="text-5xl" />}
    />
  );

  // Filtrage avancé
  const filteredMembers = useMemo(() => {
    let filtered = members;

    if (debouncedValue) {
      const v = debouncedValue.toLowerCase();
      filtered = filtered.filter(m =>
        m.first_name?.toLowerCase().includes(v) ||
        m.last_name?.toLowerCase().includes(v) ||
        m.email?.toLowerCase().includes(v) ||
        m.phone_number?.toLowerCase().includes(v) ||
        m.city?.toLowerCase().includes(v) ||
        m.department?.toLowerCase().includes(v) ||
        m.accounts?.[0]?.account_number?.toLowerCase().includes(v)
      );
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.filter(m => m.created_at && (today.getTime() - new Date(m.created_at).getTime()) / (1000 * 3600 * 24) <= 30);
        break;
      case 'thisMonth':
        filtered = filtered.filter(m => m.created_at && new Date(m.created_at).getMonth() === currentMonth && new Date(m.created_at).getFullYear() === currentYear);
        break;
      case 'thisYear':
        filtered = filtered.filter(m => m.created_at && new Date(m.created_at).getFullYear() === currentYear);
        break;
    }

    return filtered.sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
  }, [members, debouncedValue, selectedFilter, selectedBranch, selectedStatus]);

  // Gestionnaires
  const handleAdd = () => { setSelectedMember(null); setShowEditModal(true); };
  const handleView = (member: MemberData) => { setSelectedMember(member); setShowDetailModal(true); };
  const handleEdit = (member: MemberData) => { setSelectedMember(member); setShowEditModal(true); };
  const handleDelete = (member: MemberData) => { setSelectedMember(member); setShowDeleteModal(true); };
  const handleViewTransactions = (member: MemberData) => { setSelectedMember(member); setShowTransactionModal(true); };

  const handleDeleteSuccess = () => {
    loadMembers(); // Recharger la liste complète
    setSelectedMember(null);
    setShowDetailModal(false);
    setShowDeleteModal(false);
  };

  // ✅ CORRECTION 1: Handler pour EditMemberModal - accepte void, pas de paramètre
  const handleEditSuccess = () => {
    loadMembers(); // Recharger la liste complète après modification
    setShowEditModal(false);
  };

  const onSearchChange = useCallback((v?: string) => setFilterValue(v || ''), []);
  const onClear = useCallback(() => setFilterValue(''), []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 bg-linear-to-br from-green-50/30 via-white to-yellow-50/30 min-h-screen">
              {header}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-80 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardBody className="p-6 space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4"></div>
                  <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }
 /* =======================
     RENDER
  ======================= */
  return (
    <div className="flex flex-col gap-6 p-6 bg-linear-to-br min-h-screen">
      {header}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>
          <Button size="sm" onClick={loadMembers} className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium shadow-md">Réessayer</Button>
        </div>
      )}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.length > 0 ? (
          filteredMembers.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewTransactions={handleViewTransactions}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-6">
              <FaUsers className="text-5xl text-purple-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{filterValue ? "Aucun membre trouvé" : "Aucun membre"}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{filterValue ? "Essayez de modifier vos critères de recherche" : "Commencez par ajouter votre premier membre"}</p>
            <Button 
              onPress={filterValue ? onClear : handleAdd} 
              size="lg"
              className={filterValue ? "border-2 border-purple-700 bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-md" : "bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-lg"}
            >
              {filterValue ? "Effacer les filtres" : "Ajouter un membre"}
            </Button>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* ✅ CORRECTION 2: Condition pour s'assurer que selectedMember n'est pas null */}
      {selectedMember && (
        <MemberDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          member={selectedMember}
          onEdit={() => { setShowDetailModal(false); setShowEditModal(true); }}
        />
      )}
      
      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={selectedMember}
        onSuccess={handleEditSuccess}
      />
      
      {/* ✅ CORRECTION 3: Condition pour s'assurer que selectedMember n'est pas null */}
      {selectedMember && (
        <DeleteMemberModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          member={selectedMember}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default MemberGrid;