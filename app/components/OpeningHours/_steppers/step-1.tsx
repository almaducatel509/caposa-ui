import React, { useState } from 'react';
import { OpeningHours, ErrorMessages } from '../validations';

interface Step1Props {
    formData: OpeningHours;
    setFormData: React.Dispatch<React.SetStateAction<OpeningHours>>;
    errors: Partial<OpeningHours>;
  }
const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
    
  
    const [setErrors] = useState<Partial<OpeningHours>>({});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        };

   
    return (
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">Horaires d'ouverture</h2>
        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
          <div key={day} className="space-y-2">
            <label htmlFor={day} className="block text-sm font-medium text-gray-700 capitalize">
              {day}
            </label>
            <input
              type="text"
              name={day}
              value={formData[day as keyof OpeningHours] || ''}
              onChange={handleChange}
              placeholder="08:00-17:00"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors[day as keyof OpeningHours] && <div className='text-red-600'>{errors[day as keyof OpeningHours]}</div>}
          </div>
        ))}
      </div>
    );
  };
export default Step1;
