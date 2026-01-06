"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaBuildingWheat } from 'react-icons/fa6';
import { PiBankLight } from 'react-icons/pi';

// Imports des composants
import BranchCard from './BranchCard';
import BranchFilterBar from './BranchFilterBar';
import PageHeader from '../header';
import { fetchBranches, fetchHolidays, fetchOpeningHours } from '@/app/lib/api/branche';
import BranchDetailsModal from './BranchDetailsModal';
import DeleteBranchModal from './DeleteBranchModal';
import EditBranchModal from './EditBranchModal';
import { ScheduleForm } from '../ScheduleForm';
import type { Branch, Holiday, OpeningHour } from "@/types/branche";


interface BranchesGridProps {
  branches?: Branch[];
}

// Composant Loading Skeleton
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 border-2 border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-100 rounded mb-4"></div>
        <div className="h-16 bg-gray-50 rounded"></div>
      </div>
    ))}
  </div>
);

// Composant Error Display
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
    <p className="text-red-700 mb-3">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
    >
      Réessayer
    </button>
  </div>
);

// Composant Empty State
const EmptyState = ({ 
  hasFilter, 
  onClear, 
  onAdd 
}: { 
  hasFilter: boolean; 
  onClear: () => void; 
  onAdd: () => void; 
}) => (
  <div className="col-span-full text-center py-16">
    <div className="text-8xl mb-6 flex justify-center text-gray-300">
      <FaBuildingWheat />
    </div>
    <h3 className="text-2xl font-semibold text-[#2c2e2f] mb-3">
      {hasFilter ? "Aucune branche trouvée" : "Aucune branche"}
    </h3>
    <p className="text-[#2c2e2f]/70 mb-6 max-w-md mx-auto">
      {hasFilter 
        ? "Essayez de modifier vos critères de recherche"
        : "Commencez par ajouter votre première branche"
      }
    </p>
    {hasFilter ? (
      <button
        onClick={onClear}
        className="px-6 py-3 bg-gray-100 text-[#34963d] rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        Effacer les filtres
      </button>
    ) : (
      <button
        onClick={onAdd}
        className="px-6 py-3 bg-[#34963d] text-white rounded-lg hover:bg-[#2d7a31] transition-colors font-medium"
      >
        Ajouter une branche
      </button>
    )}
  </div>
);

const BranchesGrid: React.FC<BranchesGridProps> = ({ branches: initialBranches }) => {
  // États de référence
  const [branches, setBranches] = useState<Branch[]>(initialBranches || []);
  const [isLoading, setIsLoading] = useState(!initialBranches);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
const [showScheduleModal, setShowScheduleModal] = useState(false);
const [branchToActivate, setBranchToActivate] = useState<Branch | null>(null);


  // États de filtrage
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(filterValue);
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // États des modals
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModalMode, setEditModalMode] = useState<'create' | 'edit' | 'activate'>('create');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Effect pour le debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(filterValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterValue]);

  // Chargement des branches
  const loadBranches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 🔌 IMPORT: import { fetchBranches } from '@/app/lib/api/branche';
      const data = await fetchBranches();
      setBranches(data);
    } catch (error) {
      console.error("Erreur lors du chargement des branches:", error);
      setError("Impossible de charger les branches. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  // Chargement des données de référence
  const loadReferenceData = async () => {
    try {
      setIsLoadingReferenceData(true);
      console.log('🔄 Chargement des données de référence...');
      
      // 🔌 IMPORT: import { fetchHolidays, fetchOpeningHours } from '@/app/lib/api/branche';
      const [holidaysData, openingHoursData] = await Promise.all([
        fetchHolidays(),
        fetchOpeningHours()
      ]);

      console.log('📅 Données holidays reçues:', holidaysData);
      console.log('⏰ Données openingHours reçues:', openingHoursData);
      
      setHolidays(holidaysData);
      setOpeningHours(openingHoursData);
      
      console.log('✅ Données sauvegardées dans l\'état:', {
        holidays: holidaysData.length,
        openingHours: openingHoursData.length,
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données de référence:', error);
      setHolidays([]);
      setOpeningHours([]);
    } finally {
      setIsLoadingReferenceData(false);
    }
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  // Logique de filtrage
  const filteredBranches = useMemo(() => {
    let filtered = branches;

    if (debouncedValue) {
      const lowercasedFilter = debouncedValue.toLowerCase();
      filtered = filtered.filter((branch) => 
        branch.branch_name.toLowerCase().includes(lowercasedFilter) ||
        branch.branch_address.toLowerCase().includes(lowercasedFilter) ||
        branch.branch_code.toLowerCase().includes(lowercasedFilter) ||
        branch.branch_email.toLowerCase().includes(lowercasedFilter)
      );
    }

    switch (selectedSize) {
      case 'large':
        filtered = filtered.filter(branch => {
          const total = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;
          return total >= 20;
        });
        break;
      case 'medium':
        filtered = filtered.filter(branch => {
          const total = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;
          return total >= 10 && total < 20;
        });
        break;
      case 'small':
        filtered = filtered.filter(branch => {
          const total = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;
          return total < 10;
        });
        break;
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(branch => branch.status === selectedStatus);
    }

    return filtered.sort((a, b) => a.branch_name.localeCompare(b.branch_name));
  }, [branches, debouncedValue, selectedSize, selectedStatus]);

  // Gestionnaires d'événements
  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        'Code,Nom,Adresse,Téléphone,Email,Caissiers,Commis,Agents crédit,Date ouverture',
        ...filteredBranches.map(branch => 
          `"${branch.branch_code}","${branch.branch_name}","${branch.branch_address}","${branch.branch_phone_number}","${branch.branch_email}","${branch.number_of_tellers}","${branch.number_of_clerks}","${branch.number_of_credit_officers}","${branch.opening_date}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `branches_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [filteredBranches]);

  const handleAdd = () => {
    setSelectedBranch(null);
    setIsEditMode(false);
    setEditModalMode('create');
    setShowEditModal(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditMode(true);
    setEditModalMode('edit');
    setShowEditModal(true);
  };

    const handleActivate = (branch: Branch) => {
    console.log("🚀 Activating branch:", branch);
    setSelectedBranch(branch);
    setIsEditMode(true);
    setEditModalMode('activate');
    setShowEditModal(true);
    setShowScheduleForm(true); 

  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDetailsModal(true);
  };

  const handleSuccess = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    loadBranches();
  };

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
  }, []);

  const onSizeChange = useCallback((key: string) => {
    setSelectedSize(key);
  }, []);

  const onStatusChange = useCallback((key: string) => {
    setSelectedStatus(key);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 bg-linear-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <PageHeader 
        title="Gestion des branches" 
        subtitle="Gérez toutes les branches et leurs informations"
        icon={<PiBankLight  className="text-5xl" />}
      />


      {/* Error State */}
      {error && <ErrorDisplay error={error} onRetry={loadBranches} />}

      {/* Filter Bar */}
      {!isLoading && (
        <BranchFilterBar
          filterValue={filterValue}
          selectedSize={selectedSize}
          selectedStatus={selectedStatus}
          onSearchChange={onSearchChange}
          onClear={onClear}
          onSizeChange={onSizeChange}
          onStatusChange={onStatusChange}
          onAdd={handleAdd}
          onExport={handleExport}
          totalCount={filteredBranches.length}
        />
      )}

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Grid de cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.length > 0 ? (
            filteredBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                onActivate={handleActivate}
              />
            ))
          ) : (
            <EmptyState
              hasFilter={!!filterValue || selectedSize !== 'all' || selectedStatus !== 'all'}
              onClear={onClear}
              onAdd={handleAdd}
            />
          )}
        </div>
      )}

      {showScheduleForm && selectedBranch && (
        <ScheduleForm
          branchId={selectedBranch.id}
          branchName={selectedBranch.branch_name}
          onSuccess={async (scheduleData) => {
            console.log("✅ Horaire créé :", scheduleData);

            // 🔌 API plus tard
            // await createOpeningHours(selectedBranch.id, scheduleData);
            // await activateBranch(selectedBranch.id);

            setShowScheduleForm(false);
            setSelectedBranch(null);
            loadBranches();
          }}
          onCancel={() => {
            setShowScheduleForm(false);
            setSelectedBranch(null);
          }}
        />
      )}

      {/* CREATE / EDIT */}
      {showEditModal && editModalMode !== 'activate' && (
        <EditBranchModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSuccess}
          branch={selectedBranch}
          isEditMode={isEditMode}
          mode={editModalMode}
          holidays={holidays}
        />
      )}


      {showDeleteModal && selectedBranch && (
        <DeleteBranchModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleSuccess}
          branch={selectedBranch}
        />
      )}

      {showDetailsModal && selectedBranch && (
        <BranchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          branch={selectedBranch}
          onEdit={(branch, mode) => {
            // setSelectedBranch(branch);
            setIsEditMode(true);
            setEditModalMode(mode);
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
          openingHours={openingHours}
          holidays={holidays}
          isLoadingData={isLoadingReferenceData}
        />
      )}
    </div>
  );
};

export default BranchesGrid;