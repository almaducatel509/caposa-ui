import React from 'react';
import { Input, DatePicker } from '@nextui-org/react';
import TitleDetails from './title-details';

interface Step2Props {
    formData: any; // Adjust based on your form data structure
    setFormData: (data: Partial<any>) => void;
    errors: any; // Adjust based on your error structure
}

const Step2: React.FC<Step2Props> = ({ formData, setFormData, errors }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div>
            <TitleDetails text1={'Branch Information'} text2={'Provide the branch details'} />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_name"
                        value={formData.branch_name || ''}
                        label="Branch Name"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_name && <div className='text-destructive text-red-600'>{errors.branch_name}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_address"
                        value={formData.branch_address || ''}
                        label="Branch Address"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_address && <div className='text-destructive text-red-600'>{errors.branch_address}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_phone_number"
                        value={formData.branch_phone_number || ''}
                        label="Branch Phone Number"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_phone_number && <div className='text-destructive text-red-600'>{errors.branch_phone_number}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="email"
                        name="branch_email"
                        value={formData.branch_email || ''}
                        label="Branch Email"
                        onChange={handleChange}
                    />
                    {errors.branch_email && <div className='text-destructive text-red-600'>{errors.branch_email}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_manager_id"
                        value={formData.branch_manager_id || ''}
                        label="Branch Manager ID"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_manager_id && <div className='text-destructive text-red-600'>{errors.branch_manager_id}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="branch_code"
                        value={formData.branch_code || ''}
                        label="Branch Code"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.branch_code && <div className='text-destructive text-red-600'>{errors.branch_code}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="number"
                        name="number_of_posts"
                        value={formData.number_of_posts || ''}
                        label="Number of Posts"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.number_of_posts && <div className='text-destructive text-red-600'>{errors.number_of_posts}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="number"
                        name="number_of_tellers"
                        value={formData.number_of_tellers || ''}
                        label="Number of Tellers"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.number_of_tellers && <div className='text-destructive text-red-600'>{errors.number_of_tellers}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="number"
                        name="number_of_clerks"
                        value={formData.number_of_clerks || ''}
                        label="Number of Clerks"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.number_of_clerks && <div className='text-destructive text-red-600'>{errors.number_of_clerks}</div>}
                </div>
                <div className="space-y-2">
                    <Input
                        type="number"
                        name="number_of_credit_officers"
                        value={formData.number_of_credit_officers || ''}
                        label="Number of Credit Officers"
                        onChange={handleChange}
                        isRequired
                    />
                    {errors.number_of_credit_officers && <div className='text-destructive text-red-600'>{errors.number_of_credit_officers}</div>}
                </div>
                <div className="space-y-2">
                    <DatePicker
                        label="Opening Date"
                        value={formData.opening_date || new Date()}
                        onChange={(date) => setFormData({ ...formData, opening_date: date })}
                        isRequired
                    />
                    {errors.opening_date && <div className='text-destructive text-red-600'>{errors.opening_date}</div>}
                </div>
            </div>
        </div>
    );
};

export default Step2;
