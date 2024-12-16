"use client";
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
import { Holiday, holidaySchema, ErrorMessages } from "./validations";
import Step1 from "./_steppers/step-1";
import Step2 from "./_steppers/step-2";
import Step3 from "./_steppers/step-3";
import { fetchHolydays, createHoliday } from "@/app/lib/api/holiday";
import { useRouter } from "next/navigation"; 

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ErrorMessages<Holiday>>({});
  const [existingHolidays, setExistingHolidays] = useState<Holiday[]>([]);
  const [formData, setFormData] = useState<Holiday>({
    date: "",
    description: "",
  });

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const holidays = await fetchHolydays();
        setExistingHolidays(holidays);
      } catch (error) {
        console.error("Erreur lors de la récupération des jours fériés :", error);
      }
    };

    loadHolidays();
  }, []);

  const isDuplicateHoliday = (newHoliday: Holiday): string | null => {
    const duplicate = existingHolidays.find(
      (holiday) =>
        holiday.date === newHoliday.date || holiday.description === newHoliday.description
    );

    if (duplicate) {
      return duplicate.date === newHoliday.date
        ? `Un jour férié pour la date ${newHoliday.date} existe déjà.`
        : `Un jour férié avec la description "${newHoliday.description}" existe déjà.`;
    }

    return null;
  };

  const validateStep = (): boolean => {
    const result = holidaySchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: ErrorMessages<Holiday> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length) {
          const key = error.path[0] as keyof Holiday;
          newErrors[key] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!validateStep()) {
      setIsSubmitting(false);
      return;
    }

    const duplicateMessage = isDuplicateHoliday(formData);
    if (duplicateMessage) {
      setApiError(duplicateMessage);
      onOpen(); // Open modal on error
      setIsSubmitting(false);
      return;
    }

    try {
      await createHoliday(formData);
      setSuccessMessage("Le jour férié a été créé avec succès !");
      onOpen(); // Open modal on success

      const updatedHolidays = await fetchHolydays();
      setExistingHolidays(updatedHolidays);
      setFormData({ date: "", description: "" });
    } catch (error) {
      setApiError("Une erreur est survenue lors de la création.");
      onOpen(); // Open modal on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCreateAnother = () => {
    setFormData({ date: "", description: "" });
    setApiError(null);
    setSuccessMessage(null);
    onClose(); // Close the modal
    setCurrentStep(0); // Reset to the first step
  };

  const CurrentStepComponent = steps[currentStep];

  return (
    <div>
      <CurrentStepComponent
        formData={formData}
        setFormData={(data) => setFormData({ ...formData, ...data })}
        errors={errors}
      />
      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <button
            className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
            onClick={handlePrevious}
          >
            Précédent
          </button>
        )}
        <button
          className={currentStep < steps.length - 1 ? "bg-green-600 text-white" : "bg-gray-400 text-white"}
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {currentStep < steps.length - 1 ? "Suivant" : "Soumettre"}
        </button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
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
                <Button color="primary" onPress={handleCreateAnother}>
                  Créer un autre
                </Button>
                  <Button color="success" onPress={() => router.push('/dashboard/holydays')}>
                  Voir tout
                </Button>
              </>
            ) : (
              <Button color="danger" onPress={onClose}>
                Fermer
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegisterForm;
