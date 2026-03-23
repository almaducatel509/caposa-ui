"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { openingHoursSchema, OpeningHours, ErrorMessages } from "./validations";
import { DAYS } from "./mock";

interface ScheduleFormProps {
  branchId: string;
  branchName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ScheduleForm({
  branchId, branchName, onSuccess, onCancel,
}: ScheduleFormProps) {
  const [fields, setFields] = useState<Record<string, string>>({
    monday: "08:00-17:00", tuesday: "08:00-17:00", wednesday: "08:00-17:00",
    thursday: "08:00-17:00", friday: "08:00-17:00", saturday: "", sunday: "",
  });
  const [errors, setErrors] = useState<ErrorMessages<OpeningHours>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const result = openingHoursSchema.safeParse({
      monday:    fields.monday,
      tuesday:   fields.tuesday,
      wednesday: fields.wednesday,
      thursday:  fields.thursday,
      friday:    fields.friday,
      saturday:  fields.saturday,
      sunday:    fields.sunday,
    });
    if (!result.success) {
      const errs: ErrorMessages<OpeningHours> = {};
      for (const issue of result.error.issues) {
        errs[issue.path[0] as keyof OpeningHours] = issue.message;
      }
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Creating schedule for branch:", branchId, fields);
      onSuccess();
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Créer un horaire régulier</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Aucun horaire n'a encore été défini pour{" "}
            <span className="font-semibold text-gray-700">{branchName}</span>.
          </p>
        </div>
      </div>

      {/* Days */}
      <div className="p-6 flex flex-col gap-3">
        {DAYS.map(({ key, label }) => {
          const isOptional = key === "saturday" || key === "sunday";
          const error = errors[key as keyof OpeningHours];
          return (
            <div key={key}>
              <div className="flex items-center gap-3">
                {/* Day label */}
                <div className="w-28 shrink-0">
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                  {isOptional && (
                    <span className="ml-1 text-xs text-gray-400">optionnel</span>
                  )}
                </div>

                {/* Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={fields[key]}
                    onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={isOptional ? "Fermé (laisser vide)" : "08:00-17:00"}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none
                      ${error
                        ? "border-red-400 ring-2 ring-red-200 text-red-700"
                        : "border-gray-300 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 text-gray-700"
                      }`}
                  />
                </div>

                {/* Clear button */}
                {fields[key] ? (
                  <button
                    onClick={() => setFields(f => ({ ...f, [key]: "" }))}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Marquer comme fermé"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-9" />
                )}
              </div>

              {/* Inline error */}
              {error && (
                <p className="ml-[7.25rem] mt-1 text-xs text-red-600">{error}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg
                     hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Création en cours…</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Créer l'horaire régulier</>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200
                     text-gray-700 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}