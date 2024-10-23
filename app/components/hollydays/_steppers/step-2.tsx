import React from 'react';

interface Step2Props {
  formData: { holyday_date: string; holyday_description: string };
  setFormData: (data: Partial<{ holyday_date: string; holyday_description: string }>) => void;
  errors: Partial<Record<string, string>>;
}

const Step2: React.FC<Step2Props> = ({ formData, errors }) => {
  return (
    <div>
      <h2>Étape 2</h2>
      <p><strong>Date:</strong> {formData.holyday_date}</p>
      <p><strong>Description:</strong> {formData.holyday_description}</p>
      {errors.holyday_date && <p className="text-red-500">{errors.holyday_date}</p>}
      {errors.holyday_description && <p className="text-red-500">{errors.holyday_description}</p>}
    </div>
  );
};

export default Step2;
