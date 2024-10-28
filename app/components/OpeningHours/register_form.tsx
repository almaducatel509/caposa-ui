'use client'

import React, { useState } from 'react';
import { OpeningHours, openingHoursSchema, ErrorMessages } from './validations';
import { create } from '@/app/lib/create';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';
// import createOpeningHour from '@/actions';


type FormData = {
  [key: string]: OpeningHours; // Allow dynamic keys of type string, each holding OpeningHours structure
};

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    step1: {
      monday_open: "08:00",
      monday_close: "17:00",
      tuesday_open: "08:00",
      tuesday_close: "17:00",
      wednesday_open: "08:00",
      wednesday_close: "17:00",
      thursday_open: "08:00",
      thursday_close: "17:00",
      friday_open: "08:00",
      friday_close: "17:00",
      
    },
    step2: {
      monday_open: "08:00",
      monday_close: "17:00",
      tuesday_open: "08:00",
      tuesday_close: "17:00",
      wednesday_open: "08:00",
      wednesday_close: "17:00",
      thursday_open: "08:00",
      thursday_close: "17:00",
      friday_open: "08:00",
      friday_close: "17:00",
      
    },
    step3: {
      monday_open: "08:00",
      monday_close: "17:00",
      tuesday_open: "08:00",
      tuesday_close: "17:00",
      wednesday_open: "08:00",
      wednesday_close: "17:00",
      thursday_open: "08:00",
      thursday_close: "17:00",
      friday_open: "08:00",
      friday_close: "17:00",
      
    },
  });
  const [errors, setErrors] = useState<ErrorMessages<OpeningHours>>({});


  const updateFormData = (data: Partial<OpeningHours>) => {
    setFormData((prev) => ({
      ...prev,
      [`step${currentStep + 1}`]: {
        ...prev[`step${currentStep + 1}`],
        ...data,
      },
    }));
  };
  const validateStep = (): boolean => {
    const currentStepData = formData[`step${currentStep + 1}`];
  
    // Log the current data to ensure it has all fields
    console.log("Validating data for step:", currentStep + 1, "Data:", currentStepData);
  
    const result = openingHoursSchema.safeParse(currentStepData);
  
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
    console.log("Going back from step:", currentStep);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    console.log("Now at step:", currentStep - 1);
  };
  const CurrentStepComponent = steps[currentStep];

  return (
    <div>
      <CurrentStepComponent
        formData={formData[`step${currentStep + 1}`] as OpeningHours} // Type assertion to ensure type safety
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
            Soumetre
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
