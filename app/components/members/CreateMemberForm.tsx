"use client";

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { createMember } from '@/app/lib/api/member';

interface MemberFormData {
  first_name: string;
  last_name: string;
  id_number: string;
  phone_number: string;
  department: string;
  city: string;
  address: string;
  gender: 'M' | 'F';
  date_of_birthday: string;
}

interface ErrorMessages<T> {
  [K in keyof T]?: string;
}

interface CreateMemberFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const CreateMemberForm: React.FC<CreateMemberFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: '',
    last_name: '',
    id_number: '',
    phone_number: '',
    department: '',
    city: '',
    address: '',
    gender: 'M',
    date_of_birthday: '',
  });

  const [errors, setErrors] = useState<ErrorMessages<MemberFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: ErrorMessages<MemberFormData> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'Prénom requis';
    if (!formData.last_name.trim()) newErrors.last_name = 'Nom requis';
    if (!formData.id_number.trim()) newErrors.id_number = 'Numéro d\'identité requis';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Téléphone requis';
    if (!formData.department.trim()) newErrors.department = 'Département requis';
    if (!formData.city.trim()) newErrors.city = 'Ville requise';
    if (!formData.address.trim()) newErrors.address = 'Adresse requise';
    if (!formData.date_of_birthday) newErrors.date_of_birthday = 'Date de naissance requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof MemberFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createMember(formData);
      setSuccessMessage('Membre créé avec succès!');
      setTimeout(onSuccess, 1500);
    } catch (error: any) {
      console.error('Erreur création membre:', error);
      setApiError(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{apiError}</div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">{successMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Prénom" value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
        <input placeholder="Nom" value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
        <input placeholder="Numéro d'identité" value={formData.id_number} onChange={(e) => handleChange('id_number', e.target.value)} />
        <input placeholder="Téléphone" value={formData.phone_number} onChange={(e) => handleChange('phone_number', e.target.value)} />
        <input placeholder="Département" value={formData.department} onChange={(e) => handleChange('department', e.target.value)} />
        <input placeholder="Ville" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />
        <input placeholder="Adresse" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
        <input type="date" value={formData.date_of_birthday} onChange={(e) => handleChange('date_of_birthday', e.target.value)} />
      </div>

      <div className="flex gap-4 justify-end pt-6 border-t">
        {onCancel && (
          <Button variant="light" onPress={onCancel} isDisabled={isSubmitting}>Annuler</Button>
        )}
        <Button 
          className="bg-[#34963d] text-white hover:bg-[#1e7367]" 
          onPress={handleSubmit} 
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Création...' : 'Créer le membre'}
        </Button>
      </div>
    </div>
  );
};

export default CreateMemberForm;
