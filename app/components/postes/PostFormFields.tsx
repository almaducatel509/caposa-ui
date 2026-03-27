"use client";

import React, { ChangeEvent } from "react";
import { ErrorMessages, PostData } from "./validations";

interface PostFormFieldsProps {
  formData: PostData;
  errors: ErrorMessages<PostData>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: keyof PostData) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  post?: PostData | null;
  mode?: "create" | "edit";
}

const PostFormFields: React.FC<PostFormFieldsProps> = ({
  formData,
  errors,
  handleChange,
  handleCheckboxChange,
  isSubmitting,
  isEditMode,
}) => {
  const getSelectedPermissions = () => {
    const permissions = [];
    if (formData.deposit) {
      permissions.push({ label: "Dépôt", icon: "💰", color: "bg-green-100 text-green-700 border-green-200" });
    }
    if (formData.withdrawal) {
      permissions.push({ label: "Retrait", icon: "💸", color: "bg-orange-100 text-orange-700 border-orange-200" });
    }
    if (formData.transfert) {
      permissions.push({ label: "Transfert", icon: "🔄", color: "bg-blue-100 text-blue-700 border-blue-200" });
    }
    return permissions;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-2"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Modifier le Poste" : "Créer un Nouveau Poste"}
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          {isEditMode
            ? "Mettez à jour les informations et permissions du poste"
            : "Définissez les informations et permissions du poste"}
        </p>
      </div>

      {/* Section 1: Informations de Base */}
      <div className="bg-white shadow-md border border-gray-100 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-6 bg-linear-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Informations de Base</h3>
        </div>

        <div className="space-y-4">
          {/* Nom du poste */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              Nom du Poste
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Ex: Caissier Principal, Agent Commercial..."
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 hover:border-blue-400 focus:ring-blue-500"
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="text-lg">📝</span>
              Description du Poste
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Décrivez les responsabilités et tâches de ce poste..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 hover:border-blue-400 focus:ring-blue-500"
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Permissions */}
      <div className="bg-white shadow-md border border-gray-100 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-6 bg-linear-to-b from-green-500 to-green-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Permissions et Autorisations</h3>
        </div>

        <div className="space-y-5">
          <p className="text-sm text-gray-600">
            Sélectionnez les opérations que ce poste est autorisé à effectuer :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Permission Dépôt */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.deposit}
                  onChange={() => handleCheckboxChange("deposit")}
                  disabled={isSubmitting}
                  className="w-5 h-5 text-green-500 border-green-300 rounded focus:ring-green-500 disabled:cursor-not-allowed"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span className="font-medium text-green-700">Dépôt</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 ml-8">
                Autoriser les opérations de dépôt d'argent
              </p>
            </div>

            {/* Permission Retrait */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.withdrawal}
                  onChange={() => handleCheckboxChange("withdrawal")}
                  disabled={isSubmitting}
                  className="w-5 h-5 text-orange-500 border-orange-300 rounded focus:ring-orange-500 disabled:cursor-not-allowed"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">💸</span>
                  <span className="font-medium text-orange-700">Retrait</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 ml-8">
                Autoriser les opérations de retrait d'argent
              </p>
            </div>

            {/* Permission Transfert */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.transfert}
                  onChange={() => handleCheckboxChange("transfert")}
                  disabled={isSubmitting}
                  className="w-5 h-5 text-blue-500 border-blue-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔄</span>
                  <span className="font-medium text-blue-700">Transfert</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 ml-8">
                Autoriser les opérations de transfert d'argent
              </p>
            </div>
          </div>

          {/* Aperçu des permissions sélectionnées */}
          {getSelectedPermissions().length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Permissions sélectionnées :
              </div>
              <div className="flex flex-wrap gap-2">
                {getSelectedPermissions().map((permission, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 border ${permission.color}`}
                  >
                    <span>{permission.icon}</span>
                    {permission.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostFormFields;