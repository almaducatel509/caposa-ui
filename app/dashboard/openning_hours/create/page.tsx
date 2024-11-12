import React from 'react';
import RegisterForm from "@/app/components/OpeningHours/register_form";
import AxiosInstance from '@/app/lib/axiosInstance';
import { OpeningHours } from '@/app/components/OpeningHours/validations';

export default function OpeningHourForm() {
    const handleSubmit = async (formData: OpeningHours) => {
        try {
            const response = await AxiosInstance.post('/api/opening-hours', formData);
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <main className="w-full bg-white">
            <div className="text-2xl font-semibold">Create Opening Hours</div>
            <div className="bg-white">
                {/* <RegisterForm onSubmit={handleSubmit} /> */}
            </div>
        </main>
    );
}
