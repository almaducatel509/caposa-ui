import React, { ChangeEvent } from 'react';
import { parseDate, getLocalTimeZone, DateValue } from "@internationalized/date";
import { branchSchema,ErrorMessages, BranchData } from '../validations';
import { Input, Button, Spacer, DateInput } from '@nextui-org/react';
import TitleDetails from '../title-details';


interface Step1Props {
    formData: BranchData;
    setFormData: (data: Partial<BranchData>) => void;
    errors: ErrorMessages<BranchData>;
  }
  
  const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
      function handleChange(event: ChangeEvent<HTMLInputElement>): void {
          throw new Error('Function not implemented.');
      }

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //   const { name, value } = e.target;
      
    //   if (name === "holyday_date" || name === "holyday_description") {
    //     setFormData({ [name]: value } as Partial<BranchData>); // Met à jour uniquement le champ ciblé
    //   }
    // };
    const handleChangeDate = (date: DateValue) => {
        const formattedDate = date.toString(); // Formate la date en chaîne AAAA-MM-JJ
        setFormData({ opening_date: formattedDate }); // Met à jour uniquement la date
        console.log('Updated date:', formattedDate);
      };
  
  return (
    <div>
      <TitleDetails text1="Branch Information" text2="Provide your branch details" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="branch_name" className="block text-sm font-medium text-gray-700">Branch Name</label>
            <Input
              label="Branch Name"
              placeholder="Enter branch name"
              value={formData.branch_name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="branch_address" className="block text-sm font-medium text-gray-700">Branch Address</label>
            <Input
              label="Branch Address"
              placeholder="Enter branch address"
              value={formData.branch_address}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="branch_phone_number" className="block text-sm font-medium text-gray-700">Branch Phone Number</label>
            <Input
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
            //   value={formData.number_of_posts}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="number_of_tellers" className="block text-sm font-medium text-gray-700">Number of Tellers</label>
            <Input
              label="Number of Tellers"
              placeholder="Enter number of tellers"
            //   value={formData.number_of_tellers}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="number_of_clerks" className="block text-sm font-medium text-gray-700">Number of Clerks</label>
            <Input
              label="Number of Clerks"
              placeholder="Enter number of clerks"
            //   value={formData.number_of_clerks}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="number_of_credit_officers" className="block text-sm font-medium text-gray-700">Number of Credit Officers</label>
            <Input
              label="Number of Credit Officers"
              placeholder="Enter number of credit officers"
            //   value={formData.number_of_credit_officers}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="opening_date" className="block text-sm font-medium text-gray-700">Opening Date</label>
            <DateInput
              label="Opening Date"
              description="Veuillez entrer la date au format AAAA-MM-JJ"
              value={parseDate(formData.opening_date || "1804-01-01")}
              onChange={handleChangeDate} 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="opening_hour" className="block text-sm font-medium text-gray-700">Opening Hour</label>
            <Input
            //?
              label="Opening Hour"
              placeholder="Enter opening hour"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="holidays" className="block text-sm font-medium text-gray-700">Holidays</label>
            <Input
              label="Holidays"
              placeholder="Enter holidays"
              
            />
          </div>
        </div>
    </div>
  );
};

export default Step1;
