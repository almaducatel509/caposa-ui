'use client';
import React, { useState, useEffect } from 'react';
import { MemberFormData, ErrorMessages } from './validations';

const MemberFormFields: React.FC<{
  formData: MemberFormData;
  setFormData: (data: Partial<MemberFormData>) => void;
  errors: ErrorMessages<MemberFormData>;
}> = ({ formData, setFormData, errors }) => {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const fields = [
      formData.first_name,
      formData.last_name,
      formData.id_number,
      formData.phone_number,
      formData.department,
      formData.city,
      formData.address,
      formData.gender,
      formData.date_of_birthday,
      formData.account_type,
      formData.account_number,
      formData.initial_balance,
      formData.membership_tier,
      formData.income_source,
    ];
    const filled = fields.filter((field) => field !== '' && field !== undefined && field !== null).length;
    setCompletion(Math.round((filled / fields.length) * 100));
  }, [formData]);

  const handleChange = (field: keyof MemberFormData, value: any) => {
    setFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Form Completion</span>
          <span className="text-sm font-bold text-green-600">{completion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations du membre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['first_name', 'Prénom'],
            ['last_name', 'Nom'],
            ['id_number', "Numéro d'identité"],
            ['phone_number', 'Téléphone'],
            ['department', 'Département'],
            ['city', 'Ville'],
            ['address', 'Adresse'],
            ['gender', 'Genre'],
            ['date_of_birthday', 'Date de naissance'],
            ['account_type', 'Type de compte'],
            ['account_number', 'Numéro de compte'],
            ['initial_balance', 'Solde initial'],
            ['membership_tier', "Niveau d'adhésion"],
            ['income_source', 'Source de revenu'],
          ].map(([field, label]) => (
            <div key={field as string}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
              <input
                type={field.includes('balance') ? 'number' : 'text'}
                value={(formData as any)[field] || ''}
                onChange={(e) => handleChange(field as keyof MemberFormData, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              {errors[field as keyof MemberFormData] && (
                <p className="text-red-500 text-sm mt-1">{errors[field as keyof MemberFormData]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberFormFields;
