'use client';

import React from "react";
import { Tooltip, Badge, Chip } from '@nextui-org/react';
import { FaRegTrashCan } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa"; // Garde l'icône comme demandé
import { deleteHoliday, HolidayAPI } from "@/app/lib/api/holiday"; // Importer HolidayAPI au lieu de Holiday
import EditHoliday from "@/app/components/holidays/EditHoliday";

// Define the holiday data type locally
export interface Holiday {
  id: string;
  date: string;
  description: string;
}

// Define the columns for the holidays table
export const columns = [
  { key: 'date', label: 'DATE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'actions', label: 'ACTIONS' },
];

/// Fonction d'affichage qui utilise directement les composants de la date
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  
  try {
    // Vérifier le format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Extraire directement les composants
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Noms des mois en français
    const moisFrancais = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    // Formatage manuel (sans objet Date)
    return `${day} ${moisFrancais[month-1]} ${year}`;
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return dateString;
  }
};

// Fonction utilitaire pour convertir HolidayAPI en Holiday
export const convertToHoliday = (apiHoliday: HolidayAPI): Holiday => {
  return {
    id: apiHoliday.id || "", // Valeur vide par défaut si ID est undefined
    date: apiHoliday.date,
    description: apiHoliday.description
  };
};

// Function to render each cell in the table
export const renderCell = (holiday: Holiday, columnKey: React.Key, onDeleteSuccess?: () => void) => {
  const cellValue = holiday[columnKey as keyof Holiday];

  switch (columnKey) {
    case 'date':
      return (
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-primary" />
          <Chip
            className="capitalize"
            color="primary"
            size="sm"
            variant="flat"
          >
            {formatDate(holiday.date)}
          </Chip>
        </div>
      );
      
    case 'description':
      return (
        <div className="flex flex-col max-w-md">
          <p className="text-sm text-default-600">{holiday.description}</p>
        </div>
      );
      
    case 'actions':
      return (
        <div className="relative flex items-center justify-end gap-2">
          <EditHoliday 
            holiday={holiday}
            onSuccess={onDeleteSuccess} onClose={function (): void {
              throw new Error("Function not implemented.");
            } }          />
          
          <Tooltip color="danger" content="Supprimer">
            <span 
              className="text-lg text-danger cursor-pointer active:opacity-50"
              onClick={async () => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce jour férié ?")) {
                  try {
                    await deleteHoliday(holiday.id);
                    if (onDeleteSuccess) onDeleteSuccess();
                  } catch (error) {
                    console.error("Erreur lors de la suppression:", error);
                    alert("Erreur lors de la suppression");
                  }
                }
              }}
            >
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );
      
    default:
      return cellValue;
  }
};