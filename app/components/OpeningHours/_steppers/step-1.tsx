import React, { useState } from "react";
import { TimeInput } from "@nextui-org/react";
import { parseAbsoluteToLocal, Time } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import type {TimeValue} from "@react-types/datepicker";


interface OpeningHours {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
}

interface Step1Props {
    formData: OpeningHours;
    setFormData: React.Dispatch<React.SetStateAction<OpeningHours>>;
    errors: Partial<OpeningHours>;
}

const initialFormData: OpeningHours = {
    monday: "2024-04-08T08:00:00Z",
    tuesday: "2024-04-08T08:00:00Z",
    wednesday: "2024-04-08T08:00:00Z",
    thursday: "2024-04-08T08:00:00Z",
    friday: "2024-04-08T08:00:00Z",
    saturday: "2024-04-08T08:00:00Z",
    sunday: "2024-04-08T08:00:00Z",
};

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
    const handleTimeChange = (day: keyof OpeningHours, value: TimeValue) => {
        setFormData({ ...formData, [day]: value.toString() });
    };


    const getISODateTime = (time: string) => {
        const date = new Date();
        const [hours, minutes, seconds] = time.split(':');
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        return date.toISOString();
    };

    return (
        <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">Horaires d'ouverture</h2>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className="space-y-2">
                    <label htmlFor={day} className="block text-sm font-medium text-gray-700 capitalize">
                        {day}
                    </label>
                    <TimeInput
                        label={`${day.charAt(0).toUpperCase() + day.slice(1)} Time`}
                        value={formData[day as keyof OpeningHours] ? parseAbsoluteToLocal(getISODateTime(formData[day as keyof OpeningHours])) : new Time(8, 0)}
                        onChange={(value) => handleTimeChange(day as keyof OpeningHours, value)}
                    />
                    {errors[day as keyof OpeningHours] && <div className='text-red-600'>{errors[day as keyof OpeningHours]}</div>}
                </div>
            ))}
        </div>
    );
};

export default Step1;
