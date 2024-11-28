'use client';
import React, { useState } from 'react';
import Step1 from './_steppers/step-1';
import Step2 from './_steppers/step-2';
import Step3 from './_steppers/step-3';
import { z, ZodError } from 'zod';
import { create } from '@/app/lib/create';
import { Button } from '@nextui-org/react';
import { step1Schema, step2Schema, step3Schema, FormData, ErrorMessages } from './validations';
import { createMembers } from '@/app/lib/api/member';

const steps = [Step1, Step2, Step3];

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState<FormData | any>({
    step1: {
      first_name: '',
      last_name: '',
      gender: '',
      date_of_birthday: null,
      photo_url: null,
      address: '',
      id_number: '',
      phone_number: '',
      city: '',
      department: '',
      email: '',
    },
    step2: {
      password: '',
      confirm_password: '',
      account_type: '',
      account_number: '',
      initial_balance: 0,
      membership_tier: '',
      monthly_income: 0,
      monthly_expenses: 0,
      income_source: 0,
    },
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validateStep = (step: number): boolean => {
    let result: z.SafeParseReturnType<any, any>;
    switch (step) {
      case 0:
        result = step1Schema.safeParse(formData.step1);
        console.log('step1: ', formData);
        break;
      case 1:
        result = step2Schema.safeParse(formData.step2);
        console.log('step2: ', formData);
        break;
      case 2:
        result = step3Schema.safeParse(formData.step3);
        console.log('le step3: ', formData);
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
      console.log(newErrors);
      setErrors(newErrors);
      return false;
    }
  };

  const handleNext = () => {
    console.log('Next: ', formData);
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const totalSteps = 3;
    let allValid = true;
  
    for (let step = 0; step < totalSteps; step++) {
      if (!validateStep(step)) {
        allValid = false;
        break;
      }
    }
  
    if (allValid) {
      // Préparation du payload
      const payload = {
        first_name: formData.step1.first_name,
        last_name: formData.step1.last_name,
        gender: formData.step1.gender,
        date_of_birthday: formData.step1.date_of_birthday,
        photo_url: formData.step1.photo_url,
        address: formData.step1.address,
        id_number: formData.step1.id_number,
        phone_number: formData.step1.phone_number,
        city: formData.step1.city,
        department: formData.step1.department,
        email: formData.step1.email,
        // Ajout des données de step2 si nécessaire
        password: formData.step2.password,
        confirm_password: formData.step2.confirm_password,
        account_type: formData.step2.account_type,
        account_number: formData.step2.account_number,
        initial_balance: formData.step2.initial_balance,
        membership_tier: formData.step2.membership_tier,
        monthly_income: formData.step2.monthly_income,
        monthly_expenses: formData.step2.monthly_expenses,
        income_source: formData.step2.income_source
      };
  
      console.log('Payload envoyé:', payload);
  
      try {
        const response = await createMembers(payload);
        console.log('Membre créé avec succès:', response);
      } catch (error) {
        console.error("Erreur lors de la création du membre:", error);
      }
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
          <p className="text-sm text-green-600 capitalize">étape 1</p>
          <p className="text-gray-700">Informations personnelles</p>
        </div>
        <div className="w-1/3 space-y-2">
          <hr className={`border-t-4 ${currentStep > 0 && "border-green-600"}`} />
          <p className={`text-sm capitalize ${currentStep > 0 ? "text-green-600" : "text-gray-600"}`}>étape 2</p>
          <p className="text-gray-700">Informations de caisse</p></div>
        <div className="w-1/3 space-y-2">
          <hr className={`border-t-4 ${currentStep === 2 && "border-green-600"}`} />
          <p className={`text-sm capitalize ${currentStep === 2 ? "text-green-600" : "text-gray-600"}`}>étape 3</p>
          <p className="text-gray-700">Finalisation</p></div>
      </div>
      <CurrentStepComponent
        formData={formData[`step${currentStep + 1}`]}
        setFormData={updateFormData}
        errors={errors}
      />
      <hr className="border-t-2 border-gray-300 mt-4" />
      <div className='flex justify-between mt-8'>
        {currentStep > 0 && <Button className='bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2' onClick={handlePrevious}>Précédent</Button>}
        {currentStep < steps.length - 1 ? (
          <Button className='bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2' onClick={handleNext}>Suivant</Button>
        ) : (
          <Button className='bg-green-600 text-white' onClick={handleSubmit}>Fin</Button>
        )}
      </div>
    </div>
  );
};
export default RegisterForm;
