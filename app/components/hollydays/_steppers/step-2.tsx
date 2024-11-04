import React from 'react';
import { Holiday } from '../validations';

interface Step2Props {
  formData: Holiday;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Résumé des informations</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de congé :</label>
          <p className="mt-1 text-gray-800">{formData.holyday_date || "Non défini"}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description :</label>
          <p className="mt-1 text-gray-800">{formData.holyday_description || "Non défini"}</p>
        </div>
      </div>
    </div>
  );
};

export default Step2;

