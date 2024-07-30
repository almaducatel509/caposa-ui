import React from 'react';
import { Step3Data, ErrorMessages } from '../validations';

interface Step3Props {
    formData: Step3Data;
    setFormData: (data: Partial<Step3Data>) => void;
   errors: ErrorMessages<Step3Data>;
}

const Step2: React.FC<Step3Props> = ({ formData, setFormData, errors }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };

    return (
        <div>
            <div>
                <label>City</label>
                <input
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                />
                {errors.city && <p>{errors.city}</p>}
            </div>
            <div>
                <label>address</label>
                <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                />
                {errors.address && <p>{errors.address}</p>}
            </div>
        </div>
    );
};

export default Step2;
