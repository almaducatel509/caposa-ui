"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { FaEdit, FaPlus } from 'react-icons/fa';
import UserAvatar from '@/app/components/core/UserAvatar';
import { 
  EmployeeData, 
  BranchData, 
  PostData, 
  EmployeeFormData, 
  ErrorMessages,
  employeeDataToFormData
} from './validations';
import { fetchBranches } from '@/app/lib/api/branche';
import { fetchPosts } from '@/app/lib/api/post';
import { updateEmployee, createEmployee } from '@/app/lib/api/employee';
import EmployeeFormFields from './EmployeeFormFields';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: EmployeeData | null; // null = create mode, object = edit mode
  branches?: BranchData[];
  posts?: PostData[];
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee, // Seul prop nécessaire pour déterminer le mode
  branches: passedBranches = [],
  posts: passedPosts = []
}) => {
  // ✅ Mode automatiquement déduit
  const isEditMode = !!employee;
  
  console.log('🎯 Modal opened:', {
    mode: isEditMode ? 'EDIT' : 'CREATE',
    employee: employee ? `${employee.first_name} ${employee.last_name}` : 'none'
  });

  // ✅ États simplifiés
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
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keepCurrentPassword, setKeepCurrentPassword] = useState(true);
  // ✅ Données à utiliser (passed props ou état local)
  const branchesToUse = passedBranches.length > 0 ? passedBranches : branches;
  const postsToUse = passedPosts.length > 0 ? passedPosts : posts;

  // ✅ Initialisation simplifiée
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        
        // Charger les données de référence seulement si pas déjà passées
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
        
        // ✅ Initialisation du formulaire
        if (isEditMode && employee) {
          // Mode EDIT : pré-remplir avec les données existantes
          const editFormData = employeeDataToFormData(employee);
          // En mode edit, on vide les mots de passe par défaut
          editFormData.user.password = '';
          editFormData.user.confirm_password = '';
          setFormData(editFormData);
          console.log('📝 Form pre-filled for edit:', editFormData);
        } else {
          // Mode CREATE : formulaire vide
          console.log('📝 Empty form for create mode');
        }
        
      } catch (error) {
        console.error("❌ Error loading data:", error);
        setApiError("Unable to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, employee]); // Dépendances simplifiées

  // ✅ Soumission simplifiée
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      console.log('🚀 Submitting:', { mode: isEditMode ? 'EDIT' : 'CREATE', formData });

      if (isEditMode && employee?.id) {
    // 1️⃣ Construction du userPayload
      const userPayload: any = {};

      if (formData.user.username !== employee.user?.username) {
        userPayload.username = formData.user.username;
      }
      if (formData.user.email !== employee.user?.email) {
        userPayload.email = formData.user.email;
      }
      if (!keepCurrentPassword) {
        if (formData.user.password) userPayload.password = formData.user.password;
        if (formData.user.confirm_password) userPayload.confirm_password = formData.user.confirm_password;
      }
      if (formData.user.username !== employee.user?.username) {
        userPayload.username = formData.user.username;
      }
      if (formData.user.email !== employee.user?.email) {
        userPayload.email = formData.user.email;
      }

      // 2️⃣ Construction du payload complet
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
        user: userPayload, // ✅ clé importante
      };

      // 3️⃣ Envoi à l’API
      const result = await updateEmployee(employee.id, formData, keepCurrentPassword);

      console.log('✅ Update successful:', result);

      if (onSuccess) {
        onSuccess(); // Actualiser
      }
      onClose(); // Fermer modal
    }
  else {
      // CREATE mode (inchangé)
      await createEmployee(formData);
      console.log('✅ Create successful');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    }

  } catch (error: any) {
      console.error('❌ Submit error:', error);
      const action = isEditMode ? 'updating' : 'creating';
      setApiError(`Error ${action} employee: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handler pour mise à jour du formulaire
  const handleFormUpdate = (data: Partial<EmployeeFormData>) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      // Gestion spéciale pour l'objet user
      if (data.user) {
        updated.user = { ...prev.user, ...data.user };
      }
      
      // Autres propriétés
      Object.keys(data).forEach(key => {
        if (key !== 'user' && data[key as keyof EmployeeFormData] !== undefined) {
          (updated as any)[key] = data[key as keyof EmployeeFormData];
        }
      });
      
      return updated;
    });
    
    // Clear errors for updated fields
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

  // ✅ Early return si modal fermé
  if (!isOpen) return null;

  return (
    <Modal 
      isDismissable={false}
      isOpen={isOpen} 
      onClose={onClose} 
      size="5xl" 
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "max-h-[95vh]",
        wrapper: "z-[9999]",
        backdrop: "z-[9998]",
        body: "overflow-y-auto max-h-[85vh] px-6"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white">
          {/* Avatar/Icon */}
          {isEditMode && employee ? (
            <UserAvatar user={employee} size="sm" type="employee" />
          ) : (
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FaPlus className="text-white" />
            </div>
          )}
          
          {isEditMode && <FaEdit />}
          
          <div>
            <h3 className="text-lg font-bold">
              {isEditMode ? 'Edit Employee' : 'Create Employee'}
            </h3>
            <p className="text-sm opacity-90">
              {isEditMode && employee 
                ? `Update ${employee.first_name} ${employee.last_name}'s information`
                : 'Add a new employee to the team'
              }
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="p-6">
          {/* Messages d'erreur */}
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {apiError}
            </div>
          )}

          {/* Loading ou formulaire */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34963d] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
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
        </ModalBody>

        <ModalFooter className="bg-gray-50 border-t">
          <Button 
            variant="light" 
            onPress={onClose}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#34963d] text-white hover:bg-[#1e7367]"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting || isLoading}
          >
            {isSubmitting 
              ? (isEditMode ? "Updating..." : "Creating...") 
              : (isEditMode ? "Update" : "Create")
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditEmployeeModal;

