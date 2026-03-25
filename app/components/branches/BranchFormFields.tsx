"use client";

import React, { useEffect } from "react";
import { MapPin, Clock, AlertTriangle } from "lucide-react";

/* ── Source unique de vérité ── */
import {
  HAITI_DEPARTMENTS,
  CITIES_BY_DEPARTMENT,
  DepartmentCode,
} from "@/app/data/haitiLocations";

import { BranchData, BranchFormData, ErrorMessages } from "./validations";
import { OpeningHourAutocomplete } from "./OpeningHourAutocomplete";

/* ─── Composants internes ────────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
      {children}
    </p>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );
}

function SectionTitle({
  icon: Icon,
  label,
  color = "#2E7D32",
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "18" }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
        {label}
      </p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

/* ─── HaitiLocationSelector (consomme haitiLocations.ts) ────────────────── */

interface LocationSelectorProps {
  departmentCode: DepartmentCode | "";
  city: string;
  onDepartmentChange: (code: DepartmentCode | "") => void;
  onCityChange: (city: string) => void;
  disabled?: boolean;
  departmentError?: string;
  cityError?: string;
}

function HaitiLocationSelector({
  departmentCode,
  city,
  onDepartmentChange,
  onCityChange,
  disabled,
  departmentError,
  cityError,
}: LocationSelectorProps) {
  const cities = departmentCode
    ? (CITIES_BY_DEPARTMENT[departmentCode as DepartmentCode] ?? [])
    : [];

  useEffect(() => {
    if (departmentCode && city && !cities.includes(city)) {
      onCityChange("");
    }
  }, [departmentCode]);

  const selectCls = (err?: string) =>
    [
      "w-full h-11 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6]",
      "appearance-none outline-none transition-colors",
      disabled ? "opacity-50 cursor-not-allowed border-gray-100" : "",
      err
        ? "border-red-400 ring-2 ring-red-200"
        : "border-gray-200 hover:border-[#355C7D]/40 focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20",
    ].join(" ");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Département */}
      <div>
        <Label>Département <span className="text-red-500">*</span></Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#355C7D] pointer-events-none" />
          <select
            value={departmentCode}
            onChange={(e) => onDepartmentChange(e.target.value as DepartmentCode | "")}
            disabled={disabled}
            className={selectCls(departmentError) + " pl-9"}
          >
            <option value="">Sélectionnez un département</option>
            {HAITI_DEPARTMENTS.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>
        <FieldError msg={departmentError} />
      </div>

      {/* Ville */}
      <div>
        <Label>Ville <span className="text-red-500">*</span></Label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!departmentCode || disabled}
          className={selectCls(cityError)}
        >
          <option value="">
            {departmentCode
              ? "Sélectionnez une ville"
              : "Choisissez d'abord un département"}
          </option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <FieldError msg={cityError} />
      </div>
    </div>
  );
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface BranchFormFieldsProps {
  formData: BranchFormData;
  errors: ErrorMessages<BranchFormData>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
  branch?: BranchData | null;
  mode?: "create" | "edit" | "activate";
  /** Callback dédié pour opening_hour (évite de passer par handleChange) */
  onOpeningHourChange?: (id: string) => void;
}

/* ─── Composant principal ────────────────────────────────────────────────── */

const BranchFormFields: React.FC<BranchFormFieldsProps> = ({
  formData,
  errors,
  handleChange,
  isSubmitting,
  isEditMode,
  mode = "create",
  onOpeningHourChange,
}) => {
  const totalPosts =
    (formData.number_of_tellers         || 0) +
    (formData.number_of_clerks           || 0) +
    (formData.number_of_credit_officers  || 0);

  /* Adaptateurs localisation → handleChange synthétique */
  const handleDepartmentChange = (code: DepartmentCode | "") =>
    handleChange({
      target: { name: "department_code", value: code },
    } as React.ChangeEvent<HTMLSelectElement>);

  const handleCityChange = (city: string) =>
    handleChange({
      target: { name: "city", value: city },
    } as React.ChangeEvent<HTMLSelectElement>);

  const fieldCls = (err?: string) =>
    [
      "w-full h-11 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors",
      isSubmitting ? "opacity-50 cursor-not-allowed" : "",
      err
        ? "border-red-400 ring-2 ring-red-200"
        : "border-gray-200 hover:border-[#2E7D32]/40 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20",
    ].join(" ");

  return (
    <div className="space-y-5">

      {/* ── Section 1 : Identité ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle
          icon={() => <span style={{ fontSize: 14 }}>🏢</span>}
          label="Identité de la branche"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <Label>Nom de la branche <span className="text-red-500">*</span></Label>
            <input
              type="text"
              name="branch_name"
              value={formData.branch_name || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Ex : Branche Pétionville"
              className={fieldCls(errors.branch_name)}
            />
            <FieldError msg={errors.branch_name} />
          </div>

          <div>
            <Label>Téléphone <span className="text-red-500">*</span></Label>
            <input
              type="tel"
              name="branch_phone_number"
              value={formData.branch_phone_number || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="+509 xxxx xxxx"
              className={fieldCls(errors.branch_phone_number)}
            />
            <FieldError msg={errors.branch_phone_number} />
          </div>

          <div>
            <Label>Email <span className="text-red-500">*</span></Label>
            <input
              type="email"
              name="branch_email"
              value={formData.branch_email || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="branche@caposa.ht"
              className={fieldCls(errors.branch_email)}
            />
            <FieldError msg={errors.branch_email} />
          </div>

          <div className="md:col-span-2">
            <Label>Adresse (numéro et rue) <span className="text-red-500">*</span></Label>
            <input
              type="text"
              name="branch_address"
              value={formData.branch_address || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Ex : 13 Rue Capois"
              className={fieldCls(errors.branch_address)}
            />
            <p className="text-xs text-gray-400 mt-1">
              La ville et le département sont sélectionnés ci-dessous.
            </p>
            <FieldError msg={errors.branch_address} />
          </div>

          <div className="md:col-span-2">
            <Label>Date d'ouverture <span className="text-red-500">*</span></Label>
            <input
              type="date"
              name="opening_date"
              value={formData.opening_date || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className={fieldCls(errors.opening_date)}
            />
            <FieldError msg={errors.opening_date} />
          </div>
        </div>
      </div>

      {/* ── Section 2 : Localisation ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={MapPin} label="Localisation" color="#355C7D" />
        <HaitiLocationSelector
          departmentCode={formData.department_code || ""}
          city={formData.city || ""}
          onDepartmentChange={handleDepartmentChange}
          onCityChange={handleCityChange}
          disabled={isSubmitting}
          departmentError={errors.department_code}
          cityError={errors.city}
        />
      </div>

      {/* ── Section 3 : Personnel ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle
          icon={() => <span style={{ fontSize: 14 }}>👥</span>}
          label="Personnel et postes"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {[
            { name: "number_of_tellers",        label: "Caissiers",     color: "#2E7D32", err: errors.number_of_tellers        },
            { name: "number_of_clerks",          label: "Commis",        color: "#355C7D", err: errors.number_of_clerks          },
            { name: "number_of_credit_officers", label: "Agents crédit", color: "#D4AF37", err: errors.number_of_credit_officers },
          ].map(({ name, label, color, err }) => (
            <div key={name}>
              <Label>{label} <span className="text-red-500">*</span></Label>
              <input
                type="number"
                name={name}
                value={(formData as any)[name] || 0}
                onChange={handleChange}
                min={0}
                disabled={isSubmitting}
                className={[
                  "w-full h-11 px-4 rounded-xl border-2 text-sm text-center font-semibold bg-[#F9F9F6] outline-none transition-colors",
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "",
                  err ? "border-red-400 ring-2 ring-red-200" : "border-gray-200",
                ].join(" ")}
                style={{ color }}
              />
              <FieldError msg={err} />
            </div>
          ))}

          {/* Total (lecture seule) */}
          <div>
            <Label>Total postes</Label>
            <input
              type="number"
              value={totalPosts}
              readOnly
              className="w-full h-11 px-4 rounded-xl border-2 border-gray-100 text-sm text-center font-bold text-gray-900 bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">Calculé auto.</p>
          </div>
        </div>
      </div>

      {/* ── Section 4 : Horaire d'ouverture ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Clock} label="Horaire d'ouverture" color="#D4AF37" />

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-semibold mb-0.5">Optionnel à la création</p>
            <p>
              Sélectionnez un horaire existant si disponible, ou laissez vide.
              Vous pourrez en assigner un depuis la page{" "}
              <span className="font-semibold">Horaires</span> après la création.
            </p>
          </div>
        </div>

        <OpeningHourAutocomplete
          selectedKey={formData.opening_hour || ""}
          onSelectionChange={(id) => {
            if (onOpeningHourChange) {
              onOpeningHourChange(id);
            } else {
              /* Fallback compatible handleChange */
              handleChange({
                target: { name: "opening_hour", value: id },
              } as React.ChangeEvent<HTMLSelectElement>);
            }
          }}
          errorMessage={errors.opening_hour}
          isDisabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default BranchFormFields;