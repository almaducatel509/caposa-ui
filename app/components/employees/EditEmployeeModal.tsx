"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FaEdit, FaPlus } from 'react-icons/fa';
import UserAvatar from '@/app/components/core/UserAvatar';
import { 
  EmployeeData, 
  BranchData, 
  Post, 
  EmployeeFormData, 
  ErrorMessages,
  employeeDataToFormData
} from './validations';
import { fetchBranches } from '@/app/lib/api/branche';
import { fetchPosts } from '@/app/lib/api/post';
import { createEmployee } from '@/app/lib/api/employee';
import EmployeeFormFields from './EmployeeFormFields';
import { putEmployeeMultipart } from '@/app/lib/api/employee';
import { Modal } from "../ui/Modal";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: EmployeeData) => void;
  employee: EmployeeData | null;
  branches?: BranchData[];
  posts?: Post[];
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
  branches: passedBranches = [],
  posts: passedPosts = []
}) => {
  const isEditMode = !!employee;

  const [formData, setFormData] = useState<EmployeeFormData>({
    user: { username: '', email: '', password: '', confirm_password: '' },
    first_name: '', last_name: '', date_of_birth: '', phone_number: '',
    address: '', gender: 'M', payment_ref: '', branch: '', posts: [],
    photo_profil: null,
  });

  const [errors, setErrors] = useState<ErrorMessages<EmployeeFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keepCurrentPassword, setKeepCurrentPassword] = useState(true);

  const branchesToUse = passedBranches.length > 0 ? passedBranches : branches;
  const postsToUse = passedPosts.length > 0 ? passedPosts : posts;

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        
        const needsBranches = passedBranches.length === 0;
        const needsPosts = passedPosts.length === 0;
        
        if (needsBranches || needsPosts) {
          const [branchesData, postsData] = await Promise.all([
            needsBranches ? fetchBranches() : Promise.resolve([]),
            needsPosts ? fetchPosts() : Promise.resolve([])
          ]);
          
          if (needsBranches) setBranches(branchesData);
          if (needsPosts) setPosts(postsData);
        }
        
        if (isEditMode && employee) {
          const editFormData = employeeDataToFormData(employee);
          editFormData.user.password = '';
          editFormData.user.confirm_password = '';
          setFormData(editFormData);
        }
        
      } catch (err: any) {
        console.error("Error loading Employee data:", err);
        setApiError(err?.message || "Unable to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, employee]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);
    setErrors({});

    try {
      if (isEditMode && employee?.id) {
        const userPayload: any = {};
        if (formData.user.username && formData.user.username !== employee.user?.username) 
          userPayload.username = formData.user.username;
        if (formData.user.email && formData.user.email !== employee.user?.email) 
          userPayload.email = formData.user.email;
        if (!keepCurrentPassword) {
          if (formData.user.password) userPayload.password = formData.user.password;
          if (formData.user.confirm_password) userPayload.confirm_password = formData.user.confirm_password;
        }

        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          phone_number: formData.phone_number,
          address: formData.address,
          gender: formData.gender,
          payment_ref: formData.payment_ref,
          branch: formData.branch,
          posts: formData.posts,
          user: userPayload,
        };

        const updated = await putEmployeeMultipart(String(employee.id), payload, {
          withPassword: !keepCurrentPassword,
        });

        onSuccess(updated);
        onClose();
        return;
      }

      const created = await createEmployee(formData);
      onSuccess(created);
      onClose();

    } catch (err: any) {
      console.error('Submit error (employee):', err);

      const apiErrors = err?.response?.data || err?.response?.data?.errors || null;
      if (apiErrors) {
        const nextErrors: Record<string, string> = {};
        if (apiErrors.errors && typeof apiErrors.errors === 'object') {
          Object.entries(apiErrors.errors).forEach(([k, v]) => {
            nextErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
          });
          setErrors(nextErrors);
        } else if (typeof apiErrors === 'object') {
          Object.entries(apiErrors).forEach(([k, v]) => {
            nextErrors[k] = String(v);
          });
          setErrors(nextErrors);
        } else {
          setApiError(err?.message || 'Erreur inconnue');
        }
      } else {
        setApiError(err?.message || 'Erreur inconnue');
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormUpdate = (data: Partial<EmployeeFormData>) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      if (data.user) {
        updated.user = { ...prev.user, ...data.user };
      }
      
      Object.keys(data).forEach(key => {
        if (key !== 'user' && data[key as keyof EmployeeFormData] !== undefined) {
          (updated as any)[key] = data[key as keyof EmployeeFormData];
        }
      });
      
      return updated;
    });
    
    if (Object.keys(data).length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(data).forEach(key => {
          delete newErrors[key as keyof ErrorMessages<EmployeeFormData>];
        });
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white p-6 rounded-t-2xl relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          {isEditMode && employee ? (
            <UserAvatar user={employee} size="sm" type="employee" className="ring-2 ring-white/50" />
          ) : (
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/50">
              <FaPlus className="text-white" size={18} />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isEditMode && <FaEdit size={16} />}
              <h3 className="text-xl font-bold">
                {isEditMode ? 'Modifier Employé' : 'Nouvel Employé'}
              </h3>
            </div>
            <p className="text-sm opacity-90 mt-1">
              {isEditMode && employee 
                ? `Mise à jour de ${employee.first_name} ${employee.last_name}`
                : 'Ajouter un nouveau membre de l\'équipe'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50">
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-red-700 font-medium">{apiError}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#34963d] border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
          </div>
        ) : (
          <EmployeeFormFields
            formData={formData}
            setFormData={handleFormUpdate}
            errors={errors}
            setErrors={setErrors}
            branches={branchesToUse}
            posts={postsToUse.map(post => ({
              id: post.id,
              post_name: post.post_name || post.name || 'Unknown Position',
              name: post.name || post.post_name || 'Unknown Position'
            }))}
            isEditMode={isEditMode}
            onKeepPasswordChange={setKeepCurrentPassword} 
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between rounded-b-2xl">
        <div className="text-sm text-gray-600">
          {isEditMode ? (
            <span>💡 Les modifications seront appliquées immédiatement</span>
          ) : (
            <span>💡 Tous les champs marqués * sont obligatoires</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white hover:from-[#2d8235] hover:to-[#196158] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            {isSubmitting
              ? (isEditMode ? "Mise à jour..." : "Création...")
              : (isEditMode ? "Mettre à jour" : "Créer l'employé")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditEmployeeModal;