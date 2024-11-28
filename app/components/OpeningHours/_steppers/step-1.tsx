import React, { useEffect, useState } from 'react';
import { TimeInput } from "@nextui-org/react";
import type { TimeValue } from "@react-types/datepicker";
import { ZonedDateTime } from "@internationalized/date";
import { OpeningHours, ErrorMessages } from '../validations';
import { parseZonedDateTime } from "@internationalized/date";

interface Step1Props {
  formData: OpeningHours;
  setFormData: (data: Partial<OpeningHours>) => void;
  errors: ErrorMessages<OpeningHours>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
  // Déclaration de l'état 'initialized'
  const [initialized, setInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false); // Déclarez l'état ici

  const initializeTimeValue = (timeString: string | undefined, isOpen: boolean) => {
    if (timeString) {
      const timePart = isOpen ? timeString.split('-')[0] : timeString.split('-')[1];
      return parseZonedDateTime(`2024-04-08T${timePart}:00[UTC]`);
    } else {
      return parseZonedDateTime("2024-04-08T08:00:00[UTC]");
    }
  };
  
  const handleTimeChange = (day: keyof OpeningHours, value: TimeValue, isOpen: boolean) => {
    if (value instanceof ZonedDateTime) {
      const formattedTime = `${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}`;
      const key = day as keyof OpeningHours;

     const currentTimes = formData[key] || "08:00-17:00"; // valeur par défaut
    const [currentOpen, currentClose] = currentTimes.split('-');
    const newTime = isOpen ? `${formattedTime}-${currentClose}` : `${currentOpen}-${formattedTime}`;

      console.log(`Modification de ${key} : Nouvelle valeur = ${newTime}`);
      setFormData({ [key]: newTime });
      console.log("Données prêtes pour l'API:", formData);
      console.log("Données envoyer dans Step2:", formData);

    }
  };
  
  useEffect(() => {
    setInitialized(true); // Indique que le composant a été initialisé côté client
  }, []);

  if (!initialized) {
    return null; // Ne pas rendre ce composant sur le serveur
  }
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Ne pas afficher ce composant côté serveur
  }

  return (
    <div>
      {(["monday", "tuesday", "wednesday", "thursday", "friday"] as Array<keyof OpeningHours>).map((day) => (
        <div key={day} className="mb-4">
          <label className="block font-semibold mb-2">{day.charAt(0).toUpperCase() + day.slice(1)}: </label>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <TimeInput
                label="Open Time"
                hideTimeZone
                value={initializeTimeValue(formData[day], true)}
                onChange={(value) => handleTimeChange(day, value, true)}
                className="w-64"
              />
              {errors[day] && <span className="text-red-500">{errors[day]}</span>}
            </div>
            <div className="w-1/2">
              <TimeInput
                label="Close Time"
                hideTimeZone
                value={initializeTimeValue(formData[day], false)}
                onChange={(value) => handleTimeChange(day, value, false)}
                className="w-64"
              />
              {errors[day] && <span className="text-red-500">{errors[day]}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>

  );
};
export default Step1;
