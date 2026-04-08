"use client";

import React, { useEffect, useState } from "react";
import { X, UserPen, UserPlus, AlertTriangle, Loader2 } from "lucide-react";
import {
  EmployeeData, BranchData, Post, EmployeeFormData,
  ErrorMessages, employeeDataToFormData,
} from '../validations';
import { fetchBranches }                         from '@/app/lib/api/branche';
import { fetchPosts }                            from '@/app/lib/api/post';
import { createEmployee, putEmployeeMultipart }  from '@/app/lib/api/employee';
import EmployeeFormFields                        from '../EmployeeFormFields';
import { Modal }                                 from '../../ui/Modal';
import UserAvatar from "../../core/UserAvatar";

interface EditEmployeeModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: (updated: EmployeeData) => void;
  employee:  EmployeeData | null;
  branches?: BranchData[];
  posts?:    Post[];
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen, onClose, onSuccess, employee,
  branches: passedBranches = [], posts: passedPosts = [],
}) => {
  const isEditMode = !!employee;

  const EMPTY_FORM: EmployeeFormData = {
    user: { username: '', email: '', password: '', confirm_password: '' },
    first_name: '', last_name: '', date_of_birth: '', phone_number: '',
    address: '', gender: 'M', payment_ref: '', branch: '', posts: [],
    photo_profil: null,
  };

  const [formData,            setFormData]            = useState<EmployeeFormData>(EMPTY_FORM);
  const [errors,              setErrors]              = useState<ErrorMessages<EmployeeFormData>>({});
  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [apiError,            setApiError]            = useState<string | null>(null);
  const [branches,            setBranches]            = useState<BranchData[]>([]);
  const [posts,               setPosts]               = useState<Post[]>([]);
  const [isLoading,           setIsLoading]           = useState(true);
  const [keepCurrentPassword, setKeepCurrentPassword] = useState(true);

  const branchesToUse = passedBranches.length > 0 ? passedBranches : branches;
  const postsToUse    = passedPosts.length > 0    ? passedPosts    : posts;

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setApiError(null);
    setErrors({});

    const loadData = async () => {
      try {
        const needsBranches = passedBranches.length === 0;
        const needsPosts    = passedPosts.length === 0;
        if (needsBranches || needsPosts) {
          const [b, p] = await Promise.all([
            needsBranches ? fetchBranches() : Promise.resolve([]),
            needsPosts    ? fetchPosts()    : Promise.resolve([]),
          ]);
          if (needsBranches) setBranches(b);
          if (needsPosts)    setPosts(p);
        }
        if (isEditMode && employee) {
          const ef = employeeDataToFormData(employee);
          ef.user.password         = '';
          ef.user.confirm_password = '';
          setFormData(ef);
        } else {
          setFormData(EMPTY_FORM);
        }
      } catch (err: any) {
        setApiError(err?.message || 'Impossible de charger les données');
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
          if (formData.user.password)         userPayload.password         = formData.user.password;
          if (formData.user.confirm_password) userPayload.confirm_password = formData.user.confirm_password;
        }
        const payload = {
          first_name:    formData.first_name,
          last_name:     formData.last_name,
          date_of_birth: formData.date_of_birth,
          phone_number:  formData.phone_number,
          address:       formData.address,
          gender:        formData.gender,
          payment_ref:   formData.payment_ref,
          branch:        formData.branch,
          posts:         formData.posts,
          user:          userPayload,
        };
        const updated = await putEmployeeMultipart(String(employee.id), payload, { withPassword: !keepCurrentPassword });
        onSuccess(updated);
        onClose();
        return;
      }
      const created = await createEmployee(formData);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      const apiErrors = err?.response?.data || null;
      if (apiErrors && typeof apiErrors === 'object') {
        const nextErrors: Record<string, string> = {};
        const src = apiErrors.errors ?? apiErrors;
        Object.entries(src).forEach(([k, v]) => {
          nextErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
        });
        setErrors(nextErrors);
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
      if (data.user) updated.user = { ...prev.user, ...data.user };
      Object.keys(data).forEach(key => {
        if (key !== 'user' && data[key as keyof EmployeeFormData] !== undefined)
          (updated as any)[key] = data[key as keyof EmployeeFormData];
      });
      return updated;
    });
    if (Object.keys(data).length > 0) {
      setErrors(prev => {
        const e = { ...prev };
        Object.keys(data).forEach(k => delete e[k as keyof ErrorMessages<EmployeeFormData>]);
        return e;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
       <div className="shrink-0">
          {isEditMode ? (
            <UserAvatar
              user={{
                first_name: employee?.first_name ?? '',
                last_name:  employee?.last_name  ?? '',
                photo_profil: employee?.photo_profil,
              }}
              size="md"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#2E7D32]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {isEditMode ? "Modifier l'employe" : 'Nouvel employe'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditMode && employee
              ? `Mise a jour de ${employee.first_name} ${employee.last_name}`
              : "Ajouter un nouveau membre de l'equipe"}
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50">
        {apiError && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium">{apiError}</p>
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
            <p className="text-sm text-gray-500">Chargement des donnees…</p>
          </div>
        ) : (
          <EmployeeFormFields
            formData={formData}
            setFormData={handleFormUpdate}
            errors={errors}
            setErrors={setErrors}
            branches={branchesToUse}
            posts={postsToUse.map(p => ({
              id:        p.id,
              post_name: p.post_name || p.name || 'Poste inconnu',
              name:      p.name      || p.post_name || 'Poste inconnu',
            }))}
            isEditMode={isEditMode}
            onKeepPasswordChange={setKeepCurrentPassword}
          />
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 rounded-b-2xl">
        <p className="text-xs text-gray-400">
          {isEditMode
            ? 'Les modifications seront appliquees immediatement'
            : 'Tous les champs marques * sont obligatoires'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            {isSubmitting
              ? (isEditMode ? 'Mise a jour...' : 'Creation...')
              : (isEditMode ? 'Mettre a jour' : "Creer l'employe")}
          </button>
        </div>
      </div>

    </Modal>
  );
};

export default EditEmployeeModal;