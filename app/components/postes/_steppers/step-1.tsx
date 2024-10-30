import React from "react";
import { Input, Textarea, Checkbox } from "@nextui-org/react";
import { Post, ErrorMessages } from '../validations';

interface Step1Props {
    formData: Post;
    setFormData: (data: Partial<Post>) => void;
    errors: ErrorMessages<Post>;
}

const Step1: React.FC<Step1Props> = ({ formData, setFormData, errors }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };

    const handleCheckboxChange = (name: keyof Post, checked: boolean) => {
        setFormData({ [name]: checked });
    };

    return (
        <div className="capitalize">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Post Details</h2>

            {/* Name Field */}
            <div className="space-y-2">
                <Input
                    type="text"
                    label="Name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                />
                {errors.name && <div className="text-red-600">{errors.name}</div>}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
                <Textarea
                    label="Description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                />
                {errors.description && <div className="text-red-600">{errors.description}</div>}
            </div>

            {/* Deposit Checkbox */}
            <div className="space-y-2">
                <Checkbox
                    isSelected={formData.deposit || false}
                    onChange={(e) => handleCheckboxChange("deposit", e.target.checked)}
                >
                    Deposit
                </Checkbox>
                {errors.deposit && <div className="text-red-600">{errors.deposit}</div>}
            </div>

            {/* Withdrawal Checkbox */}
            <div className="space-y-2">
                <Checkbox
                    isSelected={formData.withdrawal || false}
                    onChange={(e) => handleCheckboxChange("withdrawal", e.target.checked)}
                >
                    Withdrawal
                </Checkbox>
                {errors.withdrawal && <div className="text-red-600">{errors.withdrawal}</div>}
            </div>

            {/* Transfer Checkbox */}
            <div className="space-y-2">
                <Checkbox
                    isSelected={formData.transfer || false}
                    onChange={(e) => handleCheckboxChange("transfer", e.target.checked)}
                >
                    Transfer
                </Checkbox>
                {errors.transfer && <div className="text-red-600">{errors.transfer}</div>}
            </div>
        </div>
    );
};

export default Step1;
