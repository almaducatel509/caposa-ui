'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import { createEmployee, fetchEmployees } from '@/app/lib/api/employee';
import { employeeSchema, EmployeeFormData, ErrorMessages } from './validations';
import EmployeeForm from './EmployeeForm';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    first_name: '',
    last_name: '',
    date_of_birthday: '',
    phone_number: '',
    address: '',
    gender: '',
    payment_ref: '',
    photo_profil: undefined,
    branch: '',
    posts: [],
  });

  const [errors, setErrors] = useState<ErrorMessages<EmployeeFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingUsers, setExistingUsers] = useState<EmployeeFormData[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    fetchEmployees().then(setExistingUsers).catch(console.error);
  }, []);

  const validateForm = () => {
    const result = employeeSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ErrorMessages<EmployeeFormData> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof EmployeeFormData;
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

    const duplicate = existingUsers.find(
      (user) =>
        user.username === formData.username ||
        user.email === formData.email ||
        user.payment_ref === formData.payment_ref
    );

    if (duplicate) {
      setApiError("Ce nom d’utilisateur, email ou référence existe déjà.");
      onOpen();
      setIsSubmitting(false);
      return;
    }

    const dataToSend = {
      user: {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      },
      first_name: formData.first_name,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birthday,
      phone_number: formData.phone_number,
      address: formData.address,
      gender: formData.gender,
      payment_ref: formData.payment_ref,
      branch: formData.branch,
      posts: formData.posts,
      photo_profil: formData.photo_profil,
    };

    try {
      await createEmployee(dataToSend);
      setSuccessMessage("Employé créé avec succès !");
    } catch (error) {
      console.error("Erreur API:", error);
      setApiError("Une erreur est survenue lors de la création de l'employé.");
    } finally {
      onOpen();
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <EmployeeForm
        formData={formData}
        setFormData={(data) => setFormData((prev) => ({ ...prev, ...data }))}
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
            {successMessage ? (
              <p>{successMessage}</p>
            ) : (
              <p className="text-red-600">{apiError}</p>
            )}
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
