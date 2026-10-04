'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2, X, CheckCircle2, Clock,
} from 'lucide-react';

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
// MODIFICATIONS v3 :
//
// 1. SUPPRIMÉ : le choix explicite standard/personnaliser et la redirection
//    automatique vers /opening-hours. L'horaire standard s'applique
//    désormais par défaut à la création — branche créée ACTIVE.
//    Pour changer l'horaire, l'utilisateur va lui-même sur la page Horaires
//    quand il le souhaite (pas de flow guidé imposé).
//
// 2. Cas de repli : si aucun horaire standard (is_default) n'existe encore
//    dans le système, la branche est créée INACTIVE avec un avertissement
//    inline — pas de bouton de redirection, juste une note informative.
//
// 3. JOURS FÉRIÉS : le backend assigne automatiquement les fériés
//    Nationaux/Régionaux à la création (signal post_save Django).
//    Le frontend n'envoie plus holidays[] dans le payload de création.
// ─────────────────────────────────────────────────────────────────────────────

interface CreateBranchModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onSuccess:    (created: any) => void;
  openingHours?: OpeningHour[];
  holidays?:     Holiday[];
}

// ─── Valeurs initiales ─────────────────────────────────────────────────────
const INITIAL_FORM: BranchFormData = {
  branch_name:               '',
  branch_address:            '',
  branch_phone_number:       '',
  branch_email:              '',
  department_code:           'OUEST',
  city:                      '',
  opening_date:              '',
  opening_hour:              undefined,
  status:                    'inactive',
  number_of_posts:           0,
  number_of_tellers:         0,
  number_of_clerks:          0,
  number_of_credit_officers: 0,
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

  // ── Trouver l'horaire standard dans la liste fournie ──
  // On cherche is_default=true, sinon le premier qui couvre Lun-Ven 08:00-17:00
  const standardHour: OpeningHour | undefined = openingHours.find(
    (h: any) => h.is_default
  ) ?? openingHours.find(
    (h: any) =>
      h.monday && h.tuesday && h.wednesday && h.thursday && h.friday &&
      h.opening_time === '08:00' && h.closing_time === '17:00'
  );

  // ── Init au montage ──
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const existing = await fetchBranches();
        setBranches(existing);
        setFormData(INITIAL_FORM);
        setErrors({});
        setApiError(null);
        setCreatedBranch(null);
      } catch (err) {
        console.error(err);
        setApiError('Impossible de charger les données.');
      }
    };
    loadData();
  }, [isOpen]);

  // ── Handlers ──
  const handleFormDataChange = (updates: Partial<BranchFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setApiError(null);
  };

  const findDuplicate = (): string | null => {
    const found = branches.find((b: any) =>
      b.branch_name         === formData.branch_name ||
      b.branch_email        === formData.branch_email ||
      b.branch_phone_number === formData.branch_phone_number
    );
    return found
      ? 'Une autre branche utilise déjà ce nom, cet email ou ce numéro.'
      : null;
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
      if (dup) { setApiError(dup); return; }

      // Horaire standard appliqué automatiquement si disponible.
      // Jours fériés Nationaux/Régionaux assignés côté backend (signal post_save).
      const payload = {
        branch_name:               validation.data.branch_name,
        branch_address:            validation.data.branch_address,
        branch_phone_number:       validation.data.branch_phone_number,
        branch_email:              validation.data.branch_email,
        department_code:           validation.data.department_code,
        city:                      validation.data.city,
        opening_date:              validation.data.opening_date,
        opening_hour:              standardHour?.id ?? null,
        status:                    standardHour ? 'active' : 'inactive',
        number_of_posts:           validation.data.number_of_posts,
        number_of_tellers:         validation.data.number_of_tellers,
        number_of_clerks:          validation.data.number_of_clerks,
        number_of_credit_officers: validation.data.number_of_credit_officers,
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

  const handleClose  = () => { if (!isSubmitting) onClose(); };
  const handleFinish = () => { onSuccess(createdBranch); };

  // ============= ÉCRAN DE SUCCÈS =============
  if (createdBranch) {
    const wasActivated = !!standardHour;
    return (
      <Modal isOpen={isOpen} onClose={handleFinish} size="2xl">
        <div className="px-8 py-10">

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#DDEAD5] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Branche créée avec succès
            </h2>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{createdBranch.branch_name}</span>{' '}
              a été enregistrée.
            </p>
          </div>

          {wasActivated ? (
            <div className="bg-[#DDEAD5] border border-[#2E7D32]/20 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-[#1B5E20] mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Branche activée — Lun–Ven · 08:00–17:00
              </p>
              <p className="text-xs text-[#2E7D32] leading-relaxed">
                Les jours fériés nationaux ont été assignés automatiquement.
                Pour ajuster l'horaire ou les fériés locaux/régionaux, allez sur la page <strong>Horaires</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                Statut actuel : Inactive
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Aucun horaire standard n'est encore configuré dans le système,
                donc cette branche reste inactive. Les caissiers ne pourront pas
                ouvrir de session tant qu'un horaire n'est pas défini sur la page <strong>Horaires</strong>.
              </p>
            </div>
          )}

          <button
            onClick={handleFinish}
            className="w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Terminer
          </button>

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
            <p className="text-xs text-gray-500">Remplissez les informations de la branche</p>
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

        {/* ── Info horaire — statique, plus de choix ──────────────────── */}
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
              Horaire d'ouverture
            </span>
          </div>

          <div className="p-4">
            {standardHour ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2E7D32]/20 bg-[#DDEAD5]/30">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1B5E20]">
                    Horaire standard appliqué automatiquement
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lun–Ven · 08:00–17:00 · Sam &amp; Dim fermés - branche créée <strong>Active</strong>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-600 px-1">
                ⚠ Aucun horaire standard trouvé dans le système -
                cette branche sera créée <strong>Inactive</strong>. Configurez-en un
                sur la page <strong>Horaires</strong> ensuite pour l'activer.
              </p>
            )}
          </div>
        </div>

        {/* ── Champs du formulaire ─────────────────────────────────────── */}
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
          {standardHour
            ? '✓ Horaire standard — branche sera Active'
            : '⚠ Pas d\'horaire standard — branche sera Inactive'
          }
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
            className="relative px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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