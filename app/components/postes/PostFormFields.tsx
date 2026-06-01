"use client";

import React, { ChangeEvent } from "react";
import { ErrorMessages, PostData } from "./validations";
import { Tag, FileText, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from "lucide-react";

interface PostFormFieldsProps {
  formData:             PostData;
  errors:               ErrorMessages<PostData>;
  handleChange:         (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: keyof PostData) => void;
  isSubmitting:         boolean;
  isEditMode:           boolean;
  post?:                PostData | null;
  mode?:                "create" | "edit";
}

/* ─── Checkbox permission card ───────────────────────────────────────────── */

function PermissionCard({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  disabled,
  color,
  bg,
  border,
}: {
  label:       string;
  description: string;
  icon:        React.ElementType;
  checked:     boolean;
  onChange:    () => void;
  disabled:    boolean;
  color:       string;
  bg:          string;
  border:      string;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        checked
          ? `${bg} ${border}`
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {/* Custom checkbox */}
      <div className="mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          checked ? `bg-[#2E7D32] border-[#2E7D32]` : "bg-white border-gray-300"
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      {/* Icône + texte */}
      <div className="flex items-start gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${checked ? bg : "bg-gray-100"}`}>
          <Icon className={`w-4 h-4 ${checked ? color : "text-gray-400"}`} />
        </div>
        <div>
          <p className={`text-sm font-semibold ${checked ? color : "text-gray-700"}`}>
            {label}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
    </label>
  );
}

/* ─── Composant principal ────────────────────────────────────────────────── */

const PostFormFields: React.FC<PostFormFieldsProps> = ({
  formData,
  errors,
  handleChange,
  handleCheckboxChange,
  isSubmitting,
  isEditMode,
}) => {
  const activePerms = [
    formData.deposit    && "Dépôt",
    formData.withdrawal && "Retrait",
    formData.transfer   && "Transfert",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">

      {/* ── En-tête ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {isEditMode ? "Modifier le poste" : "Nouveau poste"}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEditMode
            ? "Mettez à jour les informations et permissions du poste"
            : "Définissez les informations et permissions du poste"}
        </p>
      </div>

      {/* ── Section 1 : Informations de base ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">

        {/* Section header — style CAPOSA */}
        <div className="flex items-center gap-2 pb-1">
          <div className="w-1 h-5 bg-[#2E7D32] rounded-full" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Informations de base
          </p>
        </div>

        {/* Nom du poste */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            Nom du poste
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Ex: Caissier principal, Agent commercial…"
            className={`w-full h-11 px-4 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent
              hover:border-[#2E7D32]/40 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed
              ${errors.name ? "border-red-400 focus:ring-red-400" : "border-gray-200"}`}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Décrivez les responsabilités et tâches de ce poste…"
            rows={3}
            className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent
              hover:border-[#2E7D32]/40 transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed
              ${errors.description ? "border-red-400 focus:ring-red-400" : "border-gray-200"}`}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description}</p>
          )}
        </div>
      </div>

      {/* ── Section 2 : Permissions ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#2E7D32] rounded-full" />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Permissions
            </p>
          </div>
          {activePerms.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-[#DDEAD5] text-[#1B5E20]">
              {activePerms.length} active{activePerms.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Sélectionnez les opérations autorisées pour ce poste.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PermissionCard
            label="Dépôt"
            description="Opérations de dépôt d'argent"
            icon={ArrowDownToLine}
            checked={!!formData.deposit}
            onChange={() => handleCheckboxChange("deposit")}
            disabled={isSubmitting}
            color="text-[#1B5E20]"
            bg="bg-[#DDEAD5]"
            border="border-[#2E7D32]/40"
          />
          <PermissionCard
            label="Retrait"
            description="Opérations de retrait d'argent"
            icon={ArrowUpFromLine}
            checked={!!formData.withdrawal}
            onChange={() => handleCheckboxChange("withdrawal")}
            disabled={isSubmitting}
            color="text-[#D4AF37]"
            bg="bg-yellow-50"
            border="border-[#D4AF37]/40"
          />
          <PermissionCard
            label="Transfert"
            description="Opérations de transfert d'argent"
            icon={ArrowLeftRight}
            checked={!!formData.transfer}
            onChange={() => handleCheckboxChange("transfer")}
            disabled={isSubmitting}
            color="text-[#355C7D]"
            bg="bg-blue-50"
            border="border-[#355C7D]/40"
          />
        </div>

        {/* Récap permissions actives */}
        {activePerms.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.deposit && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]">
                <ArrowDownToLine className="w-3 h-3" /> Dépôt
              </span>
            )}
            {formData.withdrawal && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-50 text-[#D4AF37]">
                <ArrowUpFromLine className="w-3 h-3" /> Retrait
              </span>
            )}
            {formData.transfer && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#355C7D]">
                <ArrowLeftRight className="w-3 h-3" /> Transfert
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostFormFields;