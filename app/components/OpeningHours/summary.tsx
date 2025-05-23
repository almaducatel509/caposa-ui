"use client";

import React from "react";
import { ExtendedOpeningHours } from './validations';

interface OpeningHoursSummaryProps {
  formData: ExtendedOpeningHours;
  showSummary?: boolean; // Propriété pour contrôler l'affichage
  title?: string;
  validFrom?: Date;
  validTo?: Date;
}

const dayTranslations = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche"
};

const OpeningHoursSummary: React.FC<OpeningHoursSummaryProps> = ({ 
  formData,
  showSummary = true, // Par défaut, le résumé est affiché
  title,
  validFrom,
  validTo
}) => {
  // Si showSummary est false, ne rien afficher
  if (!showSummary) return null;

  // Fonction pour formater la date
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour formater l'affichage des heures
  const formatHours = (hourString?: string) => {
    if (!hourString || hourString === "") return "Fermé";
    return hourString;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      {title && (
        <div className="mb-3">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          {validFrom && validTo && (
            <p className="text-sm text-gray-600">
              Valide du {formatDate(validFrom)} au {formatDate(validTo)}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {Object.entries(formData).map(([day, value]) => {
          if (day === 'saturday' || day === 'sunday') {
            if (!value) return null; // Ne pas afficher les weekends s'ils sont vides
          }
          
          return (
            <div key={day} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
              <span className="font-medium text-gray-700">
                {dayTranslations[day as keyof typeof dayTranslations]}
                {(day === 'saturday' || day === 'sunday') && (
                  <span className="ml-2 text-xs text-purple-600 font-normal">Weekend</span>
                )}
              </span>
              <span className={`${!value ? "text-red-500" : "text-green-600"}`}>
                {formatHours(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpeningHoursSummary;