import React from 'react';
import { Input, DatePicker, Select, SelectItem } from '@nextui-org/react';
import TitleDetails from './title-details';
import { Step1Data } from '../validations'; // Import the type for Step1
import { Holiday } from '../../hollydays/validations'; // Assuming Holiday type is imported here

interface Step1Props {
    formData: Step1Data; // Using the derived type from Zod schema
    setFormData: (data: Partial<Step1Data>) => void;
    errors: Partial<Record<keyof Step1Data, string>>; // Errors based on Step1 fields
    availableHolidays: Holiday[]; // Pass available holidays from your data source
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors, availableHolidays }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleHolidayChange = (keys: Set<React.Key>) => {
        const selectedHolidays = Array.from(keys).map((key) => {
            const holiday = availableHolidays.find((h) => h.date.toString() === key);
            return holiday ? holiday : null;
        }).filter(Boolean) as Holiday[];
        setFormData({ ...formData, holidays: selectedHolidays });
    };

    return (
        <div>
            <TitleDetails text1="Branch Information" text2="Provide the branch details" />
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
                    {errors.branch_name && <div className="text-destructive text-red-600">{errors.branch_name}</div>}
                </div>

                {/* Other input fields following the same pattern */}

                <div className="space-y-2">
                    <DatePicker
                        label="Opening Date"
                        value={formData.opening_date || new Date()}
                        onChange={(date) => setFormData({ ...formData, opening_date: date })}
                        isRequired
                    />
                    {errors.opening_date && <div className="text-destructive text-red-600">{errors.opening_date}</div>}
                </div>

                <div className="space-y-2">
                    <Select
                        multiple
                        label="Select Holidays"
                        placeholder="Choose multiple holidays"
                        selectedKeys={new Set(formData.holidays?.map((holiday: { date: { toISOString: () => any; }; }) => holiday.date.toISOString()) || [])}
                        onSelectionChange={handleHolidayChange}
                    >
                        {availableHolidays.map((holiday) => (
                            <SelectItem key={holiday.date.toString()} value={holiday.date.toString()}>
                                {holiday.description} - {holiday.date.toString()}
                            </SelectItem>
                        ))}
                    </Select>
                    {errors.holidays && <div className="text-red-600">{errors.holidays}</div>}
                </div>
            </div>
        </div>
    );
};

export default Step1;
