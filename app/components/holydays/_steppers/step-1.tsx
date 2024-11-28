import React from 'react';
import { parseDate, getLocalTimeZone, DateValue } from "@internationalized/date";
import { DateInput, Textarea } from '@nextui-org/react';
import TitleDetails from '../title-details';
import { Holiday, ErrorMessages } from '../validations';


interface Step1Props {
  formData: Holiday;
  setFormData: (data: Partial<Holiday>) => void;
  errors: ErrorMessages<Holiday>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "holyday_date" || name === "holyday_description") {
      setFormData({ [name]: value } as Partial<Holiday>); // Met à jour uniquement le champ ciblé
    }
  };
  


  const handleChangeDate = (date: DateValue) => {
    const formattedDate = date.toString(); // Formate la date en chaîne AAAA-MM-JJ
    setFormData({ holyday_date: formattedDate }); // Met à jour uniquement la date
    console.log('Updated date:', formattedDate);
  };

  return (
    <div>
      <TitleDetails text1="Informations" text2="Fournir vos informations" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="holyday_date" className="block text-sm font-medium text-gray-700">Date</label>
          <DateInput 
            label="Date historique" 
            description="Veuillez entrer la date au format AAAA-MM-JJ"
            isInvalid={false} // Par défaut, non invalide
            className="max-w-xs"
            value={parseDate(formData.holyday_date || "1804-01-01")}
            onChange={handleChangeDate} 
          />
          
          {errors.holyday_date && <div className='text-destructive text-red-600'>{errors.holyday_date}</div>}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="holyday_description" className="block text-sm font-medium text-gray-700"> Description</label>
          <Textarea
            name="holyday_description"
            value={formData.holyday_description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          { errors.holyday_description && <div className="text-red-600">{errors.holyday_description}</div>}
        </div>
      </div>
    </div>
  );
};

export default Step1;
