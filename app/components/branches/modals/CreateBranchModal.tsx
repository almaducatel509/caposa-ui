'use client';

import React, { useState, useEffect } from 'react';
import { Building2, X } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { ExternalLink, ShieldAlert } from 'lucide-react';

import BranchFormFields from '../BranchFormFields';
import {
  branchBaseSchema,
  BranchFormData,
  ErrorMessages,
} from '../validations';
import { fetchBranches, createBranch } from '@/app/lib/api/branche';
import type { Holiday, OpeningHour } from '@/types/branche';
import { Modal } from '../../ui/Modal';

// ============= TYPES =============

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Reçoit la branche créée (objet complet renvoyé par l'API) */
  onSuccess: (created: any) => void;
  /** Horaires disponibles (avec un éventuel is_default: true) */
  openingHours?: OpeningHour[];
  /** Tous les fériés (pour le teaser informatif) */
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
  const [formData,     setFormData]     = useState<BranchFormData>(INITIAL_FORM);
  const [errors,       setErrors]       = useState<ErrorMessages<BranchFormData>>({});
  const [branches,     setBranches]     = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);

  // ── Init au montage : charger la liste (pour détection doublons)
  //    + pré-sélectionner l'horaire par défaut s'il existe
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const existing = await fetchBranches();
        setBranches(existing);

        // Pré-sélection de l'horaire par défaut
        const defaultHour = openingHours.find((h: any) => h.is_default);
        setFormData({
          ...INITIAL_FORM,
          opening_hour: defaultHour?.id,
        });
        setErrors({});
        setApiError(null);
      } catch (err) {
        console.error(err);
        setApiError('Impossible de charger les données.');
      }
    };
    loadData();
  }, [isOpen, openingHours]);

  // ── Handler partiel (style compte) ──
  const handleFormDataChange = (updates: Partial<BranchFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setApiError(null);
  };

  // ── Auto total postes ──
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

  // ── Détection doublons ──
  const findDuplicate = (): string | null => {
    const found = branches.find((b: any) =>
      b.branch_name === formData.branch_name ||
      b.branch_email === formData.branch_email ||
      b.branch_phone_number === formData.branch_phone_number
    );
    return found ? "Une autre branche utilise déjà ce nom, cet email ou ce numéro." : null;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    setApiError(null);

    try {
      // Validation Zod
      const validation = branchBaseSchema.safeParse(formData);
      if (!validation.success) {
        const zodErrors: ErrorMessages<BranchFormData> = {};
        validation.error.errors.forEach(e => {
          if (e.path[0]) zodErrors[e.path[0] as keyof BranchFormData] = e.message;
        });
        setErrors(zodErrors);
        return;
      }

      // Détection doublons
      const dup = findDuplicate();
      if (dup) {
        setApiError(dup);
        return;
      }

      // Statut calculé : si on a horaire + au moins 1 férié → active, sinon inactive
      const hasHours    = Boolean(formData.opening_hour);
      const hasHolidays = Array.isArray(formData.holidays) && formData.holidays.length > 0;
      const computedStatus = hasHours && hasHolidays ? 'active' : 'inactive';

      // Payload aligné sur les noms API
      const payload = {
        ...validation.data,
        statusBranche: computedStatus,
      };

      const created = await createBranch(payload);
      onSuccess(created);

    } catch (error: any) {
      console.error('❌ Erreur création:', error);
      setApiError(error.message || 'Erreur lors de la création.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => { if (!isSubmitting) onClose(); };

  // Indicateur du statut prévu (pour le bandeau d'info)
  const willBeActive =
    Boolean(formData.opening_hour) &&
    Array.isArray(formData.holidays) && formData.holidays.length > 0;
  const missing: string[] = [];
  if (!formData.opening_hour) missing.push('horaires');
  if (!formData.holidays?.length) missing.push('jours fériés');

  // ── Render ──
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">

      {/* ── Header CAPOSA ── */}
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

      {/* ── Body ── */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50 space-y-4">

        {apiError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-700">Erreur</p>
            <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
          </div>
        )}

        {/* Indicateur statut prévu */}
        <div className={`p-3 rounded-xl border-2 flex items-center gap-3 text-sm ${
          willBeActive
            ? 'bg-[#DDEAD5]/50 border-[#2E7D32]/30 text-[#1B5E20]'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <p className="text-xs leading-relaxed">
            {willBeActive ? (
              <><strong>Statut prévu : Active</strong> — la branche aura horaires et jours fériés.</>
            ) : (
              <><strong>Statut prévu : Inactive à la création</strong> — il faudra ajouter <strong>{missing.join(' et ')}</strong> pour qu'elle soit active.</>
            )}
          </p>
        </div>

        {/* Champs principaux */}
        <BranchFormFields
          formData={formData}
          setFormData={handleFormDataChange}
          errors={errors}
          setErrors={setErrors}
          mode="create"
          isSubmitting={isSubmitting}
          openingHours={openingHours}
        />

        {/* Section Jours fériés (teaser en mode create) */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-[#2E7D32]" />
            Jours fériés
            <span className="ml-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
              À configurer après
            </span>
          </p>

          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
            <p className="text-xs text-[#355C7D] leading-relaxed">
              Les jours fériés bloquent l'ouverture de session des caissiers. Vous pourrez les assigner après la création.
            </p>
          </div>

          <div className="py-5 px-4 bg-gray-50 rounded-xl text-center mb-3">
            <FaCalendarAlt className="text-gray-300 text-3xl mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {holidays.length} jour{holidays.length !== 1 ? 's' : ''} férié{holidays.length !== 1 ? 's' : ''} disponible{holidays.length !== 1 ? 's' : ''} dans le système
            </p>
          </div>
          <a
          
            href="/dashboard/holidays"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-[#DDEAD5]/40 hover:bg-[#DDEAD5]/70 border border-[#2E7D32]/20 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-[#2E7D32]" />
              <span className="text-sm font-semibold text-[#1B5E20]">Voir la page Jours fériés</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#2E7D32] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

      </div>

      {/* ── Footer CAPOSA ── */}
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