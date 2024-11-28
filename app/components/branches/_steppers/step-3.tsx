import React from 'react';
import { BranchData, ErrorMessages } from '../validations';

interface Step3Props {
  formData: BranchData; // Correction ici : Utilisez `Holiday` au lieu de `Holiday[]`
  setFormData: (data: Partial<BranchData>) => void; // Correction ici : Utilisez `Partial<Holiday>`
  errors: ErrorMessages<BranchData>; // Correction ici : utilisez `ErrorMessages<Holiday>`
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
