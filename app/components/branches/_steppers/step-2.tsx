import React from 'react';

interface Step2Props {
  formData: any;
  setFormData: (data: Partial<any>) => void;
  errors: Partial<Record<string, string>>;
}

const Step2: React.FC<Step2Props> = ({ formData, setFormData, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  return (
    <div>
      <h2>Step 2: Staff Details</h2>
      <div>
        <label>Number of Posts</label>
        <input type="number" name="number_of_posts" value={formData.number_of_posts} onChange={handleChange} />
        {errors.number_of_posts && <span>{errors.number_of_posts}</span>}
      </div>
      <div>
        <label>Number of Tellers</label>
        <input type="number" name="number_of_tellers" value={formData.number_of_tellers} onChange={handleChange} />
        {errors.number_of_tellers && <span>{errors.number_of_tellers}</span>}
      </div>
      <div>
        <label>Number of Clerks</label>
        <input type="number" name="number_of_clerks" value={formData.number_of_clerks} onChange={handleChange} />
        {errors.number_of_clerks && <span>{errors.number_of_clerks}</span>}
      </div>
      <div>
        <label>Number of Credit Officers</label>
        <input type="number" name="number_of_credit_officers" value={formData.number_of_credit_officers} onChange={handleChange} />
        {errors.number_of_credit_officers && <span>{errors.number_of_credit_officers}</span>}
      </div>
    </div>
  );
};

export default Step2;
