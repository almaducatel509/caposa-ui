import React, { useState, useEffect, ChangeEvent } from 'react';
import { parseDate, getLocalTimeZone, DateValue } from "@internationalized/date";
import { BranchData, ErrorMessages } from '../validations';
import { Input, Button, Spacer, DateInput } from '@nextui-org/react';
import TitleDetails from '../title-details';
import axios from 'axios';
import { fetchHolidays, fetchOpeningHours } from '@/app/lib/api/branche';


interface Step1Props {
  formData: BranchData;
  setFormData: (data: Partial<BranchData>) => void;
  errors: ErrorMessages<BranchData>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
  const [openingHours, setOpeningHours] = useState<{ id: string; schedule: string }[]>([]);
  const [holidays, setHolidays] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true); // Indicateur de chargement
   
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both opening hours and holidays
        const [openingHoursResponse, holidaysResponse] = await Promise.all([
          fetchOpeningHours(),
          fetchHolidays(),
        ]);
  
        setOpeningHours(openingHoursResponse);
        setHolidays(holidaysResponse);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  useEffect(() => {
    console.log('Opening Hours:', openingHours);
  }, [openingHours]);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    // Convertir les champs numériques
    const numericFields = ["number_of_posts", "number_of_tellers", "number_of_clerks", "number_of_credit_officers"];
    setFormData({
      [name]: numericFields.includes(name) ? Number(value) : value,
    } as Partial<BranchData>);
  };
  

  const handleChangeDate = (date: DateValue) => {
    const formattedDate = date.toString(); // YYYY-MM-DD
    setFormData({ opening_date: formattedDate });
    console.log('Updated date:', formattedDate);
  };
    

  return (
    <div>
      <TitleDetails text1="Branch Information" text2="Provide your branch details" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="branch_name" className="block text-sm font-medium text-gray-700">Branch Name</label>
            <Input
              name="branch_name" // Ajoutez le name correspondant à formData
              label="Branch Name"
              placeholder="Enter branch name"
              value={formData.branch_name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="branch_address" className="block text-sm font-medium text-gray-700">Branch Address</label>
            <Input
              name="branch_address" // Ajoutez le name correspondant à formData
              label="Branch Address"
              placeholder="Enter branch address"
              value={formData.branch_address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="branch_phone_number" className="block text-sm font-medium text-gray-700">Branch Phone Number</label>
            <Input
              name="branch_phone_number" // Ajoutez le name correspondant à formData
              label="Branch Phone Number"
              placeholder="Enter branch phone number"
              value={formData.branch_phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="branch_email" className="block text-sm font-medium text-gray-700">Branch Email</label>
            <Input
              label="Branch Email"
              placeholder="Enter branch email"
              value={formData.branch_email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="number_of_posts" className="block text-sm font-medium text-gray-700">Number of Posts</label>
            <Input
              label="Number of Posts"
              placeholder="Enter number of posts"
              value={formData.number_of_posts.toString()} // Convertir en chaîne
              onChange={handleChange}
              type="number"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="number_of_tellers" className="block text-sm font-medium text-gray-700">Number of Tellers</label>
            <Input
              label="Number of Tellers"
              placeholder="Enter number of tellers"
              value={formData.number_of_tellers.toString()} // Convertir en chaîne
              onChange={handleChange}
              type="number"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="number_of_clerks" className="block text-sm font-medium text-gray-700">Number of Clerks</label>
            <Input
              label="Number of Clerks"
              placeholder="Enter number of clerks"
              value={formData.number_of_clerks.toString()} // Convertir en chaîne
              onChange={handleChange}
              type="number"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="number_of_credit_officers" className="block text-sm font-medium text-gray-700">Number of Credit Officers</label>
            <Input
              label="Number of Credit Officers"
              placeholder="Enter number of credit officers"
              value={formData.number_of_credit_officers.toString()} // Convertir en chaîne
              onChange={handleChange}
              type="number"
            />
          </div>

          {/* Opening Date */}
          <div className="space-y-2">
            <label htmlFor="opening_hour" className="block text-sm font-medium text-gray-700">
              Opening Hours
            </label>
            {loading ? (
              <p>Loading opening hours...</p>
            ) : openingHours.length > 0 ? (
              <select
                name="opening_hour"
                value={formData.opening_hour}
                onChange={(e) => setFormData({ opening_hour: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select an opening hour</option>
                {openingHours.map((hour) => (
                  <option key={hour.id} value={hour.id}>
                    {hour.schedule} {/* Affichez l'horaire formaté */}
                  </option>
                ))}
              </select>

            ) : (
              <p>No opening hours available</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="holidays" className="block text-sm font-medium text-gray-700">
              Holidays
            </label>
            {loading ? (
              <p>Loading holidays...</p>
            ) : holidays.length > 0 ? (
              <select
                multiple
                name="holidays"
                value={formData.holidays}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, (opt) => opt.value);
                  setFormData({ holidays: selectedValues }); // Met à jour les jours fériés sélectionnés
                }}
                className="w-full border rounded px-3 py-2"
              >
                {holidays.map((holiday) => (
                  <option key={holiday.id} value={holiday.id}>
                    {holiday.name} {/* Affichez la combinaison date-description */}
                  </option>
                ))}
              </select>
            ) : (
              <p>No holidays available</p>
            )}
          </div>


        </div>
    </div>
  );
};

export default Step1;
