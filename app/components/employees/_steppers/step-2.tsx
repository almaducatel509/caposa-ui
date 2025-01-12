import React from 'react';
import { Step1Data } from '../validations';

interface Step2Props {
  formData: Step1Data;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Review Post Details</h2>
      
      <div className="space-y-2">
        <p><strong>first_name</strong> {formData.first_name}</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>last_name</strong> {formData.last_name}</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>gender</strong> {formData.gender}</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>date_of_birthday</strong> {formData.date_of_birthday }</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>username:</strong> {formData.username}</p>
      </div>
    </div>
  );
};

export default Step2;
