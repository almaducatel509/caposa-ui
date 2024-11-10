import React, { useEffect } from 'react';
import { Step2Data } from '../validations';

interface Step2Props {
  formData: Step2Data;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  useEffect(() => {
    console.log("Données reçues dans Step2:", formData);
  }, [formData]);  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Vérification des informations de l'employé</h2>
      <div className="space-y-2">
        <p><strong>Prénom:</strong> {formData.first_name}</p>
        <p><strong>Nom:</strong> {formData.last_name}</p>
        <p><strong>Date de naissance:</strong> {formData.date_of_birthday}</p>
        <p><strong>Téléphone:</strong> {formData.phone_number}</p>
        <p><strong>Adresse:</strong> {formData.address}</p>
        <p><strong>Sexe:</strong> {formData.gender}</p>
        <p><strong>Email:</strong> {formData.user.email}</p>
      </div>
      
    </div>
  );
};

export default Step2;
