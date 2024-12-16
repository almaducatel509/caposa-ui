import React, { useEffect, useState } from 'react';
import { TimeInput } from "@nextui-org/react";
import type { TimeValue } from "@react-types/datepicker";
import { OpeningHours, ErrorMessages } from '../validations';
import { parseZonedDateTime } from "@internationalized/date";


interface Step1Props {
  formData: OpeningHours;
  setFormData: (data: Partial<OpeningHours>) => void;
  errors: ErrorMessages<OpeningHours>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Indique que le composant est côté client
  }, []);

  if (!isClient) {
    return null; // Ne pas afficher ce composant côté serveur
  }

  const initializeTimeValue = (timeString: string | undefined, isOpen: boolean): TimeValue => {
    if (timeString) {
      const timePart = isOpen ? timeString.split('-')[0] : timeString.split('-')[1];
      return parseZonedDateTime(`2024-01-01T${timePart}:00[UTC]`);
    } else {
      // Valeur par défaut : 08:00 UTC
      return parseZonedDateTime("2024-01-01T08:00:00[UTC]");
    }
  };

  const handleTimeChange = (day: keyof OpeningHours, value: TimeValue, isOpen: boolean) => {
    const formattedTime = `${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}`;
    const currentTimes = formData[day] || "08:00-17:00";
    const [currentOpen, currentClose] = currentTimes.split('-');
    const newTime = isOpen ? `${formattedTime}-${currentClose}` : `${currentOpen}-${formattedTime}`;

    setFormData({ [day]: newTime });
  };

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
