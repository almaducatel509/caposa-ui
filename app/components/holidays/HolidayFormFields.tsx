"use client";

import React, { ChangeEvent } from "react";
import { CalendarDays, FileText, MapPin, MessageSquare, Tag, Globe } from "lucide-react";
import { HolidayData, ErrorMessages, HolidayFormData } from "./validations";
import { MOCK_BRANCHES } from "../OpeningHours/mock";

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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
      {children}
    </p>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#2E7D32]" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32]">{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

const formatDateFR = (s: string): string => {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const MONTHS = ["janvier","fevrier","mars","avril","mai","juin",
    "juillet","aout","septembre","octobre","novembre","decembre"];
  const [y, m, d] = s.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

const INPUT = "w-full px-4 py-2.5 rounded-xl border bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed";
const OK  = "border-gray-200 text-gray-700 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]";
const ERR = "border-red-400 ring-2 ring-red-200 text-red-700";

export default function HolidayFormFields({
  formData, errors, handleChange, handleChangeDate, isSubmitting,
}: HolidayFormFieldsProps) {
  const needsBranch = formData.scope === "branch";

  return (
    <div className="flex flex-col gap-4">

      {/* Section 1: Informations */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={CalendarDays} label="Informations du jour ferie" />
        <div className="flex flex-col gap-4">
          <div>
            <Label>Date du jour ferie</Label>
            <input type="date" id="holiday_date" name="date"
              value={formData.date}
              onChange={e => handleChangeDate(e.target.value)}
              disabled={isSubmitting}
              className={`${INPUT} ${errors.date ? ERR : OK}`}
            />
            {formData.date && !errors.date && (
              <p className="text-xs text-[#2E7D32] mt-1">{formatDateFR(formData.date)}</p>
            )}
            <FieldError msg={errors.date} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea id="description" name="description"
              value={formData.description ?? ""}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Decrivez ce jour ferie... (minimum 6 caracteres)"
              rows={3} maxLength={100}
              className={`${INPUT} ${errors.description ? ERR : OK} resize-none`}
            />
            <div className="flex items-start justify-between mt-1">
              <FieldError msg={errors.description} />
              <p className="text-xs text-gray-400 ml-auto">{formData.description?.length ?? 0} / 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Classification */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Tag} label="Classification" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <div className="relative">
              <select name="type" value={formData.type}
                onChange={handleChange as any} disabled={isSubmitting}
                className={`${INPUT} ${OK} appearance-none pr-9`}>
                <option value="ferie">Ferie national</option>
                <option value="local">Local</option>
                <option value="interne">Interne</option>
                <option value="election">Election</option>
                <option value="maintenance">Maintenance</option>
                <option value="autre">Autre</option>
              </select>
              <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <FieldError msg={errors.type} />
          </div>
          <div>
            <Label>Portee</Label>
            <div className="relative">
              <select name="scope" value={formData.scope}
                onChange={handleChange as any} disabled={isSubmitting}
                className={`${INPUT} ${OK} appearance-none pr-9`}>
                <option value="national">National</option>
                <option value="regional">Regional</option>
                <option value="branch">Succursale</option>
                <option value="autre">Autre</option>
              </select>
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <FieldError msg={errors.scope} />
          </div>
          {needsBranch && (
            <div className="md:col-span-2">
              <Label>Succursale concernee</Label>
              <div className="relative">
                <select name="branch_code" value={formData.branch_code ?? ""}
                  onChange={handleChange as any} disabled={isSubmitting}
                  className={`${INPUT} ${errors.branch_code ? ERR : OK} appearance-none pr-9`}>
                  <option value="">-- Selectionner une succursale --</option>
                  {MOCK_BRANCHES.map(b => (
                    <option key={b.branch_code} value={b.branch_code}>{b.branch_name}</option>
                  ))}
                </select>
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <FieldError msg={errors.branch_code} />
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Commentaire */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={MessageSquare} label="Commentaire" />
        <div>
          <Label>Commentaire <span className="text-gray-400 normal-case font-normal">optionnel</span></Label>
          <textarea name="comment" value={formData.comment ?? ""}
            onChange={handleChange} disabled={isSubmitting}
            rows={3} maxLength={500}
            placeholder="Observations, contexte, informations complementaires..."
            className={`${INPUT} ${errors.comment ? ERR : OK} resize-none`}
          />
          <div className="flex items-start justify-between mt-1">
            <FieldError msg={errors.comment} />
            <p className="text-xs text-gray-400 ml-auto">{formData.comment?.length ?? 0} / 500</p>
          </div>
        </div>
      </div>

    </div>
  );
}