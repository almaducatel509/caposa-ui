'use client'

import React, { useState } from 'react';
import { OpeningHours, openingHoursSchema } from './validations';
import { create } from '@/app/lib/create';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';
// import createOpeningHour from '@/actions';
type FormData = {
  [key: string]: OpeningHours;
};
const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    step1: {
      monday_open: "",
      monday_close: "",
      tuesday_open: "",
      tuesday_close: "",
      wednesday_open: "",
      wednesday_close: "",
      thursday_open: "",
      thursday_close: "",
      friday_open: "",
      friday_close: "",
      saturday_open: "",
      saturday_close: "",
      sunday_open: "",
      sunday_close: ""
    },
    step2: {
        monday_open: "",
        monday_close: "",
        tuesday_open: "",
        tuesday_close: "",
        wednesday_open: "",
        wednesday_close: "",
        thursday_open: "",
        thursday_close: "",
        friday_open: "",
        friday_close: "",
        saturday_open: "",
        saturday_close: "",
        sunday_open: "",
        sunday_close: ""
      },
   
  });
  const [errors, setErrors] = useState<Partial<OpeningHours>>({});

  const validateStep = (): boolean => {
    const result = openingHoursSchema.safeParse(formData[`step${currentStep + 1}`]);

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
      create(formData[`step${currentStep + 1}`]);
      console.log('Form submitted successfully:', formData);
    }
  };

  const CurrentStepComponent = steps[currentStep];
  const updateFormData = (data: Partial<any>) => {
    setFormData((prev: any) => ({
        ...prev,
        [`step${currentStep + 1}`]: {
            ...prev[`step${currentStep + 1}`],
            ...data,
        },
    }));
}

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
          <button className="bg-green-600 text-white" onClick={handleSubmit}>
            Envoyer
          </button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
