'use client'
import React, { useState } from 'react'
import Step1 from './_steppers/step-1'
import Step2 from './_steppers/step-2'
import Step3 from './_steppers/step-3'
import { Button, useDisclosure,} from '@nextui-org/react'
import { step1Schema, Step1Data, } from '../employees/validations'
import { createEmployee } from '@/app/lib/api/employee'

const steps = [Step1, Step2, Step3];

const RegisterForm: React.FC = () => {

    const [currentStep, setCurrentStep] = useState(0);

    const [formData, setFormData] = useState<Step1Data>({
      username: '',
      payment_ref: '',
      password: '',
      confirm_password: '',
      email: '',
      first_name: '',
      last_name: '',
      date_of_birthday: '',
      photo_profil: undefined, 
      phone_number: '',
      address: '',
      gender: '',
      posts: [], 
      branch: '', // Single branch UUID
    });
    
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const validateStep = (): boolean => {
      const result = step1Schema.safeParse(formData);
      if (result.success) {
        setErrors({});
        return true;
      } else {
        const newErrors: Partial<Record<keyof Step1Data, string>> = {};
        result.error.errors.forEach((error) => {
          if (error.path.length) {
            const key = error.path[0] as keyof Step1Data;
            newErrors[key] = error.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
    };

  // const handleCreateAnother = () => {
  //   setFormData({
  //     username: "",
  //     date_of_birthday: "",
  //     posts: [],
  //     branch: '',
  
  //   });
  //   setApiError(null);
  //   setSuccessMessage(null);
  //   onClose(); // Close the modal
  //   setCurrentStep(0); // Reset to the first step
  // };
  const generatePaymentRef = (firstName: string, lastName: string, creationDate: Date): string => {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(); // Initiales
    const date = creationDate
      .toLocaleDateString("en-GB") // Format DD/MM/YYYY
      .split("/")
      .join("")
      .slice(0, 6); // Garde DDMMYY
    return `${initials}${date}`;
  };
  const transformedData = {
    user: {
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirm_password,
        email: formData.email,
    },
    first_name: formData.first_name,
    last_name: formData.last_name,
    date_of_birth: formData.date_of_birthday, 
    phone_number: formData.phone_number,
    address: formData.address,
    gender: formData.gender,
    payment_ref: formData.payment_ref || undefined, // Optionnel
    branch: typeof formData.branch === 'object' ? formData.branch : formData.branch,
    posts: formData.posts.map((post: any) => post.id ?? post), // Assurer que ce sont des UUID
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!validateStep()) {
      setIsSubmitting(false);
      return;
    }
    // 🚀 Transformation des données avant envoi
    const transformedData = {
        user: {
            username: formData.username,
            password: formData.password,
            confirm_password: formData.confirm_password,
            email: formData.email,
        },
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birthday, // Conversion correcte
        phone_number: formData.phone_number,
        address: formData.address,
        gender: formData.gender,
        payment_ref: formData.payment_ref || undefined, // Optionnel
        branch: typeof formData.branch === 'object' ? formData.branch : formData.branch,
        posts: formData.posts.map((post: any) => post.id ?? post), // Assurer que ce sont des UUID
    };
  
      console.log("🔍 Données envoyées à l'API :", transformedData);
  
      try {
          await createEmployee(transformedData);
          setSuccessMessage("Employé créé avec succès !");
          onOpen(); // Ouvrir modal de succès
      } catch (error) {
          setApiError("Une erreur est survenue lors de la création de l'employé.");
          onOpen(); // Ouvrir modal d'erreur
      } finally {
          setIsSubmitting(false);
      }
  };
  
            
  const CurrentStepComponent = steps[currentStep];
      
  const updateFormData = (data: Partial<Step1Data>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === steps.length - 1) {
        handleSubmit(); // Soumission lors de la dernière étape
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  
      
  return (
    <>
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
              <p className="text-gray-700">Finalisation</p>
          </div>
      </div>
      <CurrentStepComponent
          formData={formData}
          setFormData={updateFormData}
          errors={errors}
      />
      <hr className="border-t-2 border-gray-300 mt-4"/>
      <div className='flex justify-between mt-8'>
        {currentStep > 0 && (
            <Button className='bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2' 
                onClick={handlePrevious}>
                Précédent
            </Button>
        )}
        {currentStep < steps.length - 1 ? (
            <Button className='bg-white text-green-600 hover:text-white hover:bg-green-600 border-green-600 hover:border-none border-2' 
                onClick={handleNext}>
                Suivant
            </Button>
        ) : (
            <Button className='bg-green-600 text-white' onClick={handleSubmit}>
                Envoyer
            </Button>
        )}
      </div>

    </>
  );
};
export default RegisterForm

