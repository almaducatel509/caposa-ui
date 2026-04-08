"use client";

import React, { useEffect, useState } from "react";
import { X, UserPlus, UserCog } from "lucide-react";
import {
  MemberData, MemberUiForm, FieldErrors,
  validateMemberUi, memberDataToUi, toMemberApiFormData,
} from "../validations";
import { updateMember, createMember } from "@/app/lib/api/members";
import MemberFormFields from "../MemberFormFields";
import { HAITI_DEPARTMENTS } from "@/app/data/haitiLocations";
import { Modal } from "../../ui/Modal";

interface EditMemberModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  member:    MemberData | null;
}

const EMPTY_FORM: MemberUiForm = {
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
  id_type: "autre",
  income_source: "autre",
  account_type: "savings",
  devise: "HTG",
  consent: true
};

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen, onClose, onSuccess, member,
}) => {
  const isEditMode = !!member;

  const [formData,     setFormData]     = useState<MemberUiForm>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<FieldErrors<MemberUiForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setApiError(null);
    setErrors({});
    setFormData(isEditMode && member ? memberDataToUi(member) : EMPTY_FORM);
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
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error?.message || "Une erreur est survenue."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormUpdate = (patch: Partial<MemberUiForm>) => {
    setFormData(prev => ({ ...prev, ...patch }));
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(patch).forEach(k => delete (next as any)[k]);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
          {isEditMode
            ? <UserCog  className="w-5 h-5 text-[#2E7D32]" />
            : <UserPlus className="w-5 h-5 text-[#2E7D32]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {isEditMode ? "Modifier le membre" : "Nouveau membre"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditMode && member
              ? `Mise à jour de ${member.first_name} ${member.last_name}`
              : "Enregistrer un nouveau membre"}
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50">
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {apiError}
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Chargement...</p>
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

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 rounded-b-2xl">
        <p className="text-xs text-gray-400">
          {isEditMode
            ? "Les modifications seront appliquées immédiatement"
            : "Tous les champs marqués * sont obligatoires"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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