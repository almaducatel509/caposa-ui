import React from 'react';
import { Step2Data, ErrorMessages } from '../validations';
import TitleDetails from './title-details';
import { Input } from '@nextui-org/react';

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
            <TitleDetails text1="Informations de caisse" text2="Fournir vos informations de caisse" />

            <div className="space-y-2">
                <Input
                    label="Current Balance"
                    name="current_balance"
                    type="number"
                    value={formData.current_balance?.toString() || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.current_balance && <p className="text-red-600">{errors.current_balance}</p>}
            </div>

            <div className="space-y-2">
                <Input
                    label="Loan Amount"
                    name="loan_amount"
                    type="number"
                    value={formData.loan_amount?.toString() || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.loan_amount && <p className="text-red-600">{errors.loan_amount}</p>}
            </div>

            <div className="space-y-2">
                <Input
                    label="Interest Rate (%)"
                    name="interest_rate"
                    type="number"
                    value={formData.interest_rate?.toString() || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.interest_rate && <p className="text-red-600">{errors.interest_rate}</p>}
            </div>

            <div className="space-y-2">
                <Input
                    label="Monthly Income"
                    name="monthly_income"
                    type="number"
                    value={formData.monthly_income?.toString() || ''}
                    onChange={handleChange}
                    isRequired
                    endContent={
                        <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">G</span> {/* Changement de $ à G */}
                        </div>
                    }
                />
                {errors.monthly_income && <p className="text-red-600">{errors.monthly_income}</p>}
            </div>

            <div className="space-y-2">
                <Input
                    label="Monthly Expenses"
                    name="monthly_expenses"
                    type="number"
                    value={formData.monthly_expenses?.toString() || ''}
                    onChange={handleChange}
                    isRequired
                    endContent={
                        <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">G</span> {/* Changement de $ à G */}
                        </div>
                    }
                />
                {errors.monthly_expenses && <p className="text-red-600">{errors.monthly_expenses}</p>}
            </div>
        </div>
    );
};

export default Step2;
