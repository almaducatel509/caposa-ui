'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Building2, X, Sparkles, ExternalLink, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';

import BranchFormFields from '../BranchFormFields';
import {
  branchUpdateSchema,
  branchActivationSchema,
  BranchFormData,
  ErrorMessages,
} from '../validations';
import { fetchBranches, getBranchById, updateBranch } from '@/app/lib/api/branche';
import type { Branch, OpeningHour } from '@/types/branche';
import { Modal } from '../../ui/Modal';
import { Holiday } from '../../holidays/validations';

// ============= TYPES =============

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Reçoit la branche mise à jour (objet complet renvoyé par l'API) */
  onSuccess: (updated: any) => void;
  /** La branche à modifier (passée par le parent qui détient l'ID) */
  branch: Branch | null;
  /** Mode UX : "edit" pour modifs routinières, "activate" pour compléter une branche inactive */
  mode?: 'edit' | 'activate';
  openingHours?: OpeningHour[];
  holidays?: Holiday[];
}

// ============= COMPONENT =============

const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch,
  mode = 'edit',
  openingHours = [],
  holidays = [],
}) => {

  // ── State ──
  const [formData,     setFormData]       = useState<BranchFormData | null>(null);
  const [errors,       setErrors]         = useState<ErrorMessages<BranchFormData>>({});
  const [branches,     setBranches]       = useState<any[]>([]);
  const [isLoading,    setIsLoading]      = useState(true);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [apiError,     setApiError]       = useState<string | null>(null);
  const [successMsg,   setSuccessMsg]     = useState<string | null>(null);

  // ── Snapshot du statut initial (avant édition) pour message de succès ──
  const wasActiveBefore = useMemo(() => {
    if (!branch) return false;
    const hadHours = Boolean(branch.opening_hour);
    const hadHolidays = Array.isArray(branch.holidays) && branch.holidays.length > 0;
    return branch.statusBranche !== 'archive' && hadHours && hadHolidays;
  }, [branch]);

  // ── Chargement initial : getBranchById pour la version fraîche ──
  useEffect(() => {
    if (!isOpen || !branch?.id) return;

    const loadData = async () => {
      setIsLoading(true);
      setApiError(null);
      setSuccessMsg(null);
      setErrors({});

      try {
        // Liste pour détection doublons (exclura b.id !== branch.id)
        const existing = await fetchBranches();
        setBranches(existing);

        // Version fraîche depuis l'API
        const data = await getBranchById(branch.id);
        if (!data) {
          setApiError("Cette branche est introuvable.");
          setIsLoading(false);
          return;
        }

        // Normaliser holidays en tableau d'IDs (l'API peut renvoyer des objets Holiday)
        const holidayIds = Array.isArray(data.holidays)
          ? data.holidays.map((h: any) => (typeof h === 'object' ? h.id : h))
          : [];

        // En mode "activate" sans horaire : pré-sélectionner l'horaire par défaut
        let openingHourId = data.opening_hour;
        if (mode === 'activate' && !openingHourId && openingHours.length > 0) {
          const defaultHour = openingHours.find((h: any) => h.is_default) ?? openingHours[0];
          openingHourId = defaultHour?.id;
        }

        setFormData({
          branch_name:               data.branch_name,
          branch_address:            data.branch_address,
          branch_phone_number:       data.branch_phone_number,
          branch_email:              data.branch_email,
          department_code:           data.department_code ?? 'OUEST',
          city:                      data.city ?? '',
          number_of_tellers:         data.number_of_tellers,
          number_of_clerks:          data.number_of_clerks,
          number_of_credit_officers: data.number_of_credit_officers,
          number_of_posts:
            (data.number_of_tellers || 0) +
            (data.number_of_clerks || 0) +
            (data.number_of_credit_officers || 0),
          opening_date:              data.opening_date,
          opening_hour:              openingHourId,
          holidays:                  holidayIds,
          status:                    data.statusBranche ?? 'inactive',
        });
      } catch (err: any) {
        console.error(err);
        setApiError(err?.message || 'Impossible de charger les données.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isOpen, branch, mode, openingHours]);

  // ── Handler partiel (style compte) ──
  const handleFormDataChange = (updates: Partial<BranchFormData>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : prev);
    setApiError(null);
  };

  // ── Auto total postes ──
  useEffect(() => {
    if (!formData) return;
    const total =
      (formData.number_of_tellers || 0) +
      (formData.number_of_clerks || 0) +
      (formData.number_of_credit_officers || 0);
    if (total !== formData.number_of_posts) {
      setFormData(prev => prev ? { ...prev, number_of_posts: total } : prev);
    }
  }, [
    formData?.number_of_tellers,
    formData?.number_of_clerks,
    formData?.number_of_credit_officers,
  ]);

  // ── Détection doublons (en excluant la branche en cours d'édition) ──
  const findDuplicate = (): string | null => {
    if (!formData) return null;
    const found = branches.find((b: any) =>
      b.id !== branch?.id && (
        b.branch_name === formData.branch_name ||
        b.branch_email === formData.branch_email ||
        b.branch_phone_number === formData.branch_phone_number
      )
    );
    return found ? "Une autre branche utilise déjà ce nom, cet email ou ce numéro." : null;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!formData || !branch?.id) return;

    setIsSubmitting(true);
    setErrors({});
    setApiError(null);
    setSuccessMsg(null);

    try {
      // Choisir le schéma selon le mode :
      //   - "activate" → schéma strict (exige opening_hour + ≥1 férié)
      //   - "edit"     → schéma update partiel (tout optionnel)
      const schema = mode === 'activate' ? branchActivationSchema : branchUpdateSchema;
      const validation = schema.safeParse(formData);

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

      // Statut calculé automatiquement (jamais "archive" depuis ce modal —
      // l'archivage passe par DeleteBranchModal / archiveBranch)
      const hasHours    = Boolean(formData.opening_hour);
      const hasHolidays = Array.isArray(formData.holidays) && formData.holidays.length > 0;
      const computedStatus = hasHours && hasHolidays ? 'active' : 'inactive';

      const payload = {
        ...validation.data,
        statusBranche: computedStatus,
      };

      const updated = await updateBranch(branch.id, payload);

      // Message de succès personnalisé : a-t-on activé la branche ?
      const isNowActive = computedStatus === 'active';
      const justActivated = !wasActiveBefore && isNowActive;
      setSuccessMsg(
        justActivated
          ? 'Modifications enregistrées. La branche est maintenant active !'
          : 'Branche modifiée avec succès !'
      );

      // Petit délai pour laisser voir le message, puis on remonte la branche au parent
      setTimeout(() => {
        onSuccess(updated);
      }, 1200);

    } catch (error: any) {
      console.error('❌ Erreur édition:', error);
      setApiError(error.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => { if (!isSubmitting) onClose(); };

  // ── Loading ──
  if (isOpen && (isLoading || !formData)) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2E7D32]" />
          <span className="text-sm text-gray-500">Chargement…</span>
        </div>
      </Modal>
    );
  }

  if (!isOpen || !formData) return null;

  // Indicateurs pour l'UI
  const hasHours    = Boolean(formData.opening_hour);
  const hasHolidays = Array.isArray(formData.holidays) && formData.holidays.length > 0;
  const willBeActive = hasHours && hasHolidays;
  const missing: string[] = [];
  if (!hasHours)    missing.push('horaires');
  if (!hasHolidays) missing.push('jours fériés');

  const titleText = mode === 'activate' ? 'Compléter la branche' : 'Modifier la branche';
  const subtitleText =
    mode === 'activate' && missing.length > 0
      ? `Ajoutez ${missing.join(' et ')} pour l'activer automatiquement`
      : `Modification de ${branch?.branch_name ?? 'la branche'}`;

  // Texte du bouton selon le mode
  const submitButtonText = mode === 'activate' ? 'Activer la branche' : 'Enregistrer';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">

      {/* ── Header CAPOSA ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{titleText}</h2>
            <p className="text-xs text-gray-500">{subtitleText}</p>
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

        {successMsg && (
          <div className="p-3 bg-[#DDEAD5] border border-[#2E7D32]/20 text-[#1B5E20] rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Indicateur statut prévu */}
        {!successMsg && (
          <div className={`p-3 rounded-xl border-2 flex items-center gap-3 text-sm ${
            willBeActive
              ? 'bg-[#DDEAD5]/50 border-[#2E7D32]/30 text-[#1B5E20]'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <Sparkles className={`w-4 h-4 shrink-0 ${willBeActive ? 'text-[#2E7D32]' : 'text-amber-500'}`} />
            <p className="text-xs leading-relaxed">
              {willBeActive ? (
                <><strong>Statut prévu : Active</strong> — la branche aura horaires et jours fériés.</>
              ) : (
                <><strong>Statut prévu : Inactive</strong> — il manque encore <strong>{missing.join(' et ')}</strong> pour qu'elle soit active.</>
              )}
            </p>
          </div>
        )}

        {/* Champs principaux */}
        <BranchFormFields
          formData={formData}
          setFormData={handleFormDataChange}
          errors={errors}
          setErrors={setErrors}
          mode={mode}
          isSubmitting={isSubmitting}
          openingHours={openingHours}
        />

        {/* Section Jours fériés appliqués (read-only en édition) */}
        <HolidaysReadOnlySection
          selectedHolidayIds={formData.holidays || []}
          allHolidays={holidays}
          isHighlighted={mode === 'activate' && !hasHolidays}
        />

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
                Enregistrement…
              </span>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </div>

    </Modal>
  );
};

/* =====================================================
   Section Jours fériés (lecture seule en édition)
===================================================== */

interface HolidaysReadOnlySectionProps {
  selectedHolidayIds: string[];
  allHolidays: Holiday[];
  isHighlighted: boolean;
}

const HolidaysReadOnlySection: React.FC<HolidaysReadOnlySectionProps> = ({
  selectedHolidayIds,
  allHolidays,
  isHighlighted,
}) => {
  const selectedHolidays = useMemo(
    () => allHolidays.filter(h => selectedHolidayIds.includes(h.id)),
    [selectedHolidayIds, allHolidays]
  );

  const formatDate = (d: string) => {
    try {
      const date = d.includes('T') ? new Date(d) : new Date(d + 'T12:00:00');
      return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className={`bg-white border rounded-xl p-5 transition-colors ${
      isHighlighted ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-100'
    }`}>
      <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-3 flex items-center gap-2">
        <FaCalendarAlt className="text-[#2E7D32]" />
        Jours fériés appliqués
        <span className="ml-1 px-2.5 py-0.5 bg-[#DDEAD5] text-[#1B5E20] rounded-lg text-xs font-semibold">
          {selectedHolidays.length} jour{selectedHolidays.length !== 1 ? 's' : ''}
        </span>
      </p>

      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
        <p className="text-xs text-[#355C7D] leading-relaxed">
          Les jours fériés bloquent l'ouverture de session des caissiers. Seuls le Directeur ou la Maintenance peuvent les modifier, et chaque changement est enregistré dans le journal d'audit.
        </p>
      </div>

      {selectedHolidays.length > 0 ? (
        <div className="space-y-1.5 max-h-48 overflow-y-auto mb-3">
          {selectedHolidays
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(h => {
              const isUpcoming = new Date(h.date) > new Date();
              return (
                <div key={h.id} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${
                  isUpcoming ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{formatDate(h.date)}</p>
                    {h.description && <p className="text-xs text-gray-500 truncate">{h.description}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ml-2 shrink-0 ${
                    isUpcoming ? 'bg-blue-100 text-[#355C7D]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isUpcoming ? 'À venir' : 'Passé'}
                  </span>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="mb-3 py-6 px-4 bg-gray-50 rounded-xl text-center">
          <FaCalendarAlt className="text-gray-300 text-3xl mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">Aucun jour férié assigné</p>
          <p className="text-xs text-gray-400 mt-1">
            Cette branche restera inactive sans au moins un jour férié.
          </p>
        </div>
      )}
      <a
      
        href="/dashboard/holidays"
        className="flex items-center justify-between p-3 bg-[#DDEAD5]/40 hover:bg-[#DDEAD5]/70 border border-[#2E7D32]/20 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-[#2E7D32]" />
          <span className="text-sm font-semibold text-[#1B5E20]">
            {selectedHolidays.length === 0 ? 'Configurer les jours fériés' : 'Modifier les jours fériés'}
          </span>
        </div>
        <ExternalLink className="w-4 h-4 text-[#2E7D32] group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
};

export default EditBranchModal;