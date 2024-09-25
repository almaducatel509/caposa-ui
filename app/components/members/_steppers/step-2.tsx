import React from 'react';
import { Step2Data, ErrorMessages } from '../validations';
import TitleDetails from './title-details';

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
            <TitleDetails text1={'Informations de caisse'} text2={'Fournir vos informations de caisse'} />
            <div>
                <label>Email</label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                {errors.email && <p className="text-red-600">{errors.email}</p>}
            </div>
            <div>
                <label>Password</label>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                {errors.password && <p className="text-red-600">{errors.password}</p>}
            </div>
            <div>
                <label>Account Type</label>
                <input
                    type="text"
                    value={formData.account_type}
                    onChange={handleChange}
                />
                {errors.account_type && <p className="text-red-600">{errors.account_type}</p>}
            </div>
            <div>
                <label>Account Number</label>
                <input
                    type="text"
                    value={formData.account_number}
                    onChange={handleChange}
                />
                {errors.account_number && <p className="text-red-600">{errors.account_number}</p>}
            </div>
            <div>
                <label>Current Balance</label>
                <input
                    type="number"
                    value={formData.current_balance}
                    onChange={handleChange}
                />
                {errors.current_balance && <p className="text-red-600">{errors.current_balance}</p>}
            </div>  
            {/* Ajout des champs supplémentaires */}
            <div>
                <label>Loan Type</label>
                <input
                    type="text"
                    value={formData.loan_type}
                    onChange={handleChange}
                />
                {errors.loan_type && <p className="text-red-600">{errors.loan_type}</p>}
            </div>

            <div>
                <label>Loan Amount</label>
                <input
                    type="number"
                    value={formData.loan_amount}
                    onChange={handleChange}
                />
                {errors.loan_amount && <p className="text-red-600">{errors.loan_amount}</p>}
            </div>

            <div>
                <label>Interest Rate</label>
                <input
                    type="number"
                    value={formData.interest_rate}
                    onChange={handleChange}
                />
                {errors.interest_rate && <p className="text-red-600">{errors.interest_rate}</p>}
            </div>

            <div>
                <label>Loan Duration</label>
                <input
                    type="text"
                    value={formData.loan_duration}
                    onChange={handleChange}
                />
                {errors.loan_duration && <p className="text-red-600">{errors.loan_duration}</p>}
            </div>

            <div>
                <label>Payment Frequency</label>
                <input
                    type="text"
                    value={formData.payment_frequency}
                    onChange={handleChange}
                />
                {errors.payment_frequency && <p className="text-red-600">{errors.payment_frequency}</p>}
            </div>

            <div>
                <label>Security Question</label>
                <input
                    type="text"
                    value={formData.security_question}
                    onChange={handleChange}
                />
                {errors.security_question && <p className="text-red-600">{errors.security_question}</p>}
            </div>

            <div>
                <label>Security Answer</label>
                <input
                    type="text"
                    value={formData.security_answer}
                    onChange={handleChange}
                />
                {errors.security_answer && <p className="text-red-600">{errors.security_answer}</p>}
            </div>

            <div>
                <label>Additional Accounts</label>
                <input
                    type="text"
                    value={formData.additional_accounts}
                    onChange={handleChange}
                />
                {errors.additional_accounts && <p className="text-red-600">{errors.additional_accounts}</p>}
            </div>

            <div>
                <label>Monthly Income</label>
                <input
                    type="number"
                    value={formData.monthly_income}
                    onChange={handleChange}
                />
                {errors.monthly_income && <p className="text-red-600">{errors.monthly_income}</p>}
            </div>

            <div>
                <label>Monthly Expenses</label>
                <input
                    type="number"
                    value={formData.monthly_expenses}
                    onChange={handleChange}
                />
                {errors.monthly_expenses && <p className="text-red-600">{errors.monthly_expenses}</p>}
            </div>  
        </div>
    );
};

export default Step2;
