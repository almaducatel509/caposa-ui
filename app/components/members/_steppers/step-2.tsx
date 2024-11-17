import React from 'react';
import { Step2Data, ErrorMessages } from '../validations';
import TitleDetails from './title-details';
import {Select,Input, SelectItem, Selection, Checkbox, Radio, RadioGroup, Textarea} from "@nextui-org/react";


interface Step2Props {
    formData: Step2Data;
    setFormData: (data: Partial<Step2Data>) => void;
    errors: ErrorMessages<Step2Data>;
}

const Step2: React.FC<Step2Props> = ({ formData, setFormData, errors }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
    
        // Convertir en nombre si le champ est de type "number"
        const parsedValue = type === 'number' ? Number(value) : value;
    
        setFormData({ ...formData, [name]: parsedValue });
        console.log("Le formData :", formData);
    };

    const handlemembership_tier = (value: string) => {
        setFormData({ ...formData, membership_tier: value });
        console.log('membership_tier: ',formData);
    };

    const handleaccount_type = (value: string) => {
        console.log("Valeur sélectionnée : ", value); // Vérifie la valeur
        setFormData({ ...formData, account_type: value });
    };

    return (
        <div>
            <TitleDetails text1="Informations de caisse" text2="Fournir vos informations de caisse" />
             {/* Password */}
            <div className="space-y-2">
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.password && <p className="text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
                <Input
                    label="Confirm Password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.confirm_password && <p className="text-red-600">{errors.confirm_password}</p>}
            </div>

            {/* Account Type */}
           <div className="space-y-2">
                <RadioGroup
                    label="Choisir le type de compte"
                    isRequired
                    orientation="horizontal"
                    name='account_type'
                    value={formData.account_type}
                    onValueChange={handleaccount_type}
                >
                    <Radio value="courant">Compte courant</Radio>
                    <Radio value="épargne">Comptes d’épargne</Radio>
                    <Radio value="rendement">Compte à rendement croissant en $ US</Radio>

                </RadioGroup>
                {errors.account_type && <div className='text-destructive text-red-600'>{errors.account_type}</div>}
            </div>

            {/* Account Number */}
            <div className="space-y-2">
                <Input
                    label="Account Number"
                    name="account_number"
                    type="text"
                    value={formData.account_number || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.account_number && <p className="text-red-600">{errors.account_number}</p>}
            </div>

            {/* Initial Balance */}
            <div className="space-y-2">
                <Input
                    label="Initial Balance"
                    name="initial_balance"
                    type="number"
                    value={formData.initial_balance?.toString() || ''}
                    onChange={handleChange}
                    isRequired
                />
                {errors.initial_balance && <p className="text-red-600">{errors.initial_balance}</p>}
            </div>

            <div className="space-y-2">
                    <RadioGroup
                        label="Choisir le Membership"
                        isRequired
                        orientation="horizontal"
                        name='membership'
                        value={formData.membership_tier}
                        onValueChange={handlemembership_tier}
                    >
                        <Radio value="Basic">Basic</Radio>
                        <Radio value="Premium">Premium</Radio>
                        <Radio value="Gold">Gold</Radio>

                    </RadioGroup>
                    {errors.membership_tier && <div className='text-destructive text-red-600'>{errors.membership_tier}</div>}
                </div>

            {/* Monthly Income */}
            <div className="space-y-2">
                <Input
                    label="Monthly Income"
                    name="monthly_income"
                    type="number"
                    value={formData.monthly_income?.toString() || ''}
                    onChange={handleChange}
                />
                {errors.monthly_income && <p className="text-red-600">{errors.monthly_income}</p>}
            </div>

            {/* Monthly Expenses */}
            <div className="space-y-2">
                <Input
                    label="Monthly Expenses"
                    name="monthly_expenses"
                    type="number"
                    value={formData.monthly_expenses?.toString() || ''}
                    onChange={handleChange}
                />
                {errors.monthly_expenses && <p className="text-red-600">{errors.monthly_expenses}</p>}
            </div>

            {/* Income Source */}
            <div className="space-y-2">
                <Input
                    label="Income Source"
                    name="income_source"
                    value={formData.income_source || ''}
                    onChange={handleChange}
                />
                {errors.income_source && <p className="text-red-600">{errors.income_source}</p>}
            </div>
           
        </div>
    );
};

export default Step2;
