import React from 'react';

interface StepSummaryProps {
  formData: {
    first_name: string;
    last_name: string;
    gender: string;
    date_of_birthday: string;
    id_number: string;
    phone_number: string;
    email: string;
    address: string;
    city: string;
    department: string;
    photo_url: string; 
    password?: string;
    account_type?: string;
    account_number?: string;
    current_balance?: number;
    loan_type?: string;
    loan_amount?: number;
    interest_rate?: number;
    loan_duration?: string;
    payment_frequency?: string;
    security_question?: string;
    security_answer?: string;
    additional_accounts?: string;
    monthly_income?: number;
    monthly_expenses?: number;
  };
}

const StepSummary: React.FC<StepSummaryProps> = ({ formData }) => {
  return (
    <div>
      <div>
        <h2 className='text-base font-semibold leading-7 text-gray-900'>Complete</h2>
        <p className='mt-1 text-sm leading-6 text-gray-600'>Thank you for your submission.</p>
      </div>
      <h2>Summary of Collected Information</h2>
      <p><strong>First Name:</strong> {formData.first_name}</p>
      <p><strong>Last Name:</strong> {formData.last_name}</p>
      <p><strong>Gender:</strong> {formData.gender}</p>
      <p><strong>Date of Birth:</strong> {formData.date_of_birthday}</p>
      <p><strong>ID Number:</strong> {formData.id_number}</p>
      <p><strong>Phone Number:</strong> {formData.phone_number}</p>
      <p><strong>Email:</strong> {formData.email}</p>
      <p><strong>Address:</strong> {formData.address}</p>
      <p><strong>City:</strong> {formData.city}</p>
      <p><strong>Department:</strong> {formData.department}</p>
      <p><strong>Photo URL:</strong> {formData.photo_url}</p>

      <h3>Step 2 Information</h3>
      <p><strong>Password:</strong> {formData.password || 'N/A'}</p>
      <p><strong>Account Type:</strong> {formData.account_type || 'N/A'}</p>
      <p><strong>Account Number:</strong> {formData.account_number || 'N/A'}</p>
      <p><strong>Current Balance:</strong> {formData.current_balance !== undefined ? `$${formData.current_balance}` : 'N/A'}</p>
      <p><strong>Security Question:</strong> {formData.security_question || 'N/A'}</p>
      <p><strong>Security Answer:</strong> {formData.security_answer || 'N/A'}</p>
      <p><strong>Additional Accounts:</strong> {formData.additional_accounts || 'N/A'}</p>
      <p><strong>Monthly Income:</strong> {formData.monthly_income !== undefined ? `$${formData.monthly_income}` : 'N/A'}</p>
      <p><strong>Monthly Expenses:</strong> {formData.monthly_expenses !== undefined ? `$${formData.monthly_expenses}` : 'N/A'}</p>
    </div>
  );
};

export default StepSummary;
