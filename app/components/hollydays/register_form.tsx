'use client'
import React, { useState } from 'react';
import { Holiday, holidaySchema, ErrorMessages } from './validations';
import { create } from '@/app/lib/create';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';
import { z, ZodError } from 'zod';

const steps = [Step1, Step2, Step3];

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState<FormData | any>({
  step1: { holyday_date: '', holyday_description: '' },
  step2: { holyday_date: '', holyday_description: '' },
  step3: { holyday_date: '', holyday_description: '' },
});
const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  
// Validation des étapes
const validateStep = (step: number): boolean => {
  console.log(`Validation de l'étape ${step + 1} avec les données :`, formData[`step${step + 1}`]);

  let result: z.SafeParseReturnType<any, any>;
  switch (step) {
      case 0:
          result = holidaySchema.safeParse(formData.step1);
          console.log('the result:',result);
          break;
      case 1:
          result = holidaySchema.safeParse(formData.step2);
          break;
      case 2:
          result = holidaySchema.safeParse(formData.step3);
          break;
      default:
          return false;
  }

  if (result.success) {
      setErrors({});
      return true;
  } else {
      const newErrors: ErrorMessages<any> = {};
      result.error.errors.forEach((error) => {
          if (error.path.length) {
              const key = error.path[0] as string;
              newErrors[key] = error.message;
          }
      });
       console.log(newErrors)
      setErrors(newErrors);
      return false;
  }
};

  // Navigation entre les étapes
const handleNext = () => {
  console.log(formData)
  if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
  }
};


const handlePrevious = () => {
  setCurrentStep((prev) => prev - 1);
};

const handleSubmit = () => {
  if (validateStep(currentStep)) {
      create({ ...formData?.step1, ...formData?.step2, ...formData?.step3 });
      console.log(formData);
  }
};

const CurrentStepComponent = steps[currentStep];

  // Mise à jour des données du formulaire
const updateFormData = (data: Partial<any>) => {
  setFormData((prev: any) => ({
      ...prev,
      [`step${currentStep + 1}`]: {
          ...prev[`step${currentStep + 1}`],
          ...data,
      },
  }));
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
