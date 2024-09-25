import React from 'react';
import { Step2Data } from '../validations'; // Ensure the Employee interface is defined

interface Step2Props {
  formData: Step2Data[]; // Change Holiday[] to Employee[]
  setFormData: (data: Partial<Step2Data>[]) => void; // Adjust type for setFormData
  errors: Partial<Record<number, string>>;
}

const Step2: React.FC<Step2Props> = ({ formData, setFormData, errors }) => {
  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Vérification des informations de l'employé</h2>
      {formData.map((employee, index) => (
        <div key={index} className="space-y-2">
          <p><strong>Prénom:</strong> {employee.first_name}</p>
          <p><strong>Nom:</strong> {employee.last_name}</p>
          <p><strong>Date de naissance:</strong> {employee.date_of_birthday}</p>
          <p><strong>Téléphone:</strong> {employee.phone_number}</p>
          <p><strong>Adresse:</strong> {employee.address}</p>
          <p><strong>Sexe:</strong> {employee.gender}</p>
          <p><strong>Email:</strong> {employee.user.email}</p>
          {/* Add more fields as needed */}
        </div>
      ))}
      {Object.entries(errors).map(([index, errorMessage]) => (
        <div key={index} className="text-destructive text-red-600">{errorMessage}</div>
      ))}
    </div>
  );
};

export default Step2;
