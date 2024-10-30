import React from 'react';
import { Post } from '../validations';

interface Step2Props {
  formData: Post;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Review Post Details</h2>
      
      <div className="space-y-2">
        <p><strong>Post Name:</strong> {formData.name}</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>Post Description:</strong> {formData.description}</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>Deposit Enabled:</strong> {formData.deposit ? "Yes" : "No"}</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>Withdrawal Enabled:</strong> {formData.withdrawal ? "Yes" : "No"}</p>
      </div>
      
      <div className="space-y-2">
        <p><strong>Transfer Enabled:</strong> {formData.transfer ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};

export default Step2;
