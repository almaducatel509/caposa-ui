'use client'

import React, { useState } from 'react';
import Step1 from './_steppers/step-1'; // Step 1: Component for opening hours and holidays
import Step2 from './_steppers/step-2'; // Step 2: Component for branch information
import Step3 from './_steppers/step-3'; // Step 3: Completion step component
import { z, ZodError } from 'zod';
import { create } from '@/app/lib/create';
import { Button } from '@nextui-org/react';
import { step1Schema, step2Schema, step3Schema, FormData, ErrorMessages } from './validations';

const steps = [Step1, Step2, Step3];

const handleChangeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target;
  updateFormData({ opening_date: value });
};

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // State to store all form data for each step
  const [formData, setFormData] = useState<FormData | any>({
    // Step 1 data: Opening hours and holidays
    step1: {
      opening_hours: {
        sunday: '',   
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
      },
      holidays: [{ date: null, description: '' }] // List of holidays with date and description
    },
    // Step 2 data: Branch information
    step2: {
      branch_name: '',
      branch_address: '',
      branch_phone_number: '',
      branch_email: '',
      branch_manager_id: '',
      branch_code: '',
      number_of_posts: 0,
      number_of_tellers: 0,
      number_of_clerks: 0,
      number_of_credit_officers: 0,
      opening_date: null,
    },
    step3: {
      id: 'Step 3',
      name: 'Complete'
    },
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Function to validate each step based on the current step number
  const validateStep = (step: number): boolean => {
    let result: z.SafeParseReturnType<any, any>;
    switch (step) {
      case 0: // Validate Step 1 (opening hours and holidays)
        result = step1Schema.safeParse(formData.step1);
        break;
      case 1: // Validate Step 2 (branch info)
        result = step2Schema.safeParse(formData.step2);
        break;
      case 2: // Validate Step 3 (completion)
        result = step3Schema.safeParse(formData.step3);
        break;
      default:
        return false;
    }

    // Handle validation result
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
      setErrors(newErrors);
      return false;
    }
  };

  // Move to the next step if the current step is valid
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Move to the previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Submit the form after validating the final step
  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Combine all form data and send to the backend
      create({ ...formData?.step1, ...formData?.step2, ...formData?.step3 });
      console.log(formData);
    }
  };

  // Render the current step component dynamically
  const CurrentStepComponent = steps[currentStep];

  // Function to update form data dynamically based on the step
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
      {/* Step progress indicator */}
      <div className="flex flex-row space-x-8">
        {/* Step 1: Opening hours and holidays */}
        <div className="w-1/3 space-y-2">
          <hr className="border-t-4 border-green-600" />
          <p className="text-sm text-green-600 capitalize">Étape 1</p>
        </div>

        {/* Step 2: Branch information */}
        <div className="w-1/3 space-y-2">
          <hr className={`border-t-4 ${currentStep > 0 && "border-green-600"}`} />
          <p className={`text-sm capitalize ${currentStep > 0 ? "text-green-600" : "text-gray-600"}`}>Étape 2</p>
        </div>

        {/* Step 3: Finalization */}
        <div className="w-1/3 space-y-2">
          <hr className={`border-t-4 ${currentStep === 2 && "border-green-600"}`} />
          <p className={`text-sm capitalize ${currentStep === 2 ? "text-green-600" : "text-gray-600"}`}>Étape 3</p>
        </div>
      </div>

      {/* Render the current step form component */}
      <CurrentStepComponent
        formData={formData[`step${currentStep + 1}`]}
        setFormData={updateFormData}
        errors={errors}
        handleSubmit={handleSubmit}
        handleChangeDate={handleChangeDate} availableHolidays={[]}      />

      {/* Navigation buttons */}
      <hr className="border-t-2 border-gray-300 mt-4" />
      <div className='flex justify-between mt-8'>
        {/* Show "Previous" button if not on the first step */}
        {currentStep > 0 && (
          <Button className='bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2' onClick={handlePrevious}>
            Précédent
          </Button>
        )}

        {/* Show "Next" button if not on the last step, otherwise show "Submit" */}
        {currentStep < steps.length - 1 ? (
          <Button className='bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2' onClick={handleNext}>
            Suivant
          </Button>
        ) : (
          <Button className='bg-green-600 text-white' onClick={handleSubmit}>
            Envoyer
          </Button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
function updateFormData(arg0: { opening_date: string; }) {
  throw new Error('Function not implemented.');
}

