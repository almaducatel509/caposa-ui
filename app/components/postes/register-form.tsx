"use client";
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
import { Post, postSchema } from "./validations";
import { createPost } from "@/app/lib/api/post"; // Ensure this path is correct
import Step1 from "./_steppers/step-1";
import Step2 from "./_steppers/step-2";
import Step3 from "./_steppers/step-3";
import { useRouter } from "next/navigation";

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Post>({
    name: "",
    description: "",
    deposit: false,
    withdrawal: false,
    transfer: false,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();

  const validateStep = (): boolean => {
    const result = postSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Partial<Record<keyof Post, string>> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length) {
          const key = error.path[0] as keyof Post;
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

    try {
      await createPost(formData);
      setSuccessMessage("Post créé avec succès !");
      onOpen(); // Open success modal
    } catch (error) {
      setApiError("Une erreur est survenue lors de la création du post.");
      onOpen(); // Open error modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === steps.length - 1) {
        handleSubmit(); // Submit at the last step
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCreateAnother = () => {
    setFormData({
      name: "",
      description: "",
      deposit: false,
      withdrawal: false,
      transfer: false,
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
            onClick={handlePrevious}
          >
            Précédent
          </button>
        )}
        <button
          className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {currentStep < steps.length - 1 ? "Suivant" : "Soumettre"}
        </button>
      </div>

      {/* Modal */}
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
                  <Button color="success" onPress={() => router.push('/dashboard/postes')}>
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
