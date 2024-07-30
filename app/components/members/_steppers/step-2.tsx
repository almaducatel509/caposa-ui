import React from 'react';
import { Step2Data, ErrorMessages } from '../validations';

interface Step2Props {
    formData: Step2Data;
    setFormData: (data: Partial<Step2Data>) => void;
    errors: ErrorMessages<Step2Data>;
}

const Step2: React.FC<Step2Props> = ({ formData, setFormData, errors }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };

    return (
        <div>
            <TitleDetails text1={'Informations de caisse'} text2={'Fournir vos informations de caisse'} />
            <div>
                <label>Email</label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                {errors.email && <p>{errors.email}</p>}
            </div>
            <div>
                <label>Password</label>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                {errors.password && <p>{errors.password}</p>}
            </div>
        </div>
    );
};

export default Step2;
