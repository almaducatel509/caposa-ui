"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { X } from "lucide-react";
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

const EditHolidayModal: React.FC<EditHolidayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  holiday,
  isEditMode,
  mode = "create",
}) => {
  const [formData, setFormData] = useState<HolidayFormData>({
  id: "",
  date: "",
  description: "",
  type: "ferie",
  scope: "national",
});


  const [errors, setErrors] = useState<ErrorMessages<HolidayData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      if (isEditMode && holiday) {
        // Charger depuis API si nécessaire
        const holidayDataFromApi = holiday.id
          ? await getHolidayById(holiday.id)
          : holiday;

        setFormData({
          id: holiday.id,
          date: holiday.date,
          description: holiday.description,
          type: holiday.type,
          scope: holiday.scope,
          branch_code: holiday.branch_code ?? "",
          comment: holiday.comment ?? "",
        });

      } else {
        // Mode création
        setFormData({
          id: "",
          date: "",
          description: "",
          type: "ferie",
          scope: "national",
          branch_code: "",
          comment: "",
        });
      }

      setErrors({});
      setSuccessMessage(null);
    } catch (error) {
      console.error(error);
      setApiError("Impossible de charger les données du jour férié.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isOpen) {
    loadData();
  }
}, [isOpen, isEditMode, holiday]);


  const validate = () => {
    const result = holidaySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ErrorMessages<HolidayData> = {};
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof HolidayData;
        fieldErrors[key] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode && holiday?.id) {
        await updateHoliday(holiday.id, formData);
        setSuccessMessage("Jour férié modifié avec succès !");
      } else {
        await createHoliday(formData);
        setSuccessMessage("Jour férié créé avec succès !");
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setApiError(
        `Une erreur est survenue lors de ${
          isEditMode ? "la modification" : "la création"
        } du jour férié.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeDate = (date: string) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex justify-center items-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex justify-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
            <span className="text-emerald-600">Chargement...</span>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="bg-linear-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold">
          {isEditMode ? "Modifier le jour férié" : "Nouveau jour férié"}
        </h3>
        <p className="text-sm opacity-90 mt-1">
          {isEditMode
            ? "Apportez les changements nécessaires"
            : "Créer un nouveau jour férié"}
        </p>
      </div>

      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        {apiError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {apiError}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <HolidayFormFields
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleChangeDate={handleChangeDate}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          holiday={holiday}
          mode={mode}
        />

        {/* Informations additionnelles en mode édition */}
        {isEditMode && holiday?.id && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
            <p>
              <strong>ID:</strong> {holiday.id}
            </p>
            {holiday.created_at && (
              <p>
                <strong>Créé le:</strong>{" "}
                {new Date(holiday.created_at).toLocaleDateString("fr-FR")}
              </p>
            )}
            {holiday.updated_at && (
              <p>
                <strong>Modifié le:</strong>{" "}
                {new Date(holiday.updated_at).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.date.trim() || !formData.description.trim()}
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "En cours..." : isEditMode ? "Sauvegarder" : "Créer"}
        </button>
      </div>
    </Modal>
  );
};

export default EditHolidayModal;