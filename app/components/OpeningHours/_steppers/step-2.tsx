import React from 'react';
import { OpeningHours } from '../validations';

interface Step2Props {
    formData: OpeningHours;
}

const Step2: React.FC<Step2Props> = ({ formData }) => {
    return (
        <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">Vérifiez les Horaires d'ouverture</h2>
            <ul>
                {Object.entries(formData).map(([day, hours]) => (
                    <li key={day}>
                        <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {hours || 'Fermé'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Step2;
