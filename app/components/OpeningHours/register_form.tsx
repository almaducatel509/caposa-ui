"use client";
import React, { useState } from 'react';
import { OpeningHours, openingHoursSchema, ErrorMessages } from './validations';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';
import { useEffect } from 'react';
import AxiosInstance from '@/app/lib/axiosInstance';


const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OpeningHours>({
    monday: "08:00-17:00",
    tuesday: "08:00-17:00",
    wednesday: "08:00-17:00",
    thursday: "08:00-17:00",
    friday: "08:00-17:00",
  });
  
  const [errors, setErrors] = useState<ErrorMessages<OpeningHours>>({});

  // useEffect pour débogage de formData
  useEffect(() => {
    console.log("formData mis à jour :", formData);
  }, [formData]);

  const updateFormData = (data: Partial<OpeningHours>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const validateStep = (): boolean => {
    console.log("Validating data for Step1:", formData);
    const result = openingHoursSchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      console.log("Validation errors:", result.error);
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
        formData={formData} 
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
