'use client';

import React, { useState, useEffect } from 'react';
import { Building2, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { ShieldAlert } from 'lucide-react';

import BranchFormFields from '../BranchFormFields';
import {
  branchBaseSchema,
  BranchFormData,
  ErrorMessages,
} from '../validations';
import { fetchBranches, createBranch } from '@/app/lib/api/branche';
import type { OpeningHour } from '@/types/branche';
import { Modal } from '../../ui/Modal';
import { Holiday } from '@/app/components/holidays/validations';

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// 1. SUPPRIMÉ : la grosse section "Jours fériés" en bas du modal.
//    Elle ressemblait à une étape du formulaire mais on ne pouvait
//    rien sélectionner depuis ici (impossible d'assigner des fériés à
//    une branche qui n'existe pas encore). C'était de la friction
//    visuelle pour rien.
//
// 2. AJOUTÉ : un avertissement clair en haut du modal qui dit ce qui
//    se passe APRÈS la création.
//
// 3. AJOUTÉ : un écran de succès post-création qui redirige vers la
//    page /dashboard/holidays existante (plutôt qu'une page d'assignation
//    dédiée par branche qui n'existe pas).
//
// 4. PHILOSOPHIE UX : on RESPONSABILISE l'admin plutôt que de pré-cocher
//    automatiquement. C'est lui qui doit décider, pour chaque férié de
//    la liste, s'il s'applique à sa nouvelle branche. Cette friction
//    est volontaire — bloquer une session caissier par erreur est
//    bien pire que de devoir cocher quelques cases.
// ─────────────────────────────────────────────────────────────────────────────

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Reçoit la branche créée (objet complet renvoyé par l'API) */
  onSuccess: (created: any) => void;
  /** Horaires disponibles (avec un éventuel is_default: true) */
  openingHours?: OpeningHour[];
  /** Tous les fériés (gardé pour le compteur informatif uniquement) */
  holidays?: Holiday[];
}

// ─── Valeurs initiales ─────────────────────────────────────────────────────
const INITIAL_FORM: BranchFormData = {
  branch_name:               '',
  branch_address:            '',
  branch_phone_number:       '',
  branch_email:              '',
  department_code:           'OUEST',
  city:                      '',
  number_of_posts:           0,
  number_of_tellers:         0,
  number_of_clerks:          0,
  number_of_credit_officers: 0,
  opening_date:              '',
  opening_hour:              undefined,
  holidays:                  [],
  status:                    'inactive',
};

// ============= COMPONENT =============

const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  openingHours = [],
  holidays = [],
}) => {

  // ── State ──
  const [formData,      setFormData]      = useState<BranchFormData>(INITIAL_FORM);
  const [errors,        setErrors]        = useState<ErrorMessages<BranchFormData>>({});
  const [branches,      setBranches]      = useState<any[]>([]);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [apiError,      setApiError]      = useState<string | null>(null);
  const [createdBranch, setCreatedBranch] = useState<any | null>(null);

  // ── Init au montage ──
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const existing = await fetchBranches();
        setBranches(existing);

        const defaultHour = openingHours.find((h: any) => h.is_default);
        setFormData({
          ...INITIAL_FORM,
          opening_hour: defaultHour?.id,
        });
        setErrors({});
        setApiError(null);
        setCreatedBranch(null);
      } catch (err) {
        console.error(err);
        setApiError('Impossible de charger les données.');
      }
    };
    loadData();
  }, [isOpen, openingHours]);

  // ── Handlers ──
  const handleFormDataChange = (updates: Partial<BranchFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setApiError(null);
  };

  // Auto total postes
  useEffect(() => {
    const total =
      (formData.number_of_tellers || 0) +
      (formData.number_of_clerks || 0) +
      (formData.number_of_credit_officers || 0);
    if (total !== formData.number_of_posts) {
      setFormData(prev => ({ ...prev, number_of_posts: total }));
    }
  }, [
    formData.number_of_tellers,
    formData.number_of_clerks,
    formData.number_of_credit_officers,
  ]);

  const findDuplicate = (): string | null => {
    const found = branches.find((b: any) =>
      b.branch_name === formData.branch_name ||
      b.branch_email === formData.branch_email ||
      b.branch_phone_number === formData.branch_phone_number
    );
    return found ? "Une autre branche utilise déjà ce nom, cet email ou ce numéro." : null;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    setApiError(null);

    try {
      const validation = branchBaseSchema.safeParse(formData);
      if (!validation.success) {
        const zodErrors: ErrorMessages<BranchFormData> = {};
        validation.error.errors.forEach(e => {
          if (e.path[0]) zodErrors[e.path[0] as keyof BranchFormData] = e.message;
        });
        setErrors(zodErrors);
        return;
      }

      const dup = findDuplicate();
      if (dup) {
        setApiError(dup);
        return;
      }

      const payload = {
        ...validation.data,
        statusBranche: 'inactive' as const,
      };

      const created = await createBranch(payload);
      setCreatedBranch(created);

    } catch (error: any) {
      console.error('❌ Erreur création:', error);
      setApiError(error.message || 'Erreur lors de la création.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => { if (!isSubmitting) onClose(); };

  // ─── Redirection vers la page Jours fériés EXISTANTE ─────────────────────
  // L'admin verra la liste de tous les fériés et choisira lui-même lesquels
  // s'appliquent à sa nouvelle branche (responsabilisation volontaire).
  const handleGoToHolidaysPage = () => {
    window.location.href = `/dashboard/holidays`;
  };

  const handleFinishLater = () => {
    onSuccess(createdBranch);
  };

  // ============= ÉCRAN DE SUCCÈS =============
  if (createdBranch) {
    return (
      <Modal isOpen={isOpen} onClose={handleFinishLater} size="2xl">
        <div className="px-8 py-10">

          {/* Icône + titre */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#DDEAD5] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Branche créée avec succès
            </h2>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{createdBranch.branch_name}</span> a été enregistrée.
            </p>
          </div>

          {/* Encart statut */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Statut actuel : Inactive
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Tant qu'aucun jour férié ne lui est assigné, les caissiers de cette branche peuvent ouvrir une session
              <strong> tous les jours</strong> — y compris les jours qui devraient être fermés.
            </p>
          </div>

          {/* Encart responsabilisation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-[#1B4D6B] mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Prochaine étape : assigner les jours fériés
            </p>
            <p className="text-xs text-[#355C7D] leading-relaxed mb-2">
              Sur la page <strong>Jours fériés</strong>, parcourez la liste et, pour chaque férié,
              cliquez sur <strong>« Gérer »</strong> pour ajouter <strong>{createdBranch.branch_name}</strong> aux branches concernées.
            </p>
            <p className="text-xs text-[#355C7D] leading-relaxed">
              ⚠ <strong>C'est à vous de déterminer</strong> lesquels s'appliquent à cette branche
              (fériés nationaux, fêtes locales, élections, maintenance, etc.).
              Le système ne pré-coche rien automatiquement pour éviter les erreurs.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleGoToHolidaysPage}
              className="w-full px-5 py-3 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Aller à la page Jours fériés
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleFinishLater}
              className="w-full px-5 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              Plus tard
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ============= FORMULAIRE DE CRÉATION =============
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Nouvelle branche</h2>
            <p className="text-xs text-gray-500">Créer une nouvelle branche</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50 space-y-4">

        {apiError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-700">Erreur</p>
            <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
          </div>
        )}

        {/* Avertissement post-création */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
          <div className="text-xs text-[#355C7D] leading-relaxed">
            <p className="font-semibold mb-0.5">Création en deux temps</p>
            <p>
              Cette branche sera créée avec le statut <strong>Inactive</strong>.
              Une fois créée, vous devrez vous-même aller sur la page <strong>Jours fériés</strong> pour
              déterminer quels fériés s'appliquent à elle ({holidays.length} disponible{holidays.length !== 1 ? 's' : ''} dans le système).
            </p>
          </div>
        </div>

        {/* Champs du formulaire */}
        <BranchFormFields
          formData={formData}
          setFormData={handleFormDataChange}
          errors={errors}
          setErrors={setErrors}
          mode="create"
          isSubmitting={isSubmitting}
          openingHours={openingHours}
        />

      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
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
                Création…
              </span>
            ) : (
              'Créer la branche'
            )}
          </button>
        </div>
      </div>

    </Modal>
  );
};

export default CreateBranchModal;