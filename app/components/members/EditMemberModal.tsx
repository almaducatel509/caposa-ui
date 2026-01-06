"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FaEdit, FaPlus } from "react-icons/fa";

import {
  MemberData,
  MemberUiForm,
  FieldErrors,
  validateMemberUi,
  memberDataToUi,
  toMemberApiFormData,
} from "./validations";

import { updateMember, createMember } from "@/app/lib/api/members";
import MemberFormFields from "./MemberFormFields";
import { HAITI_DEPARTMENTS } from "@/app/data/haitiLocations";
import { Modal } from "../ui/Modal";

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: MemberData | null;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  member,
}) => {
  const isEditMode = !!member;
  const [errors, setErrors] = useState<FieldErrors<MemberUiForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<MemberUiForm>({
    first_name: "",
    last_name: "",
    id_number: "",
    phone_number: "",
    department_code: HAITI_DEPARTMENTS[0].code,
    city: "",
    address: "",
    gender: "F",
    date_of_birthday: "",
    email: "",
    initial_balance: undefined,
    photo_profil: null,
  });

  useEffect(() => {
    if (!isOpen) return;
    
    setIsLoading(true);
    setApiError(null);
    
    if (isEditMode && member) {
      const uiData = memberDataToUi(member);
      setFormData(uiData);
    } else {
      // Reset for create mode
      setFormData({
        first_name: "",
        last_name: "",
        id_number: "",
        phone_number: "",
        department_code: HAITI_DEPARTMENTS[0].code,
        city: "",
        address: "",
        gender: "F",
        date_of_birthday: "",
        email: "",
        initial_balance: undefined,
        photo_profil: null,
      });
    }
    
    setIsLoading(false);
  }, [isOpen, isEditMode, member]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    const result = validateMemberUi(formData);
    if (!result.data) {
      setErrors(result.errors || {});
      setIsSubmitting(false);
      return;
    }

    try {
      const fd = toMemberApiFormData(result.data, { includePhoto: true });

      if (isEditMode && member?.id_member) {
        await updateMember(member.id_member, fd);
      } else {
        await createMember(fd);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setApiError(
        `Error: ${error?.response?.status ?? ""} ${
          error?.response?.data
            ? JSON.stringify(error.response.data)
            : error?.message || "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormUpdate = (patch: Partial<MemberUiForm>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete (next as Record<string, string>)[k]);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/50">
            {isEditMode ? <FaEdit className="text-white" size={18} /> : <FaPlus className="text-white" size={18} />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">
                {isEditMode ? "Modifier Membre" : "Nouveau Membre"}
              </h3>
            </div>
            <p className="text-sm opacity-90 mt-1">
              {isEditMode && member
                ? `Mise à jour de ${member.first_name} ${member.last_name}`
                : "Enregistrer un nouveau membre"}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50">
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-red-700 font-medium">{apiError}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
          </div>
        ) : (
          <MemberFormFields
            formData={formData}
            setFormData={handleFormUpdate}
            errors={errors}
            setErrors={setErrors}
            isEditMode={isEditMode}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between rounded-b-2xl">
        <div className="text-sm text-gray-600">
          {isEditMode ? (
            <span>💡 Les modifications seront appliquées immédiatement</span>
          ) : (
            <span>💡 Tous les champs marqués * sont obligatoires</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="px-6 py-2.5 rounded-lg font-semibold bg-linear-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            {isSubmitting
              ? (isEditMode ? "Mise à jour..." : "Création...")
              : (isEditMode ? "Mettre à jour" : "Créer le membre")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditMemberModal;