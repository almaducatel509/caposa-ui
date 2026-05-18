'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, X } from 'lucide-react';
import CompteFormFields from '../CompteFormFields';
import { createAccountSchema, updateAccountSchema } from '../validationsaccount';
import type { AccountData } from '../validationsaccount';
import { createAccount, updateAccount } from '@/app/lib/api/accounts';
import { Modal } from '../../ui/Modal';


// ============= TYPES =============
interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountData | null;
  onSuccess: (account: AccountData) => void;
}

// ============= COMPONENT =============
const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen, onClose, account, onSuccess,
}) => {
  const isEditMode = !!account;

  // ── State ──
  const [formData, setFormData] = useState({
    id_membre:         '',
    typeCompte:        '' as 'epargne' | 'cheques' | 'terme' | '',
    statutCompte:      'actif' as 'actif' | 'ferme' | 'gele' | 'en_attente' |'archive',
    dateOuverture:     new Date().toISOString().split('T')[0],
    dateFermeture:     null as string | null,
    tauxInteret:       null as number | null,
    limiteTrait:       null as number | null,
    fraisServiceMensuel: null as number | null,
    member_details:    undefined as any,
  });

  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);

  // ── Init ──
  useEffect(() => {
    if (account) {
      setFormData({
        id_membre:        account.id_membre || account.member || '',
        typeCompte:       account.typeCompte || '',
        statutCompte:     account.account_status || 'actif',
        dateOuverture:    account.dateOuverture || account.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        dateFermeture:    account.dateFermeture || null,
        tauxInteret:      account.tauxInteret || null,
        limiteTrait:      account.limiteTrait || null,
        fraisServiceMensuel: account.fraisServiceMensuel || null,
        member_details:   account.member_details,
      });
    } else {
      setFormData({
        id_membre: '', typeCompte: '', statutCompte: 'actif',
        dateOuverture: new Date().toISOString().split('T')[0],
        dateFermeture: null, tauxInteret: null, limiteTrait: null,
        fraisServiceMensuel: null, member_details: undefined,
      });
    }
    setErrors({});
    setApiError(null);
  }, [account, isOpen]);

  // ── Handlers ──
  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setApiError(null);
    const field = Object.keys(updates)[0];
    if (field) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    setApiError(null);

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
          validation.error.errors.forEach(e => { if (e.path[0]) zodErrors[e.path[0] as string] = e.message; });
          setErrors(zodErrors); return;
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
          validation.error.errors.forEach(e => { if (e.path[0]) zodErrors[e.path[0] as string] = e.message; });
          setErrors(zodErrors); return;
        }
        const created = await createAccount(validation.data);
        onSuccess(created);
      }
    } catch (error: any) {
      console.error('❌ Erreur soumission:', error);
      if (error?.errors) {
        const zodErrors: Record<string, string> = {};
        error.errors.forEach((e: any) => { if (e.path?.[0]) zodErrors[e.path[0]] = e.message; });
        setErrors(zodErrors);
      } else {
        setApiError(error.message || 'Erreur lors de la soumission.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => { if (!isSubmitting) onClose(); };

  // ── Render ──
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">

      {/* ── Header CAPOSA ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {isEditMode ? 'Modifier le compte' : 'Nouveau compte'}
            </h2>
            <p className="text-xs text-gray-500">
              {isEditMode
                ? `Modification du compte ${account?.account_number}`
                : 'Créer un nouveau compte bancaire'}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50">
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-700">Erreur</p>
            <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
          </div>
        )}

        <CompteFormFields
          formData={formData}
          setFormData={handleFormDataChange}
          errors={errors}
          setErrors={setErrors}
          mode={isEditMode ? 'edit' : 'create'}
        />
      </div>

      {/* ── Footer CAPOSA ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 rounded-b-2xl">
        <p className="text-xs text-gray-400">
          Tous les champs marqués <span className="text-red-500">*</span> sont obligatoires
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="relative px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isEditMode ? 'Modification…' : 'Création…'}
              </span>
            ) : (
              isEditMode ? 'Enregistrer' : 'Créer le compte'
            )}
          </button>
        </div>
      </div>

    </Modal>
  );
};

export default EditAccountModal;