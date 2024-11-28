import React from 'react';

interface Step2Props {
  formData: any; // Utilise "any" pour simplifier l'exemple
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  if (!formData || !formData.step1) {
    return <p>Loading data...</p>; // Or handle loading state as desired
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Résumé des informations</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom:</label>
          <p className="mt-1 text-gray-800">{formData.step1.first_name || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom:</label>
          <p className="mt-1 text-gray-800">{formData.step1.last_name || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de naissance:</label>
          <p className="mt-1 text-gray-800">{formData.step1.date_of_birthday || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone:</label>
          <p className="mt-1 text-gray-800">{formData.step1.phone_number || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse:</label>
          <p className="mt-1 text-gray-800">{formData.step1.address || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sexe:</label>
          <p className="mt-1 text-gray-800">{formData.step1.gender || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email:</label>
          <p className="mt-1 text-gray-800">{formData.step1.email || "Non défini"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur:</label>
          <p className="mt-1 text-gray-800">{formData.step1.username || "Non défini"}</p>
        </div>
      </div>
    </div>
  );
};

export default Step2;
