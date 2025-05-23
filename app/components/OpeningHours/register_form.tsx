'use client';

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { OpeningHours, openingHoursSchema, ErrorMessages, } from './validations';
import { TimeInput } from "@nextui-org/react";
import { createOpeningHours } from '@/app/lib/api/opening_hour';
import { useRouter } from "next/navigation"; 
import axios from "axios";
import type { TimeValue } from "@react-types/datepicker";
import { parseZonedDateTime } from "@internationalized/date";
import dynamic from 'next/dynamic';

interface RegisterFormProps {
  initialData?: any;
  isEditMode?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RegisterForm = ({ 
  initialData,
  isEditMode = false,
  onSuccess,
  onCancel
}: RegisterFormProps) => {
  // ✅ TOUS les hooks D'ABORD
  const [formData, setFormData] = useState<OpeningHours>({
    monday: "08:00-17:00",
    tuesday: "08:00-17:00",
    wednesday: "08:00-17:00",
    thursday: "08:00-17:00",
    friday: "08:00-17:00",
  });

  const [errors, setErrors] = useState<ErrorMessages<OpeningHours>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setIsClient(true), []);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (isEditMode && initialData) {
      const cleanData = {
        ...initialData,
        saturday: initialData.saturday || '',
        sunday: initialData.sunday || ''
      };
      setFormData(cleanData);
    }
  }, [isEditMode, initialData]);
  const initializeTimeValue = (timeString: string | undefined, isOpen: boolean): TimeValue => {
    if (timeString) {
      const timePart = isOpen ? timeString.split('-')[0] : timeString.split('-')[1];
      return parseZonedDateTime(`2024-01-01T${timePart}:00[UTC]`);
    } else {
      return parseZonedDateTime("2024-01-01T08:00:00[UTC]");
    }
  };

  const handleTimeChange = (day: keyof OpeningHours, value: TimeValue, isOpen: boolean) => {
    const formattedTime = `${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}`;
    const currentTimes = formData[day] || "08:00-17:00";
    const [currentOpen, currentClose] = currentTimes.split('-');
    const newTime = isOpen ? `${formattedTime}-${currentClose}` : `${currentOpen}-${formattedTime}`;
    setFormData({ ...formData, [day]: newTime });
  };

  const validate = () => {
    const result = openingHoursSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    }

    const newErrors: Partial<OpeningHours> = {};
    result.error.errors.forEach((e) => {
      const key = e.path[0] as keyof OpeningHours;
      newErrors[key] = e.message;
    });

    setErrors(newErrors);
    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await createOpeningHours(formData);
      setSuccessMessage("Horaires créés avec succès !");
      onOpen();
      onSuccess && onSuccess();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail || "Une erreur est survenue."
        : "Erreur inconnue.";
      setApiError(message);
      onOpen();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div>
        {(["monday", "tuesday", "wednesday", "thursday", "friday"] as Array<keyof OpeningHours>).map((day) => (
          <div key={day} className="mb-4">
            <label className="block font-semibold mb-2">{day.charAt(0).toUpperCase() + day.slice(1)}: </label>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <TimeInput
                  label="Open Time"
                  hideTimeZone
                  value={initializeTimeValue(formData[day], true)}
                  onChange={(value) => handleTimeChange(day, value, true)}
                  className="w-64"
                />
                {errors[day] && <span className="text-red-500">{errors[day]}</span>}
              </div>
              <div className="w-1/2">
                <TimeInput
                  label="Close Time"
                  hideTimeZone
                  value={initializeTimeValue(formData[day], false)}
                  onChange={(value) => handleTimeChange(day, value, false)}
                  className="w-64"
                />
                {errors[day] && <span className="text-red-500">{errors[day]}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button
          className="bg-green-600 text-white"
          onClick={handleSubmit}
          isDisabled={isSubmitting}
        >
          {isSubmitting ? "Envoi..." : "Soumettre"}
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onClose}>
        <ModalContent>
          <div>
            <ModalHeader>
              {successMessage ? "Succès!" : "Erreur!"}
            </ModalHeader>
            <ModalBody>
              {successMessage ? (
                <p>{successMessage}</p>
              ) : (
                <p className="text-red-500">{apiError}</p>
              )}
            </ModalBody>
            <ModalFooter>
              {successMessage ? (
                <div>
                  <Button color="primary" onPress={onCancel}   aria-label="Ajouter un élément">Créer un autre</Button>
                  <Button aria-label="Voir tout" color="success" onPress={() => router.push('/dashboard/opening_hours')}>
                    Voir tout
                  </Button>
                </div>
              ) : (
                <Button color="danger" aria-label="Fermer la page." onPress={onClose}>Fermer</Button>
              )}
            </ModalFooter>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default dynamic(() => Promise.resolve(RegisterForm), { ssr: false });
