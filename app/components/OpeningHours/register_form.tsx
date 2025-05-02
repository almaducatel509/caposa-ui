"use client";

import React, { useState, useEffect } from "react";
import {
  TimeInput,
  Button,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { OpeningHours, openingHoursSchema, ErrorMessages } from './validations';
import { createOpeningHours } from '@/app/lib/api/opening_hour';
import { useRouter } from "next/navigation";
import axios from "axios";
import type { TimeValue } from "@react-types/datepicker";
import { parseZonedDateTime } from "@internationalized/date";
import OpeningHoursSummary from './summary';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<OpeningHours>({
    monday: "08:00-17:00",
    tuesday: "08:00-17:00",
    wednesday: "08:00-17:00",
    thursday: "08:00-17:00",
    friday: "08:00-17:00",
  });

  const [closedDays, setClosedDays] = useState<{ [K in keyof OpeningHours]?: boolean }>({});
  const [errors, setErrors] = useState<ErrorMessages<OpeningHours>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;

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

  const handleClosedChange = (day: keyof OpeningHours, checked: boolean) => {
    setClosedDays((prev) => ({ ...prev, [day]: checked }));
    if (checked) {
      setFormData((prev) => ({ ...prev, [day]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [day]: "08:00-17:00" })); // default when reopened
    }
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

  const handleCreateAnother = () => {
    setFormData({
      monday: "08:00-17:00",
      tuesday: "08:00-17:00",
      wednesday: "08:00-17:00",
      thursday: "08:00-17:00",
      friday: "08:00-17:00",
    });
    setClosedDays({});
    setApiError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Horaire de Semaine</h2>
      <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-2 mb-2">
        <span>Jour</span>
        <span>Heure d'ouverture</span>
        <span>Heure de fermeture</span>
        <span>Fermé</span>
      </div>

      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
        const isWeekend = day === "saturday" || day === "sunday";

        return (
          <div key={day} className={`grid grid-cols-4 gap-4 mb-4 items-center px-2 ${isWeekend ? "bg-green-100 rounded" : ""}`}>
            <label className="capitalize">{day}</label>

            <TimeInput
              hideTimeZone
              isDisabled={isWeekend}
              value={
                day in formData
                  ? initializeTimeValue(formData[day as keyof OpeningHours], true)
                  : initializeTimeValue(undefined, true)
              }
              onChange={(value) => {
                if (!isWeekend) {
                  handleTimeChange(day as keyof OpeningHours, value, true);
                }
              }}
              className="w-40"
              classNames={{
                base: "bg-white",
                input: "bg-white text-black",
                inputWrapper: "bg-white border border-gray-300 rounded-sm",
              }}
              variant="bordered"
            />

            <TimeInput
              hideTimeZone
              isDisabled={isWeekend}
              value={
                day in formData
                  ? initializeTimeValue(formData[day as keyof OpeningHours], false)
                  : initializeTimeValue(undefined, false)
              }
              onChange={(value) => {
                if (!isWeekend) {
                  handleTimeChange(day as keyof OpeningHours, value, false);
                }
              }}
              className="w-40"
              classNames={{
                base: "bg-white",
                input: "bg-white text-black",
                inputWrapper: "bg-white border border-gray-300 rounded-sm",
              }}
              variant="bordered"
            />

            <Checkbox isSelected={isWeekend} isDisabled className="px-2"/>
          </div>
        );
      })}

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
          <>
            <ModalHeader>{successMessage ? "Succès!" : "Erreur!"}</ModalHeader>
            <ModalBody>
              {successMessage ? (
                <p>{successMessage}</p>
              ) : (
                <p className="text-red-500">{apiError}</p>
              )}
            </ModalBody>
            <ModalFooter>
              {successMessage ? (
                <>
                  <Button color="primary" onPress={handleCreateAnother}>Créer un autre</Button>
                  <Button color="success" onPress={() => router.push('/dashboard/opening_hours')}>Voir tout</Button>
                </>
              ) : (
                <Button color="danger" onPress={onClose}>Fermer</Button>
              )}
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegisterForm;
