"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { FaEdit, FaPlus } from 'react-icons/fa';
import { MemberData, MemberFormData, ErrorMessages, memberDataToFormData } from './validations';
import { fetchBranches } from '@/app/lib/api/branche';
import { updateMember, createMember } from '@/app/lib/api/member';
import MemberFormFields from './MemberFormFields';

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

  const [formData, setFormData] = useState<MemberFormData>({
    first_name: '',
    last_name: '',
    id_number: '',
    phone_number: '',
    department: '',
    city: '',
    address: '',
    gender: '',
    date_of_birthday: '',
    photo_profil: null,
  });

  const [errors, setErrors] = useState<ErrorMessages<MemberFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && member) {
      const editFormData = memberDataToFormData(member);
      setFormData(editFormData);
    }
  }, [isOpen, member]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      if (isEditMode && member?.id) {
        await updateMember(member.id, formData);
      } else {
        await createMember(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setApiError(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormUpdate = (data: Partial<MemberFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setErrors(prev => {
      const updated = { ...prev };
      Object.keys(data).forEach(key => delete updated[key as keyof MemberFormData]);
      return updated;
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
            <h3 className="text-lg font-bold">
              {isEditMode ? 'Edit Member' : 'Create Member'}
            </h3>
            <p className="text-sm opacity-90">
              {isEditMode ? `Update ${member?.first_name} ${member?.last_name}` : 'Register a new member'}
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
            {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Create")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditMemberModal;
