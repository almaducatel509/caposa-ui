// _steppers/step-2.tsx
import React from 'react';
import { Holiday } from '../validations';

interface Step2Props {
  formData: Holiday[];
  setFormData: (data: Partial<Holiday>[]) => void;
  errors: Partial<Record<number, string>>;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Vérification des informations</h2>
      {formData.map((holiday, index) => (
        <div key={index} className="space-y-2">
          <p><strong>Date:</strong> {holiday.holyday_date.toString().split('T')[0]}</p>
          <p><strong>Description:</strong> {holiday.holyday_description}</p>
        </div>
      ))}
    </div>
  );
};

export default Step2;
