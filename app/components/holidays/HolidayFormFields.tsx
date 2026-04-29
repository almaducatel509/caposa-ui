"use client";

import React, { ChangeEvent, useMemo } from "react";
import {
  Calendar,
  FileText,
  Tag,
  MessageSquare,
  Globe,
  MapPin,
  Building2,
  Info,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

import {
  HolidayData,
  HolidayFormData,
  ErrorMessages,
  HOLIDAY_TYPE_LABELS,
  HOLIDAY_SCOPE_LABELS,
} from "./validations";

// 🔌 À remplacer par fetchBranches() / un import propre
import { MOCK_BRANCHES } from "../OpeningHours/mock";

/* ─── Composants internes ────────────────────────────────────────────────── */

const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
  children,
  required,
}) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
    {children} {required && <span className="text-red-500">*</span>}
  </p>
);

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  !msg ? null : (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );

const SectionTitle: React.FC<{
  icon: React.ElementType;
  label: string;
  color?: string;
}> = ({ icon: Icon, label, color = "#2E7D32" }) => (
  <div className="flex items-center gap-2 mb-4">
    <div
      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: color + "18" }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color }} />
    </div>
    <p
      className="text-xs font-bold uppercase tracking-widest"
      style={{ color }}
    >
      {label}
    </p>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

/* ─── Mapping icônes pour scope ──────────────────────────────────────────── */

const SCOPE_ICONS: Record<HolidayData["scope"], React.ElementType> = {
  national: Globe,
  regional: MapPin,
  branch: Building2,
  autre: Tag,
};

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface HolidayFormFieldsProps {
  formData: HolidayFormData;
  errors: ErrorMessages<HolidayData>;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleChangeDate: (date: string) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  holiday: HolidayData | null;
  mode?: "create" | "edit";
}

/* ─── Composant principal ────────────────────────────────────────────────── */

const HolidayFormFields: React.FC<HolidayFormFieldsProps> = ({
  formData,
  errors,
  handleChange,
  handleChangeDate,
  isSubmitting,
  isEditMode,
  mode = "create",
}) => {
  /* Si scope=branch, on doit pré-remplir une branche pour le modal d'assignation */
  const showBranchCodePicker = formData.scope === "branch";

  const fieldCls = (err?: string) =>
    [
      "w-full h-11 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors",
      isSubmitting ? "opacity-50 cursor-not-allowed" : "",
      err
        ? "border-red-400 ring-2 ring-red-200"
        : "border-gray-200 hover:border-[#2E7D32]/40 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20",
    ].join(" ");

  const selectCls = (err?: string) =>
    fieldCls(err) + " appearance-none pr-9";

  return (
    <div className="space-y-4">
      {/* ── Bandeau d'info : workflow brouillon → assignation ── */}
      {!isEditMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
          <p className="text-xs text-[#355C7D] leading-relaxed">
            Vous créez la <strong>fiche du jour férié</strong>. Après la
            création, vous pourrez l'<strong>assigner aux branches concernées</strong>{" "}
            depuis la liste. Tant qu'il n'est pas assigné, le férié reste un
            brouillon et ne bloque aucun caissier.
          </p>
        </div>
      )}

      {/* ── Section 1 : Identité ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Calendar} label="Identité" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Date</Label>
            <input
              type="date"
              name="date"
              value={formData.date || ""}
              onChange={(e) => handleChangeDate(e.target.value)}
              disabled={isSubmitting}
              className={fieldCls(errors.date)}
            />
            <FieldError msg={errors.date} />
          </div>

          <div>
            <Label required>Description</Label>
            <input
              type="text"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Ex : Jour de l'Indépendance"
              maxLength={100}
              className={fieldCls(errors.description)}
            />
            <div className="flex justify-between items-center mt-1">
              <FieldError msg={errors.description} />
              <p className="text-xs text-gray-400 ml-auto">
                {(formData.description ?? "").length} / 100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2 : Classification ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Tag} label="Classification" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type — 6 options */}
          <div>
            <Label required>Type</Label>
            <div className="relative">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isSubmitting}
                className={selectCls(errors.type)}
              >
                {(Object.keys(HOLIDAY_TYPE_LABELS) as HolidayData["type"][]).map(
                  (k) => (
                    <option key={k} value={k}>
                      {HOLIDAY_TYPE_LABELS[k]}
                    </option>
                  )
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <FieldError msg={errors.type} />
          </div>

          {/* Scope — 4 options */}
          <div>
            <Label required>Portée par défaut</Label>
            <div className="relative">
              <select
                name="scope"
                value={formData.scope}
                onChange={handleChange}
                disabled={isSubmitting}
                className={selectCls(errors.scope)}
              >
                {(Object.keys(HOLIDAY_SCOPE_LABELS) as HolidayData["scope"][]).map(
                  (k) => {
                    const Icon = SCOPE_ICONS[k];
                    return (
                      <option key={k} value={k}>
                        {HOLIDAY_SCOPE_LABELS[k]}
                      </option>
                    );
                  }
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Pré-remplit le modal d'assignation. La décision finale se fait à
              l'étape suivante.
            </p>
            <FieldError msg={errors.scope} />
          </div>
        </div>

        {/* Branch_code conditionnel : seulement si scope=branch */}
        {showBranchCodePicker && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Label>Branche concernée (suggestion)</Label>
            <div className="relative">
              <select
                name="branch_code"
                value={formData.branch_code || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                className={selectCls(errors.branch_code)}
              >
                <option value="">Sélectionner une branche…</option>
                {MOCK_BRANCHES.map((b) => (
                  <option key={b.branch_code} value={b.branch_code}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-amber-700 mt-2 leading-relaxed">
              Cette branche sera <strong>pré-cochée</strong> dans le modal
              d'assignation. Vous pourrez en ajouter d'autres ou changer
              d'avis.
            </p>
            <FieldError msg={errors.branch_code} />
          </div>
        )}
      </div>

      {/* ── Section 3 : Commentaire ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={MessageSquare} label="Commentaire" />
        <Label>Commentaire (optionnel)</Label>
        <textarea
          name="comment"
          value={formData.comment || ""}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Observations, contexte, informations complémentaires…"
          rows={3}
          maxLength={500}
          className={[
            "w-full px-4 py-3 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors resize-none",
            isSubmitting ? "opacity-50 cursor-not-allowed" : "",
            errors.comment
              ? "border-red-400 ring-2 ring-red-200"
              : "border-gray-200 hover:border-[#2E7D32]/40 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20",
          ].join(" ")}
        />
        <div className="flex justify-between items-center mt-1">
          <FieldError msg={errors.comment} />
          <p className="text-xs text-gray-400 ml-auto">
            {(formData.comment ?? "").length} / 500
          </p>
        </div>
      </div>
    </div>
  );
};

export default HolidayFormFields;