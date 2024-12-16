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
import Step1 from "./_steppers/step-1";
import Step2 from "./_steppers/step-2";
import Step3 from "./_steppers/step-3";
import { branchSchema, BranchData, ErrorMessages } from "./validations";
import { createBranch } from "@/app/lib/api/branche";
import { useRouter } from "next/navigation"; 

const steps = [Step1, Step2, Step3];

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BranchData>({
    branch_name: "",
    branch_address: "",
    branch_phone_number: "",
    branch_email: "",
    number_of_posts: 0,
    number_of_tellers: 0,
    number_of_clerks: 0,
    number_of_credit_officers: 0,
    opening_date: "",
    opening_hour: "",
    holidays: [],
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<ErrorMessages<BranchData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();

  const prepareFormData = (data: BranchData) => ({
    ...data,
    number_of_posts: Number(data.number_of_posts),
    number_of_tellers: Number(data.number_of_tellers),
    number_of_clerks: Number(data.number_of_clerks),
    number_of_credit_officers: Number(data.number_of_credit_officers),
  });

  const validateStep = (): boolean => {
    const dataToValidate = prepareFormData(formData);
    const result = branchSchema.safeParse(dataToValidate);

    if (!result.success) {
      const newErrors: ErrorMessages<BranchData> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length) {
          const key = error.path[0] as keyof BranchData;
          newErrors[key] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    setApiError(null);
    setIsSubmitting(true);

    if (!validateStep()) {
      setIsSubmitting(false);
      return;
    }

    const transformedData = prepareFormData(formData);

    try {
      await createBranch(transformedData);
      setSuccessMessage("La branche a été créée avec succès !");
      setApiError(null);
    } catch (error) {
      setApiError("Une erreur est survenue lors de la création de la branche.");
    } finally {
      setIsSubmitting(false);
      onOpen(); // Open the modal after submission
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
    setFormData({
      branch_name: "",
      branch_address: "",
      branch_phone_number: "",
      branch_email: "",
      number_of_posts: 0,
      number_of_tellers: 0,
      number_of_clerks: 0,
      number_of_credit_officers: 0,
      opening_date: "",
      opening_hour: "",
      holidays: [],
    });
    setApiError(null);
    setSuccessMessage(null);
    onClose(); // Close the modal
    setCurrentStep(0);
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
          <Button 
            color="secondary" 
            onClick={handlePrevious}
            className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
          >
            Précédent
          </Button>
        )}
        <Button
          className={currentStep < steps.length - 1 ? "bg-green-600 text-white" : "bg-gray-400 text-white"}
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {currentStep < steps.length - 1 ? "Suivant" : "Soumettre"}
        </Button>
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
                  <Button color="success" onPress={() => router.push('/dashboard/branches')}>
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
