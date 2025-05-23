"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useDisclosure,
  Button,
  Chip
} from "@nextui-org/react";

// Composants séparés - utiliser vos composants existants
import HolidayFilterBar from './HolidayFilterBar';
// import HolidayModal from './HolidayModal'; // On va utiliser le RegisterForm existant

// Types et API
import { Holiday, columns, renderCell, convertToHoliday } from "@/app/dashboard/holidays/columns";
import { fetchHolidays } from '@/app/lib/api/holiday';
import RegisterForm from '@/app/components/holidays/register_form';

interface HolidayTableProps {
  holidays?: Holiday[];
}

const HolidayTable: React.FC<HolidayTableProps> = ({ holidays: initialHolidays }) => {
  // États
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays || []);
  const [isLoading, setIsLoading] = useState(!initialHolidays);
  const [filterValue, setFilterValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Logique de filtrage
  const filteredHolidays = useMemo(() => {
    let filtered = holidays;

    // Filtre par recherche
    if (filterValue) {
      const lowercasedFilter = filterValue.toLowerCase();
      filtered = filtered.filter((holiday) => 
        holiday.description?.toLowerCase().includes(lowercasedFilter) ||
        holiday.id?.toLowerCase().includes(lowercasedFilter) ||
        holiday.date?.toLowerCase().includes(lowercasedFilter)
      );
    }

    // Filtre par période
    const today = new Date();
    const currentYear = today.getFullYear(); // ← Remettre cette ligne !
    const currentMonth = today.getMonth(); // 0-11
    const currentDay = today.getDate();

    switch (selectedFilter) {
      case 'upcoming':
        filtered = filtered.filter(holiday => {
          const holidayDate = new Date(holiday.date);
          const holidayMonth = holidayDate.getMonth();
          const holidayDay = holidayDate.getDate();
          
          // Comparer seulement mois et jour (ignorer l'année)
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
          
          // Comparer seulement mois et jour (ignorer l'année)
          if (holidayMonth < currentMonth) return true;
          if (holidayMonth === currentMonth && holidayDay < currentDay) return true;
          return false;
        });
        break;
        
      case 'thisYear':
        // Garder la logique année pour ce filtre spécifique
        filtered = filtered.filter(holiday => new Date(holiday.date).getFullYear() === currentYear);
        break;
        
      default:
        break;
    }

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [holidays, filterValue, selectedFilter]);

  // Chargement des données
  const loadHolidays = async () => {
    if (initialHolidays?.length && !isLoading) return;
    
    try {
      setIsLoading(true);
      const data = await fetchHolidays();
      const convertedData = data.map(apiHoliday => convertToHoliday(apiHoliday));
      setHolidays(convertedData);
    } catch (error) {
      console.error("Erreur lors du chargement des jours fériés:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, [initialHolidays]);

  // Gestionnaires d'événements
  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        'ID,Date,Description',
        ...filteredHolidays.map(holiday => 
          `"${holiday.id}","${holiday.date}","${holiday.description || ''}"`
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

  const handleModalSuccess = useCallback(() => {
    onClose();
    loadHolidays(); // Recharger les données après ajout
  }, [onClose]);

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
  }, []);

  const onFilterChange = useCallback((key: string) => {
    setSelectedFilter(key);
  }, []);

  // Rendu du composant
  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Barre de filtres */}
      <HolidayFilterBar
        filterValue={filterValue}
        selectedFilter={selectedFilter}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onFilterChange={onFilterChange}
        onAdd={onOpen}
        onExport={handleExport}
        totalCount={filteredHolidays.length}
      />

      {/* Tableau principal */}
      <Card className="shadow-lg border border-[#34963d]/20 bg-gradient-to-r from-white to-green-50/30">
        <CardHeader className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-[#34963d] to-[#1e7367]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl font-bold text-white">Jours Fériés</h2>
          </div>
          <Chip 
            size="lg" 
            variant="flat" 
            className="bg-white/20 text-white font-semibold border border-white/30"
          >
            {filteredHolidays.length} jours
          </Chip>
        </CardHeader>

        <Divider className="bg-gradient-to-r from-[#34963d]/30 to-[#1e7367]/30" />

        <CardBody className="px-3">
          <Table
            aria-label="Tableau des jours fériés"
            removeWrapper
            selectionMode="none"
            classNames={{
              wrapper: "bg-transparent",
              tbody: "divide-y divide-[#34963d]/10",
              th: "bg-gradient-to-r from-[#34963d]/10 to-[#1e7367]/10 text-[#2c2e2f] font-semibold border-b-2 border-[#34963d]/20",
              td: "hover:bg-[#34963d]/5 transition-colors duration-200",
            }}
          >
            <TableHeader>
              {columns.map((column) => (
                <TableColumn 
                  key={column.key} 
                  align={column.key === "actions" ? "end" : "start"}
                  className="bg-gradient-to-r from-[#34963d]/10 to-[#1e7367]/10 text-xs uppercase tracking-wider font-semibold text-[#2c2e2f] border-b-2 border-[#34963d]/20"
                >
                  {column.key === "date" && <span className="text-[#34963d] mr-1">📅</span>}
                  {column.key === "description" && <span className="text-[#1e7367] mr-1">📝</span>}
                  {column.label}
                </TableColumn>
              ))}
            </TableHeader>

            <TableBody
              items={filteredHolidays}
              isLoading={isLoading}
              loadingContent={
                <div className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#34963d]/20 border-t-[#34963d] rounded-full animate-spin"></div>
                    <span className="text-[#34963d] font-medium">Chargement des jours fériés...</span>
                  </div>
                </div>
              }
              emptyContent={
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-[#2c2e2f] font-medium mb-2">Aucun jour férié trouvé</p>
                  {filterValue && (
                    <button 
                      onClick={onClear} 
                      className="text-[#34963d] hover:text-[#1e7367] underline mt-2 transition-colors"
                    >
                      Effacer le filtre
                    </button>
                  )}
                </div>
              }
            >
              {(holiday) => (
                <TableRow 
                  key={holiday.id}
                  className="hover:bg-gradient-to-r hover:from-[#34963d]/5 hover:to-[#1e7367]/5 transition-all duration-200"
                >
                  {(columnKey) => (
                    <TableCell className="py-3">
                      {renderCell(holiday, columnKey, loadHolidays)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal d'ajout - utiliser votre RegisterForm existant */}
      {typeof window !== "undefined" && isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl border border-[#34963d]/30 bg-gradient-to-br from-white to-green-50/50">
            <CardHeader className="flex justify-between items-center bg-gradient-to-r from-[#34963d] to-[#1e7367]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h3 className="text-lg font-semibold text-white">Ajouter un jour férié</h3>
              </div>
              <Button 
                isIconOnly 
                variant="light" 
                onPress={onClose}
                className="text-white hover:bg-white/20 transition-colors"
              >
                ✕
              </Button>
            </CardHeader>
            <CardBody className="p-6">
              <RegisterForm onSuccess={handleModalSuccess} />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HolidayTable;