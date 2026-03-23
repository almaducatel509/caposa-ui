"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { X, CalendarDays, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { HolidayData, holidaySchema, ErrorMessages, HolidayFormData } from "./validations";
import { updateHoliday, createHoliday, getHolidayById } from "@/app/lib/api/holiday";
import HolidayFormFields from "./HolidayFormFields";

interface EditHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holiday: HolidayData | null;
  isEditMode: boolean;
  mode?: "create" | "edit";
}

const EMPTY_FORM: HolidayFormData = {
  id: "", date: "", description: "",
  type: "ferie", scope: "national",
  branch_code: "", comment: "",
};

export default function EditHolidayModal({
  isOpen, onClose, onSuccess, holiday, isEditMode, mode = "create",
}: EditHolidayModalProps) {
  const [formData, setFormData]         = useState<HolidayFormData>(EMPTY_FORM);
  const [errors, setErrors]             = useState<ErrorMessages<HolidayData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [apiError, setApiError]         = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setIsLoading(true);
      setApiError(null);
      setErrors({});
      setSuccessMessage(null);
      try {
        if (isEditMode && holiday) {
          // Tente le fetch API, sinon utilise les donnees locales
          try { await getHolidayById(holiday.id); } catch {}
          setFormData({
            id: holiday.id, date: holiday.date,
            description: holiday.description, type: holiday.type,
            scope: holiday.scope, branch_code: holiday.branch_code ?? "",
            comment: holiday.comment ?? "",
          });
        } else {
          setFormData(EMPTY_FORM);
        }
      } catch {
        setApiError("Impossible de charger les donnees du jour ferie.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen, isEditMode, holiday]);

  const validate = (): boolean => {
    const result = holidaySchema.safeParse(formData);
    if (!result.success) {
      const errs: ErrorMessages<HolidayData> = {};
      result.error.errors.forEach(e => { errs[e.path[0] as keyof HolidayData] = e.message; });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (isEditMode && holiday?.id) {
        await updateHoliday(holiday.id, formData);
        setSuccessMessage("Jour ferie modifie avec succes !");
      } else {
        await createHoliday(formData);
        setSuccessMessage("Jour ferie cree avec succes !");
      }
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch {
      setApiError(`Erreur lors de ${isEditMode ? "la modification" : "la creation"} du jour ferie.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeDate = (date: string) =>
    setFormData(prev => ({ ...prev, date }));

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-16 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Chargement...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">

      {/* Header — style LoanForm : blanc sobre, icone + titre a gauche */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {isEditMode ? "Modifier le jour ferie" : "Nouveau jour ferie"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditMode ? "Apportez les changements necessaires" : "Remplissez les informations du jour ferie"}
          </p>
        </div>
        <button onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        {apiError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}
        {successMessage && (
          <div className="flex items-start gap-3 px-4 py-3 bg-[#DDEAD5] rounded-xl border border-[#2E7D32]/20">
            <CheckCircle className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-[#1B5E20]">{successMessage}</p>
          </div>
        )}

        <HolidayFormFields
          formData={formData}
          errors={errors}
          handleChange={handleChange as any}
          handleChangeDate={handleChangeDate}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          holiday={holiday}
          mode={mode}
        />

        {isEditMode && holiday?.id && (
          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 flex flex-col gap-1">
            <p><span className="font-semibold text-gray-600">ID :</span> {holiday.id}</p>
            {holiday.created_at && (
              <p><span className="font-semibold text-gray-600">Cree le :</span>{" "}
                {new Date(holiday.created_at).toLocaleDateString("fr-FR")}</p>
            )}
            {holiday.updated_at && (
              <p><span className="font-semibold text-gray-600">Modifie le :</span>{" "}
                {new Date(holiday.updated_at).toLocaleDateString("fr-FR")}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose} disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200
                     text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">
          Annuler
        </button>
        <button onClick={handleSubmit}
          disabled={isSubmitting || !formData.date.trim() || !formData.description.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                     bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white
                     shadow-md hover:shadow-lg transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> En cours...</>
          ) : isEditMode ? (
            <><CheckCircle className="w-4 h-4" /> Sauvegarder</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Creer</>
          )}
        </button>
      </div>

    </Modal>
  );
}