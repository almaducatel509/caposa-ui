"use client";

import React from "react";
import {
  Textarea,
  DateInput,
  Chip
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { appConfig } from "@/app/lib/actions";
import { Input } from "@nextui-org/input";
// Vous pouvez importer vos types depuis le fichier de validation
export interface Holiday {
  id?: string;
  date: string;
  description: string;
}

interface ErrorMessages {
  date?: string;
  description?: string;
}

interface HolidayFormFieldsProps {
  formData: Holiday;
  errors: ErrorMessages;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleChangeDate: (date: any) => void;
  isSubmitting: boolean;
}

const HolidayFormFields: React.FC<HolidayFormFieldsProps> = ({
  formData,
  errors,
  handleChange,
  handleChangeDate,
  isSubmitting
}) => {
  // Fonction pour formater la date pour l'affichage
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
// Fonction pour convertir une date ISO en objet Date pour l'affichage
  const safeParseDateForInput = (dateString: string) => {
    try {
      if (!dateString) return parseDate(appConfig.defaultDate);
      
      // Vérifier si le format est correct
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return parseDate(appConfig.defaultDate);
      }
      
      return parseDate(dateString);
    } catch (error) {
      console.error("Erreur lors du parsing de la date:", error);
      return parseDate(appConfig.defaultDate);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec date stylisée si disponible */}
      {formData.date && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {formData.id ? "Modifier le jour férié" : "Nouveau jour férié"}
          </h3>
          <Chip 
            color="primary" 
            variant="flat" 
            className="text-sm"
            startContent={<span className="text-primary">📅</span>}
          >
            {formatDate(formData.date)}
          </Chip>
        </div>
      )}

      {/* Entrée de date */}
      <div className="space-y-2">
        <label htmlFor="holiday_date" className="text-sm text-gray-700 font-semibold flex items-center gap-2">
          <span className="text-primary">📅</span> Date
        </label>
        <div className="relative">
          <Input
            type="date"
            aria-label="Date"
            label="Date du jour férié"
            name="date"
            value={formData.date} // Format ISO YYYY-MM-DD
            onChange={(e) => {
              // La valeur est déjà au format YYYY-MM-DD
              handleChangeDate(e.target.value);
            }}
            className="w-full"
            classNames={{
              base: "bg-white",
              input: "bg-white text-black",
              inputWrapper: "bg-white border border-gray-300 rounded-md hover:border-primary focus:border-primary",
            }}
            variant="bordered"
            isInvalid={!!errors.date}
            isDisabled={isSubmitting}
          />
          {errors.date && (
            <p className="text-xs text-danger mt-1">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Description - inchangée */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-primary">📝</span> Description
        </label>
        <div>
          <Textarea
            placeholder="Décrivez ce jour férié..."
            name="description"
            value={formData.description}
            onChange={handleChange}
            minRows={3}
            className="w-full"
            variant="bordered"
            classNames={{
              input: "text-md",
              inputWrapper: "border border-gray-300 hover:border-primary focus:border-primary",
            }}
            isInvalid={!!errors.description}
            isDisabled={isSubmitting}
            size="lg"
          />
          {errors.description && (
            <p className="text-xs text-danger mt-1">{errors.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayFormFields;