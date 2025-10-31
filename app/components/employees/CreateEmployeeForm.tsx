"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { 
  EmployeeFormData, 
  ErrorMessages,
  BranchData, 
  PostData 
} from './validations';
import { fetchBranches } from '@/app/lib/api/branche';
import { fetchPosts } from '@/app/lib/api/post';
import EmployeeFormFields from './EmployeeFormFields';
import { createEmployee } from '@/app/lib/api/employee'; 

interface CreateEmployeeFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const CreateEmployeeForm: React.FC<CreateEmployeeFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  // Initialize with proper structure
  const [formData, setFormData] = useState<EmployeeFormData>({
    user: {
      username: '',
      email: '',
      password: '',
      confirm_password: '',
    },
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    address: '',
    gender: 'M',
    payment_ref: '',
    photo_profil: undefined,
    branch: '',
    posts: [],
  });

  const [errors, setErrors] = useState<ErrorMessages<EmployeeFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch branches and posts data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, postsData] = await Promise.all([
          fetchBranches(),
          fetchPosts()
        ]);
        setBranches(branchesData);
        setPosts(postsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setApiError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Enhanced setFormData function to handle partial updates
  const handleSetFormData = (data: Partial<EmployeeFormData>) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      // Handle nested user object updates
      if (data.user) {
        updated.user = { ...prev.user, ...data.user };
      }
      
      // Handle other properties
      Object.keys(data).forEach(key => {
        if (key !== 'user' && data[key as keyof EmployeeFormData] !== undefined) {
          (updated as any)[key] = data[key as keyof EmployeeFormData];
        }
      });
      
      return updated;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorMessages<EmployeeFormData> = {};
    
    // Validate required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est requis';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Le nom est requis';
    }
    if (!formData.user.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }
    if (!formData.user.email.trim()) {
      newErrors.email = 'L\'email est requis';
    }
    if (!formData.user.password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    }
    if (formData.user.password !== formData.user.confirm_password) {
      newErrors.confirm_password = 'Les mots de passe doivent être identiques';
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Le téléphone est requis';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    if (!formData.branch) {
      newErrors.branch = 'La branche est requise';
    }
    if (!formData.posts.length) {
      newErrors.posts = 'Au moins un poste est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createEmployee(formData);
      
      setSuccessMessage('Employé créé avec succès!');
      
      // Wait a bit to show success message, then call onSuccess
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      setApiError(error.message || 'Erreur lors de la création de l\'employé');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      user: {
        username: '',
        email: '',
        password: '',
        confirm_password: '',
      },
      first_name: '',
      last_name: '',
      date_of_birth: '',
      phone_number: '',
      address: '',
      gender: 'M',
      payment_ref: '',
      photo_profil: undefined,
      branch: '',
      posts: [],
    });
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34963d] mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  function setKeepCurrentPassword(keepCurrent: boolean): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {apiError}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <EmployeeFormFields
        formData={formData}
        setFormData={handleSetFormData}
        errors={errors}
        setErrors={setErrors}
        branches={branches}
        posts={posts.map(post => ({ 
          id: post.id, 
          name: post.post_name || post.name || '',
          post_name: post.post_name 
        }))}
        isEditMode={false}
      />

      <div className="flex gap-4 justify-end pt-6 border-t">
        {onCancel && (
          <Button 
            variant="light" 
            onPress={onCancel}
            isDisabled={isSubmitting}
            className="text-[#2c2e2f]"
          >
            Annuler
          </Button>
        )}
        <Button 
          variant="light" 
          onPress={handleReset}
          isDisabled={isSubmitting}
          className="text-[#2c2e2f]"
        >
          Réinitialiser
        </Button>
        <Button 
          className="bg-[#34963d] text-white hover:bg-[#1e7367] transition-colors"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          {isSubmitting ? "Création..." : "Créer l'employé"}
        </Button>
      </div>
    </div>
  );
};

export default CreateEmployeeForm;