"use client"
// _steppers/step-3.tsx
import React from 'react';
import { Holiday, ErrorMessages } from '../validations';

interface Step3Props {
  formData: Holiday; // Correction ici : Utilisez `Holiday` au lieu de `Holiday[]`
  setFormData: (data: Partial<Holiday>) => void; // Correction ici : Utilisez `Partial<Holiday>`
  errors: ErrorMessages<Holiday>; // Correction ici : utilisez `ErrorMessages<Holiday>`
}

const Step3: React.FC<Step3Props> = ({ formData, setFormData, errors }) => {
  return (
    <div>
      <h2 className='text-base font-semibold leading-7 text-gray-900'>Finalisation</h2>
      <p className='mt-1 text-sm leading-6 text-gray-600'>Thank you for your submission.</p>
    </div>
  );
};

export default Step3;
