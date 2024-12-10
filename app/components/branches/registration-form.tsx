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
    const result = branchSchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      console.log("Erreurs de validation :", result.error);
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
    if (validateStep()) {
      try {
        const response = await createBranch(formData);
        console.log('Branch created successfully:', response);
        console.log('Selected opening hour ID:', formData.opening_hour);
      } catch (error) {
        console.error('Error creating branch:', error);
      }
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
