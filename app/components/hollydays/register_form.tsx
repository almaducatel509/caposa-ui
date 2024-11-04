'use client';
import React, { useState, useEffect } from 'react';
import { Holiday, holidaySchema, ErrorMessages } from './validations';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // Définition de formData pour Holiday
  const [formData, setFormData] = useState<Holiday>({
    holyday_date: '',
    holyday_description: '',
  });
  console.log("Type de formData dans RegisterForm :", Array.isArray(formData) ? "Tableau" : "Objet");

  const [errors, setErrors] = useState<ErrorMessages<Holiday>>({});

  // useEffect pour surveiller formData pour débogage
  useEffect(() => {
    console.log("formData mis à jour :", formData);
  }, [formData]);

  const updateFormData = (data: Partial<Holiday>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const validateStep = (): boolean => {
    console.log("Validation des données pour l'étape :", currentStep + 1);
    const result = holidaySchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      console.log("Erreurs de validation :", result.error);
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

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const CurrentStepComponent = steps[currentStep];

  return (
    <div>
      <CurrentStepComponent
        formData={formData} // Passe directement formData ici
        setFormData={updateFormData}
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
        {currentStep < steps.length - 1 ? (
          <button
            className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
            onClick={handleNext}
          >
            Suivant
          </button>
        ) : (
          <button className="bg-green-600 text-white" onClick={() => console.log('Données enregistrées')}>
            Fin
          </button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
