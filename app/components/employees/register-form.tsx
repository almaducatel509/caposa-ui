'use client'
import React, { useState } from 'react'
import { employeeFormSchema, EmployeeFormData } from './validations'; // Adjust import path
import Step1 from './_steppers/step-1'; // Adjust as needed
import Step2 from './_steppers/step-2'; // Adjust as needed
import Step3 from './_steppers/step-3'; // Adjust as needed
import { create } from '@/app/lib/create';

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const Step1 = {
        first_name: '',
        last_name: '',
        gender: 'M',
        date_of_birthday: '',
        id_number: '',
        phone_number: '',
        email: '',
        address: '',
        city: '',
        department: '',
        photo_url: null,
        user: {}, // Initialize with an empty user object
        branch: {}, // Initialize with an empty branch object
        posts: [], // Initialize as an empty array of posts
      },
      Step2 = {
        first_name: '',
        last_name: '',
        gender: 'M',
        date_of_birthday: '',
        id_number: '',
        phone_number: '',
        email: '',
        address: '',
        city: '',
        department: '',
        photo_url: null,
        user: {}, // Initialize with an empty user object
        branch: {}, // Initialize with an empty branch object
        posts: [], // Initialize as an empty array of posts
      };
      const Step3 = {};
      const initialFormData = {
        step1: Step1,
        step2: Step2,
        step3: Step3,
      };
      const [formData, setFormData] = useState(initialFormData);


    const currentStepKey = `step${currentStep + 1}` as keyof EmployeeFormData;
    
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const validateStep = (): boolean => {
        let result;
        switch (currentStep) {
            case 0:
                result = employeeFormSchema.shape.step1.safeParse(formData.step1);
                break;
            case 1:
                result = employeeFormSchema.shape.step2.safeParse(formData.step2);
                break;
            case 2:
                result = employeeFormSchema.shape.step3.safeParse(formData.step3);
                break;
            default:
                return false;
        }

        if (result.success) {
            setErrors({});
            return true;
        } else {
            const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
            result.error.errors.forEach((error) => {
                if (error.path.length) {
                    const key = error.path[0] as keyof EmployeeFormData;
                    newErrors[key] = error.message;
                }
            });
            setErrors(newErrors);
            return false;
        }
    };

    const handleNext = () => {
        if (currentStep === 2 || validateStep()) {
            setCurrentStep((prev) => prev + 1);
        }
    };
   

    const handlePrevious = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        if (validateStep()) {
            create(formData); // Adjust based on your create function
            console.log('Form submitted successfully:', formData);
        }
    };

    const CurrentStepComponent = steps[currentStep];
    const stepFormData = formData[currentStep === 0 ? 'step1' : currentStep === 1 ? 'step2' : 'step3'];

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
                    <p className="text-gray-700">Personal Details</p>
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
            {/* <CurrentStepComponent
                formData={formData[currentStepKey]}
                setFormData={updateFormData}
                errors={errors}
            /> */}

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
