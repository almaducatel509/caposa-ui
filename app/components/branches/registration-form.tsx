'use client';
import React, { useState } from 'react';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';
import { Button } from '@nextui-org/react';
import { branchSchema, BranchData, ErrorMessages } from './validations';
import { createBranch } from '@/app/lib/api/branche';

const steps = [Step1, Step2, Step3];

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BranchData>({
    branch_name: '',
    branch_address: '',
    branch_phone_number: '',
    branch_email: '',
    number_of_posts: 0,
    number_of_tellers: 0,
    number_of_clerks: 0,
    number_of_credit_officers: 0,
    opening_date: '',
    opening_hour: '',
    holidays: [],
  });

  const [errors, setErrors] = useState<ErrorMessages<BranchData>>({});

  const validateStep = (): boolean => {
    console.log("Validation des données pour l'étape :", currentStep + 1);
    console.log("FormData avant validation :", formData);

    const result = branchSchema.safeParse(formData);

    if (!result.success) {
      // Étape 4 : Log des erreurs brutes retournées par Zod
      console.log("Erreurs brutes de validation Zod :", result.error.errors);
  
      const newErrors: ErrorMessages<BranchData> = {};
      result.error.errors.forEach((error) => {
        // Étape 5 : Log chaque erreur individuellement pour vérifier sa transformation
        console.log("Erreur Zod transformée :", error);
  
        if (error.path.length) {
          const key = error.path[0] as keyof BranchData;
          newErrors[key] = error.message;
        }
      });
  
      // Étape 6 : Log des erreurs finales assignées à l'état
      console.log("Erreurs après transformation :", newErrors);
      setErrors(newErrors); // Affiche les erreurs
      return false; // Validation échouée
    }
  
    // Étape 7 : Validation réussie, réinitialisez les erreurs
    console.log("Validation réussie : aucune erreur détectée.");
    setErrors({});
    return true; // Validation réussie
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const result = branchSchema.safeParse(formData);
    if (!result.success) {
      console.log("Validation errors:", result.error.errors);
      return; // Stopper l'envoi en cas d'erreurs
    }
  
    // Envoi des données validées
    const transformedData = {
      ...formData,
      number_of_posts: Number(formData.number_of_posts),
      number_of_tellers: Number(formData.number_of_tellers),
      number_of_clerks: Number(formData.number_of_clerks),
      number_of_credit_officers: Number(formData.number_of_credit_officers),
      holidays: formData.holidays,
    };
  
    try {
      console.log('Envoi des données :', transformedData);
      const response = await createBranch(transformedData);
      console.log('Réponse API :', response);
    } catch (error) {
      console.error('Erreur lors de la création :', error);
    }
  };   

  const updateFormData = (data: Partial<BranchData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const CurrentStepComponent = steps[currentStep];

  return (
    <div>
      <CurrentStepComponent
        formData={formData} 
        setFormData={updateFormData}
        errors={errors}
      />
      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <Button
            className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
            onClick={handlePrevious}
          >
            Précédent
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button
            className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
            onClick={handleNext}
          >
            Suivant
          </Button>
        ) : (
          <Button className="bg-green-600 text-white" onClick={handleSubmit}>
            Fin
          </Button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
