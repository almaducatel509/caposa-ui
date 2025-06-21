"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Tooltip,
  Divider
} from "@nextui-org/react";
import { FaCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
import { BsCalendar2Event } from "react-icons/bs";
import { FaCalendarDays } from 'react-icons/fa6';

// Types et API - Use only HolidayData
import { HolidayData } from './validations';
import { fetchHolidays } from '@/app/lib/api/holiday';

// Composants séparés
import HolidayFilterBar from './HolidayFilterBar';
import RegisterForm from '@/app/components/holidays/register_form';

// Types et API
import { Holiday, convertToHoliday } from "@/app/dashboard/holidays/columns";

interface HolidayTableProps {
  holidays?: HolidayData[]; // props externe optionnelle
  onSuccess?: () => void;   // Add this prop
}

// 🎯 COMPOSANT HolidayCard - Style moderne harmonisé
const HolidayCard = ({
  holiday, onEdit, onDelete 
}: {
  holiday: HolidayData;
  onEdit: (holiday: HolidayData) => void;
  onDelete: (holiday: HolidayData) => void;
}) => {
  
  const getHolidayCategory = () => {
    const today = new Date();
    const holidayDate = new Date(holiday.date);
    
    // Normaliser les dates pour comparer seulement jour/mois/année
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const holidayNormalized = new Date(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate());
    
    if (holidayNormalized > todayNormalized) {
      return { color: "primary", text: "À venir", bgColor: "bg-[#1e7367]", icon: "🔮" };
    } else if (holidayNormalized.getTime() === todayNormalized.getTime()) {
      return { color: "warning", text: "Aujourd'hui", bgColor: "bg-[#f8bf2c]", icon: "🎉" };
    } else {
      return { color: "default", text: "Passé", bgColor: "bg-gray-500", icon: "📅" };
    }
  };

  const category = getHolidayCategory();
  
  // Formatage de la date
  const formattedDate = new Date(holiday.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Formatage des timestamps
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardBody className="p-5">
        
        {/* 🎨 Header avec actions - Style cohérent avec BranchCard */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar
              icon={<FaCalendarAlt />}
              classNames={{
                base: "bg-gradient-to-br from-[#34963d] to-[#1e7367] flex-shrink-0",
                icon: "text-white"
              }}
              size="md"
            />            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-[#2c2e2f] capitalize leading-tight">
                {formattedDate}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                ID: {holiday.id?.substring(0, 8)}...
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 flex-shrink-0">
            {/* Actions - Même style que BranchCard */}
            <Tooltip content="Modifier">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-[#1e7367] hover:bg-[#1e7367]/10"
                onPress={() => onEdit(holiday)}
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
                onPress={() => onDelete(holiday)}
              >
                <FaTrash className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* 📝 Description */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Description
          </div>
          <p className="text-sm text-gray-700 leading-relaxed break-words line-clamp-3">
            {holiday.description || 'Aucune description'}
          </p>
        </div>

        {/* 🏷️ Statut et catégorie */}
        <div className="flex items-center justify-between mt-4">
          <Chip 
            size="sm" 
            className="bg-[#34963d]/10"
            startContent={<span>{category.icon}</span>}
          >
            {category.text}
          </Chip>
          <div className="flex items-center gap-2">
            <BsCalendar2Event className="text-[#34963d]" />
            <span className="text-sm text-gray-500">
              {new Date(holiday.date).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        <Divider className="my-4" />

        {/* 📊 Métadonnées dans un style compact */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Informations système
          </div>
          
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-600">Créé le</span>
              </div>
              <span className="text-gray-800 font-medium">
                {holiday.created_at ? formatTimestamp(holiday.created_at) : 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-600">Modifié le</span>
              </div>
              <span className="text-gray-800 font-medium">
                {holiday.updated_at ? formatTimestamp(holiday.updated_at) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* 📈 Indicateur de modification */}
        {holiday.created_at && holiday.updated_at && (
          <div className="pt-3 border-t border-gray-100 mt-3">
            <div className="flex items-center justify-center text-xs text-gray-500">
              {holiday.created_at === holiday.updated_at ? (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Jamais modifié
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  Modifié depuis la création
                </span>
              )}
            </div>
          </div>
        )}

      </CardBody>
    </Card>
  );
};

const HolidayTable: React.FC<HolidayTableProps> = ({ holidays: initialHolidays }) => {
  // ✅ États organisés comme BranchesTable
const [holidays, setHolidays] = useState<HolidayData[]>(initialHolidays || []);
  const [isLoading, setIsLoading] = useState(!initialHolidays);
  const [error, setError] = useState<string | null>(null);
  
  // États de filtrage
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(filterValue);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ✅ Effect pour le debouncing (comme BranchesTable)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(filterValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterValue]);

  // ✅ Chargement des données (comme BranchesTable)
  const loadHolidays = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchHolidays();
      const convertedData = data.map(apiHoliday => convertToHoliday(apiHoliday));
      setHolidays(convertedData);
    } catch (error) {
      console.error("Erreur lors du chargement des jours fériés:", error);
      setError("Impossible de charger les jours fériés. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, [initialHolidays]);

  // ✅ Logique de filtrage (adaptée et améliorée)
  const filteredHolidays = useMemo(() => {
    let filtered = holidays;

    // Filtre par recherche (avec debouncedValue)
    if (debouncedValue) {
      const lowercasedFilter = debouncedValue.toLowerCase();
      filtered = filtered.filter((holiday) => 
        holiday.description?.toLowerCase().includes(lowercasedFilter) ||
        holiday.date?.toLowerCase().includes(lowercasedFilter) ||
        holiday.id?.toLowerCase().includes(lowercasedFilter)
      );
    }

    // Filtre par période
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    switch (selectedFilter) {
      case 'upcoming':
        filtered = filtered.filter(holiday => {
          const holidayDate = new Date(holiday.date);
          const holidayMonth = holidayDate.getMonth();
          const holidayDay = holidayDate.getDate();
          
          if (holidayMonth > currentMonth) return true;
          if (holidayMonth === currentMonth && holidayDay > currentDay) return true;
          return false;
        });
        break;
        
      case 'past':
        filtered = filtered.filter(holiday => {
          const holidayDate = new Date(holiday.date);
          const holidayMonth = holidayDate.getMonth();
          const holidayDay = holidayDate.getDate();
          
          if (holidayMonth < currentMonth) return true;
          if (holidayMonth === currentMonth && holidayDay < currentDay) return true;
          return false;
        });
        break;
        
      case 'thisYear':
        filtered = filtered.filter(holiday => new Date(holiday.date).getFullYear() === currentYear);
        break;
        
      default:
        break;
    }

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [holidays, debouncedValue, selectedFilter]);

  // ✅ Gestionnaires d'événements (comme BranchesTable)
  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        'Date,Description,ID,Créé le,Modifié le',
        ...filteredHolidays.map(holiday => 
          `"${holiday.date}","${holiday.description || ''}","${holiday.id}","${holiday.created_at || ''}","${holiday.updated_at || ''}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `holidays_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [filteredHolidays]);

  const handleAdd = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (holiday: Holiday) => {
    // TODO: Implémenter l'édition
    console.log('Éditer holiday:', holiday);
  };

  const handleDelete = (holiday: Holiday) => {
    // TODO: Implémenter la suppression
    console.log('Supprimer holiday:', holiday);
  };

  const handleSuccess = () => {
    setShowCreateModal(false);
    loadHolidays();
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

  // ✅ Loading state avec skeleton (comme BranchesTable)
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* ✅ Gestion d'erreurs (comme BranchesTable) */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
          <Button size="sm" onClick={loadHolidays} className="mt-2 bg-red-600 text-white">
            Réessayer
          </Button>
        </div>
      )}

      {/* FilterBar */}
     <HolidayFilterBar
        filterValue={filterValue}
        selectedFilter={selectedFilter}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onFilterChange={onFilterChange}
        onAdd={handleAdd}
        onExport={handleExport}
        totalCount={filteredHolidays.length}
     />

      <div className="text-sm text-[#2c2e2f]/70">
        {filteredHolidays.length} résultat(s) trouvé(s)
      </div>

      {/* ✅ Grid de cards (même style que BranchesTable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHolidays.length > 0 ? (
          filteredHolidays.map((holiday) => (
           <HolidayCard
              key={holiday.id}
              holiday={holiday}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-8xl mb-4">
              <FaCalendarDays />
            </div>
            <h3 className="text-xl font-semibold text-[#2c2e2f] mb-2">
              {filterValue ? "Aucun jour férié trouvé" : "Aucun jour férié"}
            </h3>
            <p className="text-[#2c2e2f]/70 mb-4">
              {filterValue 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par créer votre premier jour férié"
              }
            </p>
            {filterValue ? (
              <Button onClick={onClear} variant="light" className="text-[#34963d]">
                Effacer les filtres
              </Button>
            ) : (
              <Button onClick={handleAdd} className="bg-[#34963d] text-white">
                Créer un jour férié
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ✅ Modal avec RegisterForm existant */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl border border-[#34963d]/30 bg-gradient-to-br from-white to-green-50/50">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-[#34963d] to-[#1e7367] p-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <h3 className="text-lg font-semibold text-white">Ajouter un jour férié</h3>
                  </div>
                  <Button 
                    isIconOnly 
                    variant="light" 
                    onPress={() => setShowCreateModal(false)}
                    className="text-white hover:bg-white/20 transition-colors"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <RegisterForm onSuccess={handleSuccess} />
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HolidayTable;