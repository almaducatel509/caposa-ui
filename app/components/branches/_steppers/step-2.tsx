import React from 'react';
import { Step2Data } from '../validations'; // Importez Step2Data

interface Step2Props {
  formData: Step2Data;
  setFormData: (data: Partial<Step2Data>) => void;
  errors: Partial<Record<keyof Step2Data, string>>;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Review Branch Details</h2>
      
      <div className="space-y-2">
        <p><strong>Branch ID:</strong> {formData.branch_id}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Branch Name:</strong> {formData.branch_name}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Branch Address:</strong> {formData.branch_address}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Branch Phone Number:</strong> {formData.branch_phone_number}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Branch Email:</strong> {formData.branch_email}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Branch Manager ID:</strong> {formData.branch_manager_id}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Branch Code:</strong> {formData.branch_code}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Number of Posts:</strong> {formData.number_of_posts}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Number of Tellers:</strong> {formData.number_of_tellers}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Number of Clerks:</strong> {formData.number_of_clerks}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Number of Credit Officers:</strong> {formData.number_of_credit_officers}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Opening Date:</strong> {formData.opening_date.toLocaleDateString()}</p>
      </div>

      <div className="space-y-2">
        <p><strong>Opening Hours:</strong> {/* Ajoutez ici les détails de `opening_hours` */}</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>Holidays:</strong></p>
       
      </div>
    </div>
  );
};

export default Step2;
