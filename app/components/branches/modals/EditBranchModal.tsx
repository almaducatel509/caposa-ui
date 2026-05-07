'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Building2, X, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

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
  onSuccess: (updated: any) => void;
  branch: Branch | null;
  mode?: 'edit' | 'activate';
  openingHours?: OpeningHour[];
  /** Conservé pour compat API parent — plus utilisé dans ce modal. */
  holidays?: Holiday[];
}

// ============= HELPER : calcule le diff entre 2 objets =============

/**
 * Compare deux objets et retourne uniquement les champs qui ont changé.
 * Utilisé pour debug : voir EXACTEMENT ce qui est différent avant/après.
 */
function computeDiff(before: any, after: any): Record<string, { before: any; after: any }> {
  const diff: Record<string, { before: any; after: any }> = {};
  if (!before || !after) return diff;

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  allKeys.forEach(key => {
    const b = before[key];
    const a = after[key];
    // Comparaison stringifiée (gère arrays et objets imbriqués simplement)
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      diff[key] = { before: b, after: a };
    }
  });

  return diff;
}

// ============= COMPONENT =============

const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch,
  mode = 'edit',
  openingHours = [],
}) => {

  // ── State ──
  const [formData,     setFormData]       = useState<BranchFormData | null>(null);
  const [errors,       setErrors]         = useState<ErrorMessages<BranchFormData>>({});
  const [branches,     setBranches]       = useState<any[]>([]);
  const [isLoading,    setIsLoading]      = useState(true);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [apiError,     setApiError]       = useState<string | null>(null);
  const [successMsg,   setSuccessMsg]     = useState<string | null>(null);

  // ─── Snapshot AVANT modification ──────────────────────────────────────
  // useRef pour stocker la version fraîche de l'API au chargement,
  // sans déclencher de re-render. Utilisé pour le DIFF après update.
  const beforeSnapshot = useRef<any>(null);

  // ── Snapshot du statut initial pour message de succès ──
  const wasActiveBefore = useMemo(() => {
    if (!branch) return false;
    const hadHours = Boolean(branch.opening_hour);
    const hadHolidays = Array.isArray(branch.holidays) && branch.holidays.length > 0;
    return branch.statusBranche !== 'archive' && hadHours && hadHolidays;
  }, [branch]);

  // ── Chargement initial ──
  useEffect(() => {
    if (!isOpen || !branch?.id) return;

    const loadData = async () => {
      setIsLoading(true);
      setApiError(null);
      setSuccessMsg(null);
      setErrors({});
      beforeSnapshot.current = null;

      try {
        const existing = await fetchBranches();
        setBranches(existing);

        const data = await getBranchById(branch.id);
        if (!data) {
          setApiError("Cette branche est introuvable.");
          setIsLoading(false);
          return;
        }

        // ═══════════════════════════════════════════════════════════════
        // ─── SNAPSHOT AVANT ────────────────────────────────────────────
        // On stocke la réponse BRUTE de l'API pour comparer plus tard.
        // ═══════════════════════════════════════════════════════════════
        beforeSnapshot.current = data;

        console.group('📥 [EditBranchModal] Données AVANT modification (API)');
        console.log('🔹 Branch ID    :', branch.id);
        console.log('🔹 Endpoint     : getBranchById');
        console.log('🔹 Statut actuel:', data.statusBranche);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 Réponse brute API :', data);
        console.log('📦 JSON formaté      :');
        console.log(JSON.stringify(data, null, 2));
        console.groupEnd();
        // ═══════════════════════════════════════════════════════════════

        const holidayIds = Array.isArray(data.holidays)
          ? data.holidays.map((h: any) => (typeof h === 'object' ? h.id : h))
          : [];

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
        console.error('❌ Erreur chargement:', err);
        setApiError(err?.message || 'Impossible de charger les données.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isOpen, branch, mode, openingHours]);

  // ── Handler partiel ──
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

  // ── Détection doublons ──
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
      const schema = mode === 'activate' ? branchActivationSchema : branchUpdateSchema;
      const validation = schema.safeParse(formData);

      if (!validation.success) {
        const zodErrors: ErrorMessages<BranchFormData> = {};
        validation.error.errors.forEach(e => {
          if (e.path[0]) zodErrors[e.path[0] as keyof BranchFormData] = e.message;
        });
        setErrors(zodErrors);

        console.group('⚠️ [EditBranchModal] Validation échouée');
        console.log('Mode:', mode);
        console.log('FormData:', formData);
        console.log('Erreurs Zod:', zodErrors);
        console.groupEnd();
        return;
      }

      const dup = findDuplicate();
      if (dup) {
        setApiError(dup);
        return;
      }

      const hasHours    = Boolean(formData.opening_hour);
      const hasHolidays = Array.isArray(formData.holidays) && formData.holidays.length > 0;
      const computedStatus = hasHours && hasHolidays ? 'active' : 'inactive';

      const payload = {
        ...validation.data,
        statusBranche: computedStatus,
      };

      // ═══════════════════════════════════════════════════════════════
      // ─── PAYLOAD ENVOYÉ ────────────────────────────────────────────
      // ═══════════════════════════════════════════════════════════════
      console.group('🚀 [EditBranchModal] Soumission API');
      console.log('🔹 Mode             :', mode);
      console.log('🔹 Branch ID        :', branch.id);
      console.log('🔹 Endpoint         : updateBranch');
      console.log('🔹 Statut calculé   :', computedStatus);
      console.log('🔹 hasHours         :', hasHours);
      console.log('🔹 hasHolidays      :', hasHolidays, '(', (formData.holidays || []).length, 'sélectionné(s) )');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 PAYLOAD envoyé   :', payload);
      console.log('📦 JSON formaté     :');
      console.log(JSON.stringify(payload, null, 2));
      console.groupEnd();
      // ═══════════════════════════════════════════════════════════════

      const updated = await updateBranch(branch.id, payload);

      // ═══════════════════════════════════════════════════════════════
      // ─── SNAPSHOT APRÈS ────────────────────────────────────────────
      // ═══════════════════════════════════════════════════════════════
      console.group('✅ [EditBranchModal] Données APRÈS modification (API)');
      console.log('🔹 Endpoint     : updateBranch');
      console.log('🔹 Statut final :', updated?.statusBranche);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 Réponse brute API :', updated);
      console.log('📦 JSON formaté      :');
      console.log(JSON.stringify(updated, null, 2));
      console.groupEnd();

      // ─── DIFF : qu'est-ce qui a changé ? ───────────────────────────
      console.group('🔄 [EditBranchModal] DIFF avant ↔ après');
      const before = beforeSnapshot.current;
      const diff = computeDiff(before, updated);
      const changedKeys = Object.keys(diff);

      if (changedKeys.length === 0) {
        console.log('ℹ️ Aucun champ n\'a changé entre l\'avant et l\'après.');
        console.log('   (L\'API n\'a peut-être pas appliqué les modifs, ou tu n\'as rien changé.)');
      } else {
        console.log(`📊 ${changedKeys.length} champ(s) modifié(s) :`, changedKeys);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // Affichage en table : très lisible dans la DevTools
        console.table(
          changedKeys.map(key => ({
            champ:  key,
            avant:  JSON.stringify(diff[key].before),
            après:  JSON.stringify(diff[key].after),
          }))
        );
        console.log('📦 Diff complet :', diff);
      }
      console.groupEnd();
      // ═══════════════════════════════════════════════════════════════

      const isNowActive = computedStatus === 'active';
      const justActivated = !wasActiveBefore && isNowActive;
      setSuccessMsg(
        justActivated
          ? 'Modifications enregistrées. La branche est maintenant active !'
          : 'Branche modifiée avec succès !'
      );

      setTimeout(() => {
        onSuccess(updated);
      }, 1200);

    } catch (error: any) {
      console.group('❌ [EditBranchModal] Erreur API');
      console.error('Error object:', error);
      console.error('Message:', error?.message);
      console.error('Response:', error?.response);
      console.groupEnd();
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

  const submitButtonText = mode === 'activate' ? 'Activer la branche' : 'Enregistrer';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">

      {/* ── Header ── */}
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

        <BranchFormFields
          formData={formData}
          setFormData={handleFormDataChange}
          errors={errors}
          setErrors={setErrors}
          mode={mode}
          isSubmitting={isSubmitting}
          openingHours={openingHours}
        />

        {/* Section Jours fériés retirée — gestion dans /dashboard/holidays. */}

      </div>

      {/* ── Footer ── */}
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

export default EditBranchModal;