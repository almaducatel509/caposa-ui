import React from 'react';
import { OpeningHours } from '../validations';

interface Step2Props {
  formData: OpeningHours;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Résumé des heures d'ouverture</h2>
      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
        const openKey = `${day}_open` as keyof OpeningHours;
        const closeKey = `${day}_close` as keyof OpeningHours;

        return (
          <div key={day} className="mb-2">
            <h3 className="font-semibold">{day.charAt(0).toUpperCase() + day.slice(1)}:</h3>
            <p>
              Ouverture : {formData[openKey] || "Non défini"} - Fermeture : {formData[closeKey] || "Non défini"}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Step2;
