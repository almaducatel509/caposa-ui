"use client";

import React, { useEffect, useState } from "react";
import { BranchData, BranchFormData, ErrorMessages } from "./validations";

// Types importés (à remplacer par vos vrais imports)
type DepartmentCode = 'OUEST' | 'SUDEST' | 'NORD' | 'NORDEST' | 'ARTIBONITE' | 'CENTRE' | 'SUD' | 'GRAND_ANSE' | 'NORD_OUEST' | 'NIPPES';

// Mock data pour la démo
const HAITI_DEPARTMENTS = [
  { code: "OUEST" as DepartmentCode, name: "Ouest" },
  { code: "NORD" as DepartmentCode, name: "Nord" },
  { code: "SUD" as DepartmentCode, name: "Sud" },
  { code: "ARTIBONITE" as DepartmentCode, name: "Artibonite" },
  { code: "CENTRE" as DepartmentCode, name: "Centre" },
  { code: "SUDEST" as DepartmentCode, name: "Sud-Est" },
  { code: "NORDEST" as DepartmentCode, name: "Nord-Est" },
  { code: "GRAND_ANSE" as DepartmentCode, name: "Grand'Anse" },
  { code: "NORD_OUEST" as DepartmentCode, name: "Nord-Ouest" },
  { code: "NIPPES" as DepartmentCode, name: "Nippes" },
];

const CITIES_BY_DEPARTMENT: Record<DepartmentCode, string[]> = {
  OUEST: ["Port-au-Prince", "Pétion-Ville", "Carrefour"],
  NORD: ["Cap-Haïtien", "Limonade", "Quartier Morin"],
  SUD: ["Les Cayes", "Port-Salut", "Aquin"],
  ARTIBONITE: ["Gonaïves", "Saint-Marc", "Dessalines"],
  CENTRE: ["Hinche", "Mirebalais", "Lascahobas"],
  SUDEST: ["Jacmel", "Marigot", "Cayes-Jacmel"],
  NORDEST: ["Fort-Liberté", "Ouanaminthe", "Trou-du-Nord"],
  GRAND_ANSE: ["Jérémie", "Anse-d'Hainault", "Corail"],
  NORD_OUEST: ["Port-de-Paix", "Saint-Louis-du-Nord", "Môle-Saint-Nicolas"],
  NIPPES: ["Miragoâne", "Petit-Goâve", "Anse-à-Veau"],
};

const getCitiesByDepartment = (code: DepartmentCode): string[] => {
  return CITIES_BY_DEPARTMENT[code] || [];
};

// ================= LOCATION SELECTOR =================
interface HaitiLocationSelectorProps {
  departmentCode: DepartmentCode | "";
  city: string;
  onDepartmentChange: (code: DepartmentCode | "") => void;
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

const HaitiLocationSelector: React.FC<HaitiLocationSelectorProps> = ({
  departmentCode,
  city,
  onDepartmentChange,
  onCityChange,
  disabled = false,
}) => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (departmentCode) {
      const list = getCitiesByDepartment(departmentCode as DepartmentCode);
      setCities(list);
      if (city && !list.includes(city)) onCityChange("");
    } else {
      setCities([]);
      onCityChange("");
    }
  }, [departmentCode, city, onCityChange]);

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          Département
        </label>
        <select
          value={departmentCode}
          onChange={(e) => onDepartmentChange(e.target.value as DepartmentCode | "")}
          disabled={disabled}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Sélectionnez un département</option>
          {HAITI_DEPARTMENTS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <span className="text-lg">🏙️</span>
          Ville
        </label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!departmentCode || disabled}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
        >
          <option value="">
            {departmentCode ? "Sélectionnez une ville" : "Choisissez d'abord un département"}
          </option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

// ================= MAIN COMPONENT (EXPORT) =================
interface BranchFormFieldsProps {
  formData: BranchFormData;
  errors: ErrorMessages<BranchFormData>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
  branch?: BranchData | null;
  mode?: "create" | "edit" | "activate";
}

const BranchFormFields: React.FC<BranchFormFieldsProps> = ({
  formData,
  errors,
  handleChange,
  isSubmitting,
  isEditMode,
}) => {

  const totalPosts =
    (formData.number_of_tellers || 0) +
    (formData.number_of_clerks || 0) +
    (formData.number_of_credit_officers || 0);

  return (
    <div className="space-y-6">
      {/* ================= Section 1: Informations de Base ================= */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
                {/* En-tête */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-2.5 h-2.5 bg-green-600 rounded-full mr-2"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? "Modifier la Branche" : "Créer une Nouvelle Branche"}
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              {isEditMode
                ? "Mettez à jour les informations et permissions de la branche"
                : "Définissez les informations de la branche"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom de la Branche */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">🏢</span>
                Nom de la Branche
              </label>
              <input
                type="text"
                name="branch_name"
                value={formData.branch_name || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.branch_name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.branch_name && (
                <p className="text-xs text-red-500">{errors.branch_name}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">📞</span>
                Numéro de Téléphone
              </label>
              <input
                type="tel"
                name="branch_phone_number"
                value={formData.branch_phone_number || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.branch_phone_number ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.branch_phone_number && (
                <p className="text-xs text-red-500">{errors.branch_phone_number}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">✉️</span>
                Adresse Email
              </label>
              <input
                type="email"
                name="branch_email"
                value={formData.branch_email || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.branch_email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.branch_email && (
                <p className="text-xs text-red-500">{errors.branch_email}</p>
              )}
            </div>

            {/* Adresse Complète */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Adresse (numéro et rue)
              </label>
              <input
                type="text"
                name="branch_address"
                placeholder="Ex. : 13 Rue Capois"
                value={formData.branch_address || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.branch_address ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500">
                Saisissez uniquement le numéro et le nom de la rue. La ville et le département sont sélectionnés plus bas.
              </p>
              {errors.branch_address && (
                <p className="text-xs text-red-500">{errors.branch_address}</p>
              )}
            </div>

            {/* Département + Ville */}
            <HaitiLocationSelector
              departmentCode={formData.department_code || ""}
              city={formData.city || ""}
              onDepartmentChange={(code) =>
                handleChange({
                  target: { name: "department_code", value: code },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              onCityChange={(city) =>
                handleChange({
                  target: { name: "city", value: city },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              disabled={isSubmitting}
            />
          </div>

          {(errors.department_code || errors.city) && (
            <div className="mt-2 space-y-1">
              {errors.department_code && (
                <p className="text-xs text-red-500">{errors.department_code}</p>
              )}
              {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
            </div>
          )}
        </div>
      </div>

      {/* ================= Section 2: Personnel et Postes ================= */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">Personnel et Postes</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Caissiers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">💰</span>
                Caissiers
              </label>
              <input
                type="number"
                name="number_of_tellers"
                value={formData.number_of_tellers || 0}
                onChange={handleChange}
                min="0"
                disabled={isSubmitting}
                className={`w-full p-3 border rounded-lg text-center font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.number_of_tellers ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.number_of_tellers && (
                <p className="text-xs text-red-500">{errors.number_of_tellers}</p>
              )}
            </div>

            {/* Personnel */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">👥</span>
                Personnel
              </label>
              <input
                type="number"
                name="number_of_clerks"
                value={formData.number_of_clerks || 0}
                onChange={handleChange}
                min="0"
                disabled={isSubmitting}
                className={`w-full p-3 border rounded-lg text-center font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.number_of_clerks ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.number_of_clerks && (
                <p className="text-xs text-red-500">{errors.number_of_clerks}</p>
              )}
            </div>

            {/* Agents de Crédit */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">💼</span>
                Agents de Crédit
              </label>
              <input
                type="number"
                name="number_of_credit_officers"
                value={formData.number_of_credit_officers || 0}
                onChange={handleChange}
                min="0"
                disabled={isSubmitting}
                className={`w-full p-3 border rounded-lg text-center font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.number_of_credit_officers ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.number_of_credit_officers && (
                <p className="text-xs text-red-500">{errors.number_of_credit_officers}</p>
              )}
            </div>

            {/* Postes (total) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">🪑</span>
                Postes (total)
              </label>
              <input
                type="number"
                value={totalPosts}
                readOnly
                className="w-full p-3 border rounded-lg text-center font-medium bg-gray-50 border-gray-200 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                Somme des caissiers, personnel et agents de crédit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Section 3: Date d'Ouverture ================= */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-linear-to-b from-purple-500 to-purple-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">Date d'Ouverture</h3>
          </div>

          <div className="max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">📅</span>
                Date d'Ouverture
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium border border-blue-200">
                  Date de création
                </span>
              </label>
              <input
                type="date"
                value={formData.opening_date || ""}
                readOnly
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">
                📌 Cette date est automatiquement définie lors de la création de la branche
              </p>
              <p className="text-xs text-gray-500">
                💡 Les horaires d'ouverture et jours fériés sont configurés au niveau de la ville
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchFormFields;