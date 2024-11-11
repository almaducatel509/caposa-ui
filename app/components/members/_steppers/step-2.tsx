import React from 'react';
import { Step2Data, ErrorMessages } from '../validations';
import TitleDetails from './title-details';
import { Autocomplete, AutocompleteItem, Input, Radio, RadioGroup } from '@nextui-org/react';
import { format } from 'path';


interface Step2Props {
    formData: Step2Data;
    setFormData: (data: Partial<Step2Data>) => void;
    errors: ErrorMessages<Step2Data>;
}

const Step2: React.FC<Step2Props> = ({ formData, setFormData, errors }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        console.log('Form Data:', formData);
    };

    const handleRadio = (value: string) => {
        setFormData({ account_type: value });
        console.log("Genre sélectionné :", value); // Console pour vérifier le sexe sélectionné
    };

    return (
        <div>
            <TitleDetails text1="Informations de caisse" text2="Fournir vos informations de caisse" />
            <div className="space-y-2">
                <div className="flex flex-col gap-3">
                <RadioGroup
                    label="Sélectionner le type de compte"
                    value={formData.account_type}
                    onValueChange={handleRadio}
                    className="space-y-2"
                    isRequired
                >
                    <Radio value="checking-account" className="flex items-center">Compte courant</Radio>
                    <Radio value="savings-account" className="flex items-center">Compte d'épargne</Radio>
                    <Radio value="personal-loan-account" className="flex items-center">Compte de prêt personnel</Radio>
                    <Radio value="business-account" className="flex items-center">Compte d'entreprise</Radio>
                </RadioGroup>

                </div>
                {errors.loan_type && <p className="text-red-600">{errors.account_type}</p>}
            </div>
            <div className="space-y-2">
                <Input
                    label="Account Number"
                    name="account_number"
                    type="text"
                    value={formData.account_number} 
                    onChange={handleChange}
                    isRequired
                />
                {errors.account_number && <p className="text-red-600">{errors.account_number}</p>}
            </div>

            <div className="space-y-2">
                <Input
                    label="Current Balance"
                    name="current_balance"
                    type="number"
                    value={formData.current_balance?.toString() || ''}
                    onChange={handleChange}
                    isRequired
                    endContent={
                        <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">G</span> 
                        </div>
                    }
                />
                {errors.current_balance && <p className="text-red-600">{errors.current_balance}</p>}
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
                            <span className="text-default-400 text-small">G</span> 
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
                            <span className="text-default-400 text-small">G</span> 
                        </div>
                    }
                />
                {errors.monthly_expenses && <p className="text-red-600">{errors.monthly_expenses}</p>}
            </div>

            <div className="space-y-2">
                <Input
                    label="Security Question"
                    name="security_question"
                    type="text"
                    value={formData.security_question || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.security_question && <p className="text-red-600">{errors.security_question}</p>}
            </div>

            <div className="space-y-2">
                <Input
                    label="Security Answer"
                    name="security_answer"
                    type="text"
                    value={formData.security_answer || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.security_answer && <p className="text-red-600">{errors.security_answer}</p>}
            </div>
        </div>
    );
};

export default Step2;
