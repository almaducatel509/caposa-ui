import React from 'react';
import { Post, ErrorMessages } from '../validations';
import { Input, Checkbox, Textarea } from '@nextui-org/react';

interface Step1Props {
  formData: Post;
  setFormData: (data: Partial<Post>) => void;
  errors: ErrorMessages<Post>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleCheckbox = (field: keyof Post, value: boolean) => {
    setFormData({ ...formData, [field]: value });
};


  return (
    <div className='capitalize'>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Post Details</h2>
      
      <div className="space-y-2">
        <Input
          type="text"
          label="Name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          isRequired
        />
        {errors.name && <div className="text-red-600">{errors.name}</div>}
      </div>
      
      <div className="space-y-2">
        <Textarea
          label="Description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          isRequired
        />
        {errors.description && <div className="text-red-600">{errors.description}</div>}
      </div>
     
      <div className="space-y-2 ">
        <Checkbox
          name="deposit"
          isSelected={formData.deposit || false}
          onChange={(e) => handleCheckbox("deposit", e.target.checked)}
          aria-label="Deposit">
            deposit
          </Checkbox>
        {errors.deposit && <div className="text-red-600">{errors.deposit}</div>}
      </div>
      
      <div className="space-y-2">
        <Checkbox
          name="withdrawal"
          isSelected={formData.withdrawal || false}
          onChange={(e) => handleCheckbox("withdrawal", e.target.checked)}
          aria-label="Withdrawal">
             withdrawal
          </Checkbox>
        {errors.withdrawal && <div className="text-red-600">{errors.withdrawal}</div>}
      </div>
      
      <div className="space-y-2">
        <Checkbox
          name="transfer"
          isSelected={formData.transfer || false}
          onChange={(e) => handleCheckbox("transfer", e.target.checked)}
          aria-label="Transfer">
            transfer
          </Checkbox>
        {errors.transfer && <div className="text-red-600">{errors.transfer}</div>}
      </div>
    </div>
  );
};

export default Step1;
