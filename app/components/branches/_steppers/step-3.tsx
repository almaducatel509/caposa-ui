import React from 'react';
import { Button } from '@nextui-org/react';
import { BranchFormDataSchema } from '@/app/lib/schema'; // Adjust import path
import { z } from 'zod';

// Infer the TypeScript type from the schema
type BranchFormData = z.infer<typeof BranchFormDataSchema>;

interface Step3Props {
    formData: BranchFormData;
    handleSubmit: () => void;
    handleChangeDate: (event: React.ChangeEvent<HTMLInputElement>) => void;
    errors: {
        opening_date?: string;
        [key: string]: string | undefined;
    };
}

const Step3: React.FC<Step3Props> = ({ formData, handleSubmit, handleChangeDate, errors }) => {
    return (
        <div>
            <h2>Complete</h2>
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Opening Hours</h3>
                    {Object.entries(formData.opening_hours).map(([day, hours]) => (
                        <div key={day}>
                            <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {hours}
                        </div>
                    ))}
                    {formData.holidays && (
                        <div>
                            <strong>Holiday Date:</strong> {formData.holidays.date}
                            <div>
                                <strong>Holiday Description:</strong> {formData.holidays.description}
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Branch Information</h3>
                    <div>
                        <strong>Branch Name:</strong> {formData.branch_name}
                    </div>
                    <div>
                        <strong>Branch Address:</strong> {formData.branch_address}
                    </div>
                    <div>
                        <strong>Branch Phone Number:</strong> {formData.branch_phone_number}
                    </div>
                    <div>
                        <strong>Branch Email:</strong> {formData.branch_email}
                    </div>
                    <div>
                        <strong>Branch Manager ID:</strong> {formData.branch_manager_id}
                    </div>
                    <div>
                        <strong>Branch Code:</strong> {formData.branch_code}
                    </div>
                    <div>
                        <strong>Number of Posts:</strong> {formData.number_of_posts}
                    </div>
                    <div>
                        <strong>Number of Tellers:</strong> {formData.number_of_tellers}
                    </div>
                    <div>
                        <strong>Number of Clerks:</strong> {formData.number_of_clerks}
                    </div>
                    <div>
                        <strong>Number of Credit Officers:</strong> {formData.number_of_credit_officers}
                    </div>
                    <div className="space-y-2">
                        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                            <label htmlFor="opening_date">Opening Date</label>
                            <input
                                type="date"
                                id="opening_date"
                                value={formData.opening_date || ""}
                                onChange={handleChangeDate}
                                required
                                className="border rounded p-2"
                            />
                        </div>
                        {errors.opening_date && <div className='text-destructive text-red-600'>{errors.opening_date}</div>}
                    </div>
                </div>
                <Button onClick={handleSubmit} color="success">Submit</Button>
            </div>
        </div>
    );
};

export default Step3;
