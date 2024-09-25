// _steppers/step-2.tsx
import React from 'react';
import { Post } from '../validations';

interface Step2Props {
  formData: Post;
  setFormData: (data: Partial<Post>) => void;
  errors: Partial<Record<keyof Post, string>>;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Review Post Details</h2>
      <div className="space-y-2">
        <p><strong>Post ID:</strong> {formData.post_id}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Post Name:</strong> {formData.post_name}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Post Description:</strong> {formData.post_description}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Responsibilities:</strong> {formData.responsibilities}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Is Active:</strong> {formData.is_active ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default Step2;
