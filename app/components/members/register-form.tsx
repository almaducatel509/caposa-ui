'use client';
import React, { useState, useEffect } from 'react';
import { z, ZodError } from 'zod';
import { create } from '@/app/lib/create';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { createMembers } from '@/app/lib/api/member';
import { memberSchema, MemberFormData, ErrorMessages } from './validations';
import MemberForm from './MemberForm';

const RegisterForm = () => {
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: '',
    last_name: '',
    gender: 'F',
    date_of_birthday: '',
    photo_profil: undefined,
    address: '',
    id_number: '',
    phone_number: '',
    city: '',
    department: '',
    email: '',
    password: '',
    confirm_password: '',
    account_type: '',
    account_number: '',
    initial_balance: 0,
    membership_tier: '',
    monthly_income: undefined,
    monthly_expenses: undefined,
    income_source: '',
  });

  const [errors, setErrors] = useState<ErrorMessages<MemberFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const validateForm = () => {
    const result = memberSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ErrorMessages<MemberFormData> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof MemberFormData;
        fieldErrors[key] = err.message;
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

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await createMembers(formData);
      setSuccessMessage("Membre créé avec succès !");
    } catch (error) {
      console.error("Erreur API:", error);
      setApiError("Une erreur est survenue lors de la création du membre.");
    } finally {
      onOpen();
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <MemberForm
        formData={formData}
        setFormData={(data:any) => setFormData((prev) => ({ ...prev, ...data }))}
        errors={errors}
        setErrors={setErrors}
      />
      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit} color="primary" isLoading={isSubmitting}>
          Enregistrer
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>{successMessage ? 'Succès' : 'Erreur'}</ModalHeader>
          <ModalBody>
            {successMessage ? <p>{successMessage}</p> : <p className="text-red-600">{apiError}</p>}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
export default RegisterForm;
