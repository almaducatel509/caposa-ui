'use client';

import React, { useState, useEffect } from 'react';
import CompteFormFields from '../CompteFormFields';
import { createAccountSchema, updateAccountSchema } from '../validationsaccount';
import type { AccountData } from '../validationsaccount';
import { createAccount, updateAccount } from '@/app/lib/api/accounts';

// ============= MODAL COMPONENT =============
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'lg' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        {children}
      </div>
    </div>
  );
};

// ============= BUTTON COMPONENT =============
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'light';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  type = 'button'
}) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800",
    light: "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${loading ? 'relative' : ''}`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
};

// ============= TYPES =============
interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountData | null; 
  onSuccess: (account: AccountData) => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess
}) => {
  const isEditMode = !!account;

  // ============= FORM STATE =============
  const [formData, setFormData] = useState({
    id_membre: "",
    typeCompte: "" as "epargne" | "cheques" | "terme" | "",
    statutCompte: "actif" as "actif" | "ferme" | "suspendu",
    dateOuverture: new Date().toISOString().split('T')[0],
    dateFermeture: null as string | null,
    tauxInteret: null as number | null,
    limiteTrait: null as number | null,
    fraisServiceMensuel: null as number | null,
    member_details: undefined as any,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ============= INIT FORM DATA =============
  useEffect(() => {
    if (account) {
      setFormData({
        id_membre: account.id_membre || account.member || "",
        typeCompte: account.typeCompte || "",
        statutCompte: account.statutCompte || "actif",
        dateOuverture: account.dateOuverture || account.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        dateFermeture: account.dateFermeture || null,
        tauxInteret: account.tauxInteret || null,
        limiteTrait: account.limiteTrait || null,
        fraisServiceMensuel: account.fraisServiceMensuel || null,
        member_details: account.member_details,
      });
    } else {
      setFormData({
        id_membre: "",
        typeCompte: "",
        statutCompte: "actif",
        dateOuverture: new Date().toISOString().split('T')[0],
        dateFermeture: null,
        tauxInteret: null,
        limiteTrait: null,
        fraisServiceMensuel: null,
        member_details: undefined,
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [account, isOpen]);

  // ============= HANDLERS =============
  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setSubmitError(null);

    const updatedField = Object.keys(updates)[0];
    if (updatedField) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[updatedField];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      if (isEditMode) {
        const payload = {
          statutCompte: formData.statutCompte,
          tauxInteret: formData.tauxInteret,
          limiteTrait: formData.limiteTrait,
          fraisServiceMensuel: formData.fraisServiceMensuel,
          dateFermeture: formData.dateFermeture,
        };

        const validation = updateAccountSchema.safeParse(payload);
        if (!validation.success) {
          const zodErrors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
            if (err.path[0]) zodErrors[err.path[0] as string] = err.message;
          });
          setErrors(zodErrors);
          return;
        }

        const updated = await updateAccount(account.id, validation.data);
        onSuccess(updated);

      } else {
        const payload = {
          id_membre: formData.id_membre,
          typeCompte: formData.typeCompte,
          statutCompte: formData.statutCompte,
          dateOuverture: formData.dateOuverture,
          tauxInteret: formData.tauxInteret,
          limiteTrait: formData.limiteTrait,
          fraisServiceMensuel: formData.fraisServiceMensuel,
        };

        const validation = createAccountSchema.safeParse(payload);
        if (!validation.success) {
          const zodErrors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
            if (err.path[0]) zodErrors[err.path[0] as string] = err.message;
          });
          setErrors(zodErrors);
          return;
        }

        const created = await createAccount(validation.data);
        onSuccess(created);
      }

    } catch (error: any) {
      console.error("❌ Erreur soumission:", error);

      if (error?.errors) {
        const zodErrors: Record<string, string> = {};
        error.errors.forEach((e: any) => {
          if (e.path?.[0]) zodErrors[e.path[0]] = e.message;
        });
        setErrors(zodErrors);
      } else {
        setSubmitError(error.message || "Erreur lors de la soumission.");
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  // ============= RENDER =============
  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} size="4xl">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b pb-4 px-6 pt-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "✏️ Modifier le Compte" : "🆕 Créer un Nouveau Compte"}
        </h2>
        <p className="text-sm text-gray-600">
          {isEditMode 
            ? `Modification du compte ${account.account_number}` 
            : "Suivez les étapes pour créer un nouveau compte"}
        </p>
      </div>

      {/* Body */}
      <div className="py-6 px-6 overflow-y-auto flex-1">
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">❌ Erreur</p>
            <p className="text-red-700 text-sm mt-1">{submitError}</p>
          </div>
        )}

        <CompteFormFields
          formData={formData}
          setFormData={handleFormDataChange}
          errors={errors}
          setErrors={setErrors}
          mode={isEditMode ? "edit" : "create"}
        />
      </div>

      {/* Footer */}
      <div className="border-t pt-4 px-6 pb-6 flex gap-3 justify-end">
        <Button 
          variant="light" 
          onClick={onClose} 
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEditMode ? "Modification..." : "Création..."
            : isEditMode ? "💾 Modifier" : "✅ Créer le Compte"
          }
        </Button>
      </div>
    </Modal>
  );
};

export default EditAccountModal;