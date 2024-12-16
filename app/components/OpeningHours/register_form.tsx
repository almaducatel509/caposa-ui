"use client"
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { OpeningHours, openingHoursSchema, ErrorMessages } from './validations';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';
import { createOpeningHours } from '@/app/lib/api/opening_hour';
import { useRouter } from "next/navigation"; 
import axios from "axios";

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<ErrorMessages<OpeningHours>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OpeningHours>({
    monday: "08:00-17:00",
    tuesday: "08:00-17:00",
    wednesday: "08:00-17:00",
    thursday: "08:00-17:00",
    friday: "08:00-17:00",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const validateStep = (): boolean => {
    const result = openingHoursSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Partial<OpeningHours> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length) {
          const key = error.path[0] as keyof OpeningHours;
          newErrors[key] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    setApiError(null);
    setIsSubmitting(true);

    if (!validateStep()) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Données envoyées :", formData);
      await createOpeningHours(formData);
      setSuccessMessage("Horaires créés avec succès !");
      setApiError(null);
      onOpen(); // Open modal
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(error.response?.data?.detail || "Une erreur est survenue.");
      } else {
        setApiError("Erreur inconnue.");
      }
      onOpen(); // Open modal for error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep === steps.length - 1) {
      handleSubmit(); // Submit at the last step
    } else {
      setCurrentStep((prev) => prev + 1);
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
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          >
            Précédent
          </button>
        )}
        <button
          className={`${
            isSubmitting ? "cursor-not-allowed opacity-50" : ""
          } bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2`}
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {currentStep < steps.length - 1 ? "Suivant" : "Soumettre"}
        </button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onClose}>
        <ModalContent>
          <>
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
              {successMessage && (
                <>
                  <Button color="primary" onPress={handleCreateAnother}>
                    Créer un autre
                  </Button>
                  <Button color="success" onPress={() => router.push('/dashboard/opening_hours')}>
                    Voir tout
                  </Button>
                </>
              )}
              {!successMessage && (
                <Button color="danger" onPress={onClose}>
                  Fermer
                </Button>
              )}
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegisterForm;
