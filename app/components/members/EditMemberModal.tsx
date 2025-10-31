"use client";

import React, { useEffect, useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button,
} from "@nextui-org/react";
import { FaEdit, FaPlus } from "react-icons/fa";

// ✅ Use the unified schema/types/helpers
import {
  MemberData,          // API read model
  MemberUiForm,        // UI form model (has department_code, etc.)
  FieldErrors,
  validateMemberUi,
  memberDataToUi,      // API -> UI
  toMemberApiFormData, // UI -> FormData (multipart) with optional photo
} from "./validations";

import { updateMember, createMember } from "@/app/lib/api/members";
import MemberFormFields from "./MemberFormFields";
import { HAITI_DEPARTMENTS } from "@/app/data/haitiLocations";

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
  // ✅ UI state matches Zod schema (department_code, etc.)
  const [formData, setFormData] = useState<MemberUiForm>({
    first_name: "",
    last_name: "",
    id_number: "",
    phone_number: "",
    department_code: HAITI_DEPARTMENTS[0].code, // "OUEST"
    city: "",
    address: "",
    gender: "F",
    date_of_birthday: "",
    email: "",
    initial_balance: undefined,
    photo_profil: null,
  });

  

  // ✅ Prefill when editing; reset when creating
  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && member) {
      setFormData(memberDataToUi(member));
      setErrors({});
      setApiError(null);
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        id_number: "",
        phone_number: "",
        department_code: HAITI_DEPARTMENTS[0].code, // e.g. "OUEST"
        city: "",
        address: "",
        gender: "F",
        date_of_birthday: "",
        email: "",
        initial_balance: undefined,
        photo_profil: null,
      });
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, isEditMode, member]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    // ✅ Zod validation
    const result = validateMemberUi(formData);
    if (!result.data) {
      setErrors(result.errors || {});
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ Build multipart FormData (includes photo if File is present)
      const fd = toMemberApiFormData(result.data, { includePhoto: true });

      if (isEditMode && member?.id) {
        await updateMember(member.id, fd); // PATCH/PUT in your API wrapper
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

  // ✅ Patch fields + clear their errors
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
    <Modal
      isDismissable={false}
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {isEditMode ? <FaEdit className="text-white" /> : <FaPlus className="text-white" />}
          </div>
          <div>
            <h3 className="text-lg font-bold">{isEditMode ? "Edit Member" : "Create Member"}</h3>
            <p className="text-sm opacity-90">
              {isEditMode
                ? `Update ${member?.first_name} ${member?.last_name}`
                : "Register a new member"}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="p-6">
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {apiError}
            </div>
          )}

          <MemberFormFields
            formData={formData}
            setFormData={handleFormUpdate}
            errors={errors}
            setErrors={setErrors}
            isEditMode={isEditMode}
            //disabled={isEditMode && field === 'id_number'} ou dois-je mettre ca?

          />
        </ModalBody>

        <ModalFooter className="bg-gray-50 border-t">
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-[#34963d] text-white hover:bg-[#1e7367]"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update"
              : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditMemberModal;
