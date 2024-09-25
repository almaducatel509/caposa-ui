// _steppers/step-1.tsx
import React from 'react';
import { Post } from '../validations';

interface Step1Props {
  formData: Post;
  setFormData: (data: Partial<Post>) => void;
  errors: Partial<Record<keyof Post, string>>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Post) => {
    const { value } = e.target;
    setFormData({ [field]: value.split(',').map(item => item.trim()) });
  };

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Post Details</h2>
      <div className="space-y-2">
        <label htmlFor="post_id" className="block text-sm font-medium text-gray-700">Post ID</label>
        <input
          type="text"
          name="post_id"
          value={formData.post_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.post_id && <div className="text-red-600">{errors.post_id}</div>}
      </div>
      <div className="space-y-2">
        <label htmlFor="post_name" className="block text-sm font-medium text-gray-700">Post Name</label>
        <input
          type="text"
          name="post_name"
          value={formData.post_name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.post_name && <div className="text-red-600">{errors.post_name}</div>}
      </div>
      <div className="space-y-2">
        <label htmlFor="post_description" className="block text-sm font-medium text-gray-700">Post Description</label>
        <textarea
          name="post_description"
          value={formData.post_description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.post_description && <div className="text-red-600">{errors.post_description}</div>}
      </div>
     
      <div className="space-y-2">
        <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700">Responsibilities (comma-separated)</label>
        <input
          type="text"
          name="responsibilities"
          value={formData.responsibilities}
          onChange={(e) => handleArrayChange(e, 'responsibilities')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.responsibilities && <div className="text-red-600">{errors.responsibilities}</div>}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">Is Active</label>
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ is_active: e.target.checked })}
          className="mt-1 block rounded-md border-gray-300 shadow-sm"
        />
        {errors.is_active && <div className="text-red-600">{errors.is_active}</div>}
      </div>
    </div>
  );
};

export default Step1;
