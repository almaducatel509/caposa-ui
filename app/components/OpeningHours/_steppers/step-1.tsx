import React, { useState } from "react";
import { TimeInput } from "@nextui-org/react";
import { parseAbsoluteToLocal, Time } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import type {TimeValue} from "@react-types/datepicker";


interface OpeningHours {
    monday_open: string;
    monday_close: string;
    tuesday_open: string;
    tuesday_close: string;
    wednesday_open: string;
    wednesday_close: string;
    thursday_open: string;
    thursday_close: string;
    friday_open: string;
    friday_close: string;
    saturday_open: string;
    saturday_close: string;
    sunday_open: string;
    sunday_close: string;
}

interface Step1Props {
    formData: OpeningHours;
    setFormData: React.Dispatch<React.SetStateAction<OpeningHours>>;
    errors: Partial<OpeningHours>;
}
const initialFormData: OpeningHours = {
    monday_open: "08:00",
    monday_close: "17:00",
    tuesday_open: "08:00",
    tuesday_close: "17:00",
    wednesday_open: "08:00",
    wednesday_close: "17:00",
    thursday_open: "08:00",
    thursday_close: "17:00",
    friday_open: "08:00",
    friday_close: "17:00",
    saturday_open: "08:00",
    saturday_close: "12:00",
    sunday_open: "08:00",
    sunday_close: "12:00",
};
const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
    const handleTimeChange = (day: keyof OpeningHours, type: 'open' | 'close', value: TimeValue) => {
        const field = `${day}_${type}` as keyof OpeningHours;
        setFormData({ ...formData, [field]: value.toString() });
    };

    const getISODateTime = (time: string) => {
        const date = new Date();
        const [hours, minutes, seconds] = time.split(':');
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        return date.toISOString();
    };

    return (
        <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">Horaires d'ouverture et de fermeture</h2>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className="space-y-2">
                    <label htmlFor={`${day}_open`} className="block text-sm font-medium text-gray-700 capitalize">
                        {day} (Ouverture)
                    </label>
                    <TimeInput
                        label={`${day.charAt(0).toUpperCase() + day.slice(1)} Opening Time`}
                        value={formData[`${day}_open` as keyof OpeningHours] ? parseAbsoluteToLocal(getISODateTime(formData[`${day}_open` as keyof OpeningHours])) : new Time(8, 0)}
                        onChange={(value) => handleTimeChange(day as keyof OpeningHours, 'open', value)}
                    />
                    {errors[`${day}_open` as keyof OpeningHours] && <div className='text-red-600'>{errors[`${day}_open` as keyof OpeningHours]}</div>}

                    <label htmlFor={`${day}_close`} className="block text-sm font-medium text-gray-700 capitalize">
                        {day} (Fermeture)
                    </label>
                    <TimeInput
                        label={`${day.charAt(0).toUpperCase() + day.slice(1)} Closing Time`}
                        value={formData[`${day}_close` as keyof OpeningHours] ? parseAbsoluteToLocal(getISODateTime(formData[`${day}_close` as keyof OpeningHours])) : new Time(18, 0)}
                        onChange={(value) => handleTimeChange(day as keyof OpeningHours, 'close', value)}
                    />
                    {errors[`${day}_close` as keyof OpeningHours] && <div className='text-red-600'>{errors[`${day}_close` as keyof OpeningHours]}</div>}
                </div>
            ))}
        </div>
    );
};

export default Step1;
