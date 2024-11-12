import React from 'react';
import { Step2Data } from '../validations';

interface Step2Props {
  formData?: Step2Data;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  if (!formData) {
    return <p>Loading data...</p>; // Or handle loading state as desired
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Résumé des informations</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom:</label>
          <p className="mt-1 text-gray-800">{formData.first_name || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom:</label>
          <p className="mt-1 text-gray-800">{formData.last_name || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de naissance:</label>
          <p className="mt-1 text-gray-800">{formData.date_of_birthday || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone:</label>
          <p className="mt-1 text-gray-800">{formData.phone_number || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse:</label>
          <p className="mt-1 text-gray-800">{formData.address || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sexe:</label>
          <p className="mt-1 text-gray-800">{formData.gender || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email:</label>
          <p className="mt-1 text-gray-800">{formData.email || "Non défini"}</p>
        </div>
      </div>
    </div>
  );
};

export default Step2;
