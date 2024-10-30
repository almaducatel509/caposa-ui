"use client";
import React, { useState } from 'react';
import { Post, postSchema } from './validations';
import { create } from '@/app/lib/create';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Post>({
    name: "",
    description: "",
    deposit: false,
    withdrawal: false,
    transfer: false,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validateStep = (): boolean => {
    console.log("Validating data:", formData);
    const result = postSchema.safeParse(formData);
    if (result.success) {
      console.log("Validation succeeded.");
      setErrors({});
      return true;
    } else {
      console.log("Validation failed with errors:", result.error.errors);
      const newErrors: Partial<Record<keyof Post, string>> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length) {
          const key = error.path[0] as keyof Post;
          newErrors[key] = error.message;
          console.log(`Error in field "${key}":`, error.message);
        }
      });
      setErrors(newErrors);
      return false;
    }
  };
//'You must accept terms & conditions.'
  const handleNext = () => {
    console.log("Current step:", currentStep);
    if (validateStep()) {
      console.log("Validation passed for step", currentStep);
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log("Validation failed for step", currentStep);
    }
  };

  const handlePrevious = () => {
    console.log("Navigating back from step", currentStep);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    console.log("Submitting form data:", formData);
    if (validateStep()) {
      console.log("Final validation passed, submitting form.");
      create(formData);
      console.log('Form submitted successfully:', formData);
    } else {
      console.log("Final validation failed, form not submitted.");
    }
  };

  const updateFormData = (data: Partial<Post>) => {
    console.log("Updating form data:", data);
    setFormData((prev: Post) => ({
      ...prev,
      ...data,
    }));
  };

  const CurrentStepComponent = steps[currentStep];
  console.log("Rendering step:", currentStep);

  return (
    <div>
      <CurrentStepComponent
        formData={formData}
        setFormData={updateFormData}
        errors={errors}
      />
      <hr className="border-t-2 border-gray-300 mt-4" />
      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <button onClick={handlePrevious}>Previous</button>
        )}
        {currentStep < steps.length - 1 ? (
          <button onClick={handleNext}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
