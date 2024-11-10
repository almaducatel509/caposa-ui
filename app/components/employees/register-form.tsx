'use client'
import React, { useState } from 'react'
import Step1 from './_steppers/step-1'
import Step2 from './_steppers/step-2'
import Step3 from './_steppers/step-3'
import { z, ZodError } from 'zod';
import { create } from '@/app/lib/create'
import { Button } from '@nextui-org/react'
import { formSchema ,ErrorMessages, EmployeeFormData, step1Schema, step2Schema, step3Schema } from '../employees/validations'

const steps = [Step1, Step2, Step3];

const RegisterForm = () => {

    const [currentStep, setCurrentStep] = useState(0);

    const [formData, setFormData] = useState<FormData | any>({
        step1: {
            first_name: '',
            last_name: '',
            gender: '',
            date_of_birthday: '',
            id_number: '',
            phone_number: '',
            email: '',
            address: '',
            city: '',
            department: '',
            photo_url: null,
            user: {
              username: '',
              password: '',
              confirm_password: '',
              email: ''
            },
            posts: []
          },
          step2: {
            email: '',
            password: '',
            account_type: '',
            account_number: '',
            current_balance: 0,
            loan_type: '',
            loan_amount: 0,
            interest_rate: 0,
            loan_duration: '',
            payment_frequency: '',
            security_question: '',
            security_answer: '',
            additional_accounts: '',
            monthly_income: 0,
            monthly_expenses: 0
          },
          step3: {}
    });

    
    const [errors, setErrors] = useState<ErrorMessages<EmployeeFormData>>({});
    
    const validateStep = (currentStep?: number): boolean => {
        let result;
        switch (currentStep) {
            case 0:
                result = formSchema.shape.step1.safeParse(formData.step1);
                break;
            case 1:
                result = formSchema.shape.step2.safeParse(formData.step2);
                break;
            case 2:
                result = formSchema.shape.step3.safeParse(formData.step3);
                break;
            default:
                return false;
        }
    
        if (result.success) {
            setErrors({}); // Clears all errors when validation passes
            return true;
        } else {
            // Initialize newErrors as an object with dynamic structure
            const newErrors: ErrorMessages<EmployeeFormData> = result.error.errors.reduce((acc, error) => {
                if (error.path.length) {
                    const [firstKey, ...restKeys] = error.path as (keyof EmployeeFormData)[];
                    
                    // Handle nested paths dynamically
                    let current = acc;
                    for (let i = 0; i < restKeys.length; i++) {
                        const key = restKeys[i];
                        if (!current[firstKey]) {
                            current[firstKey] = {};
                        }
                        if (i === restKeys.length - 1) {
                            (current[firstKey] as ErrorMessages<any>)[key] = error.message;                        } else {
                            current = current[firstKey] as ErrorMessages<any>;
                        }
                    }
                }
                return acc;
            }, {} as ErrorMessages<EmployeeFormData>);
    
            setErrors(newErrors);
            return false;
        }
    };
    

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
            <hr className="border-t-2 border-gray-300 mt-4"/>
            <div className='flex justify-between mt-8'>
                {currentStep > 0 && <Button className='bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2' onClick={handlePrevious}>Précédent</Button>}
                {currentStep < steps.length - 1 ? (
                    <Button className='bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2' onClick={handleNext}>Suivant</Button>
                ) : (
                    <Button className='bg-green-600 text-white' onClick={handleSubmit}>Envoyer</Button>
                )}
            </div>
        </div>
    );
};
export default RegisterForm