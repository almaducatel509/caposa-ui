"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Badge,
  Tooltip
} from "@nextui-org/react";
import { FaBuilding, FaEdit, FaTrash } from "react-icons/fa";
import { TbListDetails } from "react-icons/tb";
import { BsTelephone, BsPeople } from "react-icons/bs";
import { BranchData } from './validations';
import { fetchBranches, fetchHolidays, fetchOpeningHours } from '@/app/lib/api/branche';
import { Holiday, OpeningHour } from './validations';

// Imports des composants séparés
import BranchFilterBar from './BranchFilterBar';
import BranchDetailsModal from './BranchDetailsModal';
import EditBranchModal from './EditBranchModal';
import DeleteBranchModal from './DeleteBranchModal';
import { FaBuildingWheat } from 'react-icons/fa6';

export interface Branch extends BranchData {
  id: string;
  branch_code: string;
}

interface BranchesTableProps {
  branches?: Branch[];
}

// Composant BranchCard
const BranchCard = ({
  branch, onEdit, onDelete, onViewDetails 
}: {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onViewDetails: (branch: Branch) => void;
}) => {
  const totalStaff = branch.number_of_tellers + branch.number_of_clerks + branch.number_of_credit_officers;
  
  const getBranchCategory = () => {
    if (totalStaff >= 20) return { color: "success", text: "Grande", bgColor: "bg-[#34963d]" };
    if (totalStaff >= 10) return { color: "primary", text: "Moyenne", bgColor: "bg-[#1e7367]" };
    return { color: "warning", text: "Petite", bgColor: "bg-[#f8bf2c]" };
  };

  
  return (
    <Card>
      <CardBody className="p-4">
        {/* Header - Essentiel seulement */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              icon={<FaBuilding />}
              classNames={{
                base: "bg-gradient-to-br from-[#34963d] to-[#1e7367]",
                icon: "text-white"
              }}
              size="md"
            />            
            <div>
              <h3 className="font-semibold text-lg text-[#2c2e2f]">
                {branch.branch_name}
              </h3>
              <p className="text-sm text-gray-600">{branch.branch_address}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {/* Actions */}
            <Tooltip content="Modifier">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-orange-600 hover:bg-orange-50"
                onPress={() => onEdit(branch)}
              >
                <FaEdit className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Supprimer">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => onDelete(branch)}
              >
                <FaTrash className="w-4 h-4" />
              </Button>
            </Tooltip>
                    {/* Call-to-action */}
            <Tooltip content="Detail">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-[#1e7367] hover:bg-[#1e7367]/10"
                onPress={() => onViewDetails(branch)}
              >
                <TbListDetails  className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Info résumée */}
        <div className="flex items-center justify-between">
          <Chip size="sm" className="bg-[#34963d]/10">
            {getBranchCategory().text}
          </Chip>
          <div className="flex items-center gap-2">
            <BsPeople className="text-[#34963d]" />
            <span className="font-medium">{totalStaff}</span>
            <span className="text-sm text-gray-500">employés</span>
          </div>
        </div>

        {/* Call-to-action */}
        {/* <Button 
          variant="light" 
          className="w-full mt-3 text-[#34963d]"
          onClick={() => onViewDetails(branch)}
        >
          Voir les détails →
        </Button> */}
      </CardBody>
    </Card>
  );
};

const BranchesTable: React.FC<BranchesTableProps> = ({ branches: initialBranches }) => {
  // ✅   // États de référence
  const [branches, setBranches] = useState<Branch[]>(initialBranches || []);
  const [isLoading, setIsLoading] = useState(!initialBranches);
  const [error, setError] = useState<string | null>(null);
   // 🆕 NOUVEAUX ÉTATS pour les données de référence
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);

  // États de filtrage
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(filterValue);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // États des modals
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ✅ Effect pour le debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(filterValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterValue]);

  // ✅ Chargement des données avec gestion d'erreurs
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

 // CHARGEMENT DES DONNÉES DE RÉFÉRENCE
  const loadReferenceData = async () => {
    try {
      setIsLoadingReferenceData(true);
      console.log('🔄 Chargement des données de référence...');
      
      // Charger les deux en parallèle pour optimiser
     const [holidaysData, openingHoursData] = await Promise.all([
      fetchHolidays(),
      fetchOpeningHours()
    ]);
  // 🔍 LOGS DÉTAILLÉS pour diagnostiquer
    console.log('📅 Données holidays reçues:', holidaysData);
    console.log('⏰ Données openingHours reçues:', openingHoursData);
    
      setHolidays(holidaysData);
      setOpeningHours(openingHoursData);
      
    console.log('✅ Données sauvegardées dans l\'état:', {
      holidays: holidaysData.length,
      openingHours: openingHoursData.length,
      premierOpeningHour: openingHoursData[0] // Voir la structure du premier élément
    });

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données de référence:', error);
      // Fallback vers les données mock en cas d'erreur
      setHolidays([{
        id: "070a07c0-f478-44e0-afa3-8445fcf76ba5",
        date: "2024-01-01",
        description: "Jour de l'An (données de secours)"
      }]);
      setOpeningHours([{
        id: "23fe342c-367f-4c05-8050-6ed6b89d5199",
        schedule: "Lun-Ven: 9h00-17h00\nSam: 9h00-12h00\nDim: Fermé (données de secours)"
      }]);
    } finally {
      setIsLoadingReferenceData(false);
    }
  };
   // Chargement initial des données de référence
  useEffect(() => {
    loadReferenceData();
  }, []);

// Dans BranchesTable.tsx, après le chargement des données :
useEffect(() => {
  if (openingHours.length > 0 && selectedBranch) {
    console.log('🧪 TEST DE CORRESPONDANCE:');
    console.log('Branche sélectionnée:', selectedBranch.branch_name);
    console.log('ID recherché:', selectedBranch.opening_hour);
    console.log('Tous les IDs disponibles:', openingHours.map(oh => ({ id: oh.id, schedule: oh.schedule })));
    
    const found = openingHours.find(oh => oh.id === selectedBranch.opening_hour);
    console.log('Résultat de la recherche:', found);
    
    if (!found) {
      console.log('❌ PROBLÈME: Aucun horaire trouvé!');
      console.log('Vérifiez si l\'ID de la branche correspond aux IDs des horaires');
    } else {
      console.log('✅ Horaire trouvé:', found);
    }
  }
}, [openingHours, selectedBranch]);


  // ✅ Logique de filtrage avec debouncing
  const filteredBranches = useMemo(() => {
    let filtered = branches;

    // Filtre par recherche (avec debouncedValue)
    if (debouncedValue) {
      const lowercasedFilter = debouncedValue.toLowerCase();
      filtered = filtered.filter((branch) => 
        branch.branch_name.toLowerCase().includes(lowercasedFilter) ||
        branch.branch_address.toLowerCase().includes(lowercasedFilter) ||
        branch.branch_code.toLowerCase().includes(lowercasedFilter) ||
        branch.branch_email.toLowerCase().includes(lowercasedFilter)
      );
    }

    // Filtre par catégorie
    switch (selectedFilter) {
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
      default:
        break;
    }

    return filtered.sort((a, b) => a.branch_name.localeCompare(b.branch_name));
  }, [branches, debouncedValue, selectedFilter]);

  // ✅ Gestionnaires d'événements
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
    setShowEditModal(true);
  };

  const handleEdit = (branch: Branch) => {
    console.log("📝 Editing employee:", branch); 
    setSelectedBranch(branch);
    setIsEditMode(true);
    setShowEditModal(true);
  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (branch: Branch) => {
   console.log('🎯 handleViewDetails appelé avec:', branch.branch_name);
    console.log('📊 État avant:', { showDetailsModal, selectedBranch: selectedBranch?.branch_name });
  
    setSelectedBranch(branch);
    setShowDetailsModal(true);
    console.log('📊 État après (sera appliqué au prochain render):', { 
    showDetailsModal: true, 
    selectedBranch: branch.branch_name 
  });
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

  const onFilterChange = useCallback((key: string) => {
    setSelectedFilter(key);
  }, []);

  // ✅ Loading state avec skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
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
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* ✅ Gestion d'erreurs */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
          <Button size="sm" onClick={loadBranches} className="mt-2 bg-red-600 text-white">
            Réessayer
          </Button>
        </div>
      )}

      {/* FilterBar */}
      <BranchFilterBar
        filterValue={filterValue}
        selectedFilter={selectedFilter}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onFilterChange={onFilterChange}
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
              : "Commencez par Ajouter votre première branche"
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
          onEdit={handleEdit}
          openingHours={openingHours}
          holidays={holidays}
          isLoadingData={isLoadingReferenceData && (holidays.length === 0 || openingHours.length === 0)}
        />
      )}
    </div>
  );
};

export default BranchesTable;