"use client";

import React, { ChangeEvent } from "react";
import { HolidayData, ErrorMessages, HolidayFormData } from "./validations";

interface HolidayFormFieldsProps {
  formData: HolidayFormData;
  errors: ErrorMessages<HolidayData>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleChangeDate: (date: string) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  holiday?: HolidayData | null;
  mode?: "create" | "edit";
}

const HolidayFormFields: React.FC<HolidayFormFieldsProps> = ({
  formData,
  errors,
  handleChange,
  handleChangeDate,
  isSubmitting,
  isEditMode,
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
      const [year, month, day] = dateString.split("-").map(Number);

      // Noms des mois en français
      const moisFrancais = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ];

      // Formatage manuel (sans objet Date)
      return `${day} ${moisFrancais[month - 1]} ${year}`;
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        {formData.date ? (
          <div className="flex items-center justify-center mb-2">
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full mr-2"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Modifier le jour férié" : "Nouveau jour férié"}
            </h2>
            <span className="ml-3 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              📅 {formatDate(formData.date)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center mb-2">
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full mr-2"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Modifier le jour férié" : "Nouveau jour férié"}
            </h2>
          </div>
        )}
        <p className="text-sm text-gray-500">
          {isEditMode
            ? "Apportez les changements nécessaires"
            : "Définissez la date et la description"}
        </p>
      </div>

      {/* Section: Informations */}
      <div className="bg-white shadow-md border border-gray-100 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Informations du jour férié</h3>
        </div>

        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <label
              htmlFor="holiday_date"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <span className="text-lg">📅</span>
              Date du jour férié
            </label>
            <input
              type="date"
              id="holiday_date"
              name="date"
              value={formData.date}
              onChange={(e) => handleChangeDate(e.target.value)}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.date
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 hover:border-emerald-400 focus:ring-emerald-500"
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <span className="text-lg">📝</span>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Décrivez ce jour férié... (minimum 6 caractères)"
              rows={3}
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 hover:border-emerald-400 focus:ring-emerald-500"
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.description?.length || 0} / 100 caractères
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayFormFields;