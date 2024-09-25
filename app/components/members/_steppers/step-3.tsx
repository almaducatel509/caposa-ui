import React from 'react';
import { Step3Data, ErrorMessages } from '../validations';

interface Step3Props {
    formData: Step3Data;
    setFormData: (data: Partial<Step3Data>) => void;
    errors: ErrorMessages<Step3Data>;
}

const Step3: React.FC<Step3Props> = ({ formData, setFormData, errors }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };

    return (
        <div>
            <h2 className='text-base font-semibold leading-7 text-gray-900'>
                Complete
            </h2>
            <p className='mt-1 text-sm leading-6 text-gray-600'>
                Thank you for your submission.
            </p>
        </div>
    );
};

export default Step3;
