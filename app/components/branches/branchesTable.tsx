"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { BranchData } from './validations';
import { fetchBranches, fetchHolidays, fetchOpeningHours } from '@/app/lib/api/branche';
import { Holiday, OpeningHour } from './validations';

// ✅ IMPORTS DES COMPOSANTS - Vérifiez que les noms correspondent aux exports
import BranchFilterBar from './BranchFilterBar';
import BranchDetailsModal from './BranchDetailsModal';  // ← Modal de détails
import EditBranchModal from './EditBranchModal';        // ← Modal d'édition
import DeleteBranchModal from './DeleteBranchModal';    // ← Modal de suppression
import BranchCard from './BranchCard';                  // ← Carte de branche (VERSION MODERNE)
import { FaBuildingWheat } from 'react-icons/fa6';
import { PiBankLight, PiUsersFourThin } from 'react-icons/pi';
import PageHeader from '../header';

export interface Branch extends BranchData {
  id: string;
  branch_code: string;
}

interface BranchesTableProps {
  branches?: Branch[];
}

const BranchesTable: React.FC<BranchesTableProps> = ({ branches: initialBranches }) => {
  // États de référence
  const [branches, setBranches] = useState<Branch[]>(initialBranches || []);
  const [isLoading, setIsLoading] = useState(!initialBranches);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);

  // États de filtrage
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(filterValue);
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // États des modals
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModalMode, setEditModalMode] = useState<'create' | 'edit' | 'activate'>('create'); // 👈 AJOUT
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
  }, [initialBranches]);

  // Chargement des données de référence
  const loadReferenceData = async () => {
    try {
      setIsLoadingReferenceData(true);
      console.log('🔄 Chargement des données de référence...');
      
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

    return filtered.sort((a, b) => a.branch_name.localeCompare(b.branch_name));
  }, [branches, debouncedValue, selectedSize]);

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
    console.log("🆕 Creating new branch"); 
    setSelectedBranch(null);
    setIsEditMode(false);
    setEditModalMode('create'); // 👈 AJOUT
    setShowEditModal(true);
  };

  const handleEdit = (branch: Branch) => {
    console.log("📝 Editing branch:", branch); 
    setSelectedBranch(branch);
    setIsEditMode(true);
    setEditModalMode('edit'); // 👈 AJOUT
    setShowEditModal(true);
  };

  // 👇 NOUVEAU : Handler pour l'activation
  const handleActivate = (branch: Branch) => {
    console.log("🚀 Activating branch:", branch);
    setSelectedBranch(branch);
    setIsEditMode(true);
    setEditModalMode('activate'); // 👈 Mode activation
    setShowEditModal(true);
  };

  // 👇 MODIFIÉ : Handler unifié depuis BranchDetailsModal
  const handleEditFromDetails = (branch: Branch, mode: 'edit' | 'activate') => {
    console.log(`📝 ${mode === 'activate' ? 'Activating' : 'Editing'} branch:`, branch);
    setSelectedBranch(branch);
    setIsEditMode(true);
    setEditModalMode(mode);
    setShowDetailsModal(false); // Fermer le modal de détails
    setShowEditModal(true);
  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (branch: Branch) => {
    console.log('🎯 handleViewDetails appelé avec:', branch.branch_name);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-linear-to-br from-green-50 to-emerald-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-linear-to-br from-green-50 to-emerald-50 min-h-screen">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
          <Button size="sm" onClick={loadBranches} className="mt-2 bg-red-600 text-white">
            Réessayer
          </Button>
        </div>
      )}

      <PageHeader 
        title="Gestion des branches" 
        subtitle="Gérez toutes les branches et leurs informations"
        icon={<PiBankLight  className="text-5xl" />}
      />

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

      <div className="text-sm text-[#2c2e2f]/70">
        {filteredBranches.length} résultat(s) trouvé(s)
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.length > 0 ? (
          filteredBranches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              onActivate={handleActivate} // 👈 AJOUT
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-8xl mb-4">
              <FaBuildingWheat />
            </div>
            <h3 className="text-xl font-semibold text-[#2c2e2f] mb-2">
              {filterValue ? "Aucune branche trouvée" : "Aucune branche"}
            </h3>
            <p className="text-[#2c2e2f]/70 mb-4">
              {filterValue 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre première branche"
              }
            </p>
            {filterValue ? (
              <Button onClick={onClear} variant="light" className="text-[#34963d]">
                Effacer les filtres
              </Button>
            ) : (
              <Button onClick={handleAdd} className="bg-[#34963d] text-white">
                Ajouter une branche
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditBranchModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSuccess}
          branch={selectedBranch}
          isEditMode={isEditMode}
          mode={editModalMode} // 👈 AJOUT
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

      {/* ✅ MODAL DE DÉTAILS AVEC BONS PROPS */}
      {showDetailsModal && selectedBranch && (
        <BranchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          branch={selectedBranch}
          onEdit={handleEditFromDetails} // 👈 Handler unifié
          openingHours={openingHours}
          holidays={holidays}
          isLoadingData={isLoadingReferenceData && (holidays.length === 0 || openingHours.length === 0)}
        />
      )}
    </div>
  );
};

export default BranchesTable;