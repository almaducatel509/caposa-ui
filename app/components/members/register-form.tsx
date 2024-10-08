'use client'
import React, { useState } from 'react'
import Step1 from './_steppers/step-1'
import Step2 from './_steppers/step-2'
import Step3 from './_steppers/step-3'
import { z, ZodError } from 'zod';
import { create } from '@/app/lib/create'
import { Button } from '@nextui-org/react'
import { step1Schema, step2Schema, step3Schema, FormData, ErrorMessages } from './validations'

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
            department: ''
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

        step3: {
            id: 'Step 3',
            name: 'Complete'
        },
    });
    
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const validateStep = (step: number): boolean => {
        let result: z.SafeParseReturnType<any, any>;
        switch (step) {
            case 0:
                result = step1Schema.safeParse(formData.step1);
                break;
            case 1:
                result = step2Schema.safeParse(formData.step2);
                break;
            case 2:
                result = step3Schema.safeParse(formData.step3);
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
            // console.log(newErrors)
            setErrors(newErrors);
            return false;
        }
    };

    const handleNext = () => {
        // console.log(formData)
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