"use client";
import React, { useState } from 'react';
import { Post, postSchema } from './validations';
import { createPost } from '@/app/lib/api/post'; // Assurez-vous que le chemin est correct
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

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        const response = await createPost(formData); // Utilisation de createPost ici
        console.log('Post créé avec succès:', response);
      } catch (error) {
        console.error("Erreur lors de la création du post:", error);
      }
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
            Fin
          </button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
