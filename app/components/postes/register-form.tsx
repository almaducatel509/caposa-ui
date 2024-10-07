  'use client'

  import React, { useState } from 'react';
  import { Post, postSchema } from './validations';
  import { create } from '@/app/lib/create';
  import Step1 from './_steppers/step-1';
  import Step2 from './_steppers/step-2';
  import Step3 from './_steppers/step-3';

  const steps = [Step1, Step2, Step3];

  const RegisterForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
 
  
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const validateStep = (): boolean => {
      const result = postSchema.safeParse(formData);

      if (result.success) {
        setErrors({});
        return true;
      } else {
        const newErrors: Partial<Record<keyof Post, string>> = {};
        result.error.errors.forEach((error) => {
          if (error.path.length) {
            const key = error.path[0] as keyof Post;
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
        create(formData);
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
  };


    return (
      <div>
        <div className="flex flex-row space-x-8">
          <div className="w-1/3 space-y-2">
            <hr className="border-t-4 border-green-600" />
            <p className="text-sm text-green-600 capitalize">Step 1</p>
            <p className="text-gray-700">Post Details</p>
          </div>
          <div className="w-1/3 space-y-2">
            <hr className={`border-t-4 ${currentStep > 0 && 'border-green-600'}`} />
            <p className={`text-sm capitalize ${currentStep > 0 ? 'text-green-600' : 'text-gray-600'}`}>Step 2</p>
            <p className="text-gray-700">Review Details</p>
          </div>
          <div className="w-1/3 space-y-2">
            <hr className={`border-t-4 ${currentStep === 2 && 'border-green-600'}`} />
            <p className={`text-sm capitalize ${currentStep === 2 ? 'text-green-600' : 'text-gray-600'}`}>Step 3</p>
            <p className="text-gray-700">Finalize</p>
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
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              className="bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    );
  };

  export default RegisterForm;
