import React from 'react';
import { OpeningHours } from './validations';

interface SummaryProps {
  formData: OpeningHours;
}

const OpeningHoursSummary: React.FC<SummaryProps> = ({ formData }) => {
  const days: Array<keyof OpeningHours> = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  return (
    <div className="mt-8 border-t pt-4">
      <h2 className="text-lg font-semibold mb-4 text-green-700">Résumé des heures d’ouverture</h2>
      <ul className="space-y-2">
        {days.map((day) => {
          const [open, close] = formData[day]?.split("-") || ["-", "-"];
          return (
            <li key={day} className="flex justify-between border-b pb-1">
              <span className="capitalize font-medium">{day}:</span>
              <span>{open} - {close}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OpeningHoursSummary;
