'use client'

import React, { useState } from 'react';
import { Holiday, holidaySchema } from './validations';
import { create } from '@/app/lib/create';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';

type FormData = {
  step1: Holiday;
  step2: Holiday;
  step3: Holiday;
};

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
const [formData, setFormData] = useState({
  step1: { date: new Date().toISOString(), description: '' },
  step2: { date: new Date().toISOString(), description: '' },
  step3: { date: new Date().toISOString(), description: '' },
});
  const [errors, setErrors] = useState<Partial<Record<number, string>>>({});

  const validateStep = (): boolean => {
    const result = holidaySchema.safeParse(formData[`step${currentStep + 1}` as keyof FormData]);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Partial<Record<number, string>> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length) {
          const key = error.path[0] as keyof Holiday;
          newErrors[currentStep] = error.message;
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
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep()) {
      create(formData);
      console.log('Form submitted successfully:', formData);
    }
  };

  const CurrentStepComponent = steps[currentStep] as unknown as React.FC<{
    formData: Holiday;
    setFormData: (data: Partial<Holiday>, index: number) => void;
    errors: Partial<Record<number, string>>;
  }>;

  const updateFormData = (data: Partial<Holiday>, index: number) => {
    setFormData((prev) => {
      const updatedData = { ...prev };
      updatedData[`step${index + 1}` as keyof FormData] = { ...updatedData[`step${index + 1}` as keyof FormData], ...data };
      return updatedData;
    });
  };

  return (
    <div>
      <div className="flex flex-row space-x-8">
        <div className="w-1/3 space-y-2">
          <hr className="border-t-4 border-green-600" />
          <p className="text-sm text-green-600 capitalize">étape 1</p>
        </div>
        <div className="w-1/3 space-y-2">
          <hr className={`border-t-4 ${currentStep > 0 && 'border-green-600'}`} />
          <p className={`text-sm capitalize ${currentStep > 0 ? 'text-green-600' : 'text-gray-600'}`}>étape 2</p>
        </div>
        <div className="w-1/3 space-y-2">
          <hr className={`border-t-4 ${currentStep === 2 && 'border-green-600'}`} />
          <p className={`text-sm capitalize ${currentStep === 2 ? 'text-green-600' : 'text-gray-600'}`}>étape 3</p>
        </div>
      </div>
      <CurrentStepComponent
          formData={formData[`step${currentStep + 1}`]}
          setFormData={updateFormData}
        errors={errors}
      />
      <hr className="border-t-2 border-gray-300 mt-4" />
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
          <button
            className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
            onClick={handleSubmit}
          >
            Soumettre
          </button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
