// _steppers/step-3.tsx
import React from 'react';
import { Holiday } from '../validations';

interface Step3Props {
  formData: Holiday[];
  setFormData: (data: Partial<Holiday>[]) => void;
  errors: Partial<Record<number, string>>;
}

const Step3: React.FC<Step3Props> = () => {
  return (
    <div>
      <h2 className='text-base font-semibold leading-7 text-gray-900'>Finalisation</h2>
      <p className='mt-1 text-sm leading-6 text-gray-600'>Thank you for your submission.</p>
    </div>
  );
};

export default Step3;
