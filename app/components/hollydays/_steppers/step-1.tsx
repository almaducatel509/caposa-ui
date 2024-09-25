import React from 'react';
import { Holiday } from '../validations';
import TitleDetails from '../title-details';

interface Step1Props {
  formData: Holiday[];
  setFormData: React.Dispatch<React.SetStateAction<Holiday[]>>;
  errors: Partial<Record<number, string>>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], [name]: value };
      return updatedData;
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  return (
    <div>
      <TitleDetails text1={'Informations personnelles'} text2={'Fournir vos informations personnelles'} />

      <h2 className="text-base font-semibold leading-7 text-gray-900">Jours fériés</h2>
      {formData.map((holiday, index) => (
        <div key={index} className="space-y-2">
          <label htmlFor={`date-${index}`} className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name={`date-${index}`}
            value={formatDate(new Date(holiday.date))}
            onChange={(e) => handleChange(e, index)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            name={`description-${index}`}
            value={holiday.description}
            onChange={(e) => handleChange(e, index)}
            placeholder="Exemple: Jour de l'Indépendance"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors[index] && <div className="text-red-600">{errors[index]}</div>}
        </div>
      ))}
    </div>
  );
};

export default Step1;
