import React, { useEffect } from 'react';
import { OpeningHours } from '../validations';

interface Step2Props {
  formData: OpeningHours;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  useEffect(() => {
    console.log("Données reçues dans Step2:", formData);
  }, [formData]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Résumé des heures d'ouverture</h2>
      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
        const dayValue = formData[day as keyof OpeningHours];
        const [openTime, closeTime] = dayValue ? dayValue.split('-') : ["Non défini", "Non défini"];

        return (
          <div key={day} className="mb-2">
            <h3 className="font-semibold">{day.charAt(0).toUpperCase() + day.slice(1)}:</h3>
            <p>
              Ouverture : {openTime} - Fermeture : {closeTime}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Step2;
