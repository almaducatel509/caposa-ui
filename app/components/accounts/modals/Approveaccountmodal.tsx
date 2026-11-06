'use client';

// app/components/accounts/modals/ApproveAccountModal.tsx
//
// Confirmation + résultat de l'approbation d'un compte en_attente.
// Étapes : confirm → loading → success | error
// L'appel API est fait ici ; le parent recharge la liste via onApproved().

import React, { useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';
import { approveAccount } from '@/app/lib/api/accounts';
import { parseApiError } from '@/app/lib/api/apiErrors';
import type { AccountData } from '../validationsaccount';

type Step = 'confirm' | 'loading' | 'success' | 'error';

interface ApproveAccountModalProps {
  account: AccountData | null;
  onClose: () => void;
  /** Appelé après une approbation réussie (ex. recharger la liste). */
  onApproved?: () => void;
}

export default function ApproveAccountModal({ account, onClose, onApproved }: ApproveAccountModalProps) {
  const [step, setStep]   = useState<Step>('confirm');
  const [error, setError] = useState('');

  // Réinitialiser à chaque nouveau compte
  useEffect(() => {
    setStep('confirm');
    setError('');
  }, [account?.id]);

  // Échap pour fermer (sauf pendant l'appel)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'loading') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, onClose]);

  if (!account) return null;

  const memberName =
    account.member_details?.full_name ??
    `${account.member_details?.first_name ?? ''} ${account.member_details?.last_name ?? ''}`.trim();

  const handleConfirm = async () => {
    setStep('loading');
    try {
      await approveAccount(account.id);
      setStep('success');
      onApproved?.();
    } catch (err) {
      setError(parseApiError(err, {}, "Impossible d'approuver le compte.").message);
      setStep('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={() => step !== 'loading' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Succès ───────────────────────────────────────────── */}
        {step === 'success' && (
          <>
            <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] px-6 pt-8 pb-7 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Compte approuvé</h2>
              <p className="text-sm text-white/80 mt-1">{memberName || 'Membre'}</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="px-4 py-3 rounded-xl bg-[#F9F9F6] border border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Compte</p>
                <p className="font-mono font-semibold text-gray-900">{account.account_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="px-4 py-3 rounded-xl bg-[#F9F9F6] border border-gray-100">
                  <p className="text-xs text-gray-500">Ancien statut</p>
                  <p className="text-sm font-semibold text-amber-700">En attente</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-[#DDEAD5]/50 border border-[#81C784]/50">
                  <p className="text-xs text-gray-500">Nouveau statut</p>
                  <p className="text-sm font-semibold text-[#1B5E20]">Ouvert</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Ce compte peut maintenant recevoir des dépôts.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#2E7D32] to-[#1B5E20] shadow-md hover:shadow-lg transition-all"
              >
                Fermer
              </button>
            </div>
          </>
        )}

        {/* ── Confirmation / chargement / erreur ───────────────── */}
        {step !== 'success' && (
          <>
            <div className="flex items-start justify-between gap-3 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Approuver le compte</h2>
                  <p className="text-xs text-gray-400">Validation avant les premiers dépôts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={step === 'loading'}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="px-4 py-3 rounded-xl bg-[#F9F9F6] border border-gray-100">
                <p className="font-mono font-semibold text-gray-900">{account.account_number}</p>
                <p className="text-sm text-gray-600">{memberName || 'Membre non renseigné'}</p>
              </div>

              <p className="text-sm text-gray-600">
                Une fois approuvé, le compte passera au statut <span className="font-semibold text-[#1B5E20]">Ouvert</span> et
                pourra recevoir des dépôts. Vérifiez que les pièces d&apos;identité du membre ont bien été contrôlées.
              </p>

              {step === 'error' && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={step === 'loading'}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {step === 'error' ? 'Fermer' : 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={step === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#2E7D32] to-[#1B5E20] shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {step === 'loading'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Approbation…</>
                    : <><BadgeCheck className="w-4 h-4" /> {step === 'error' ? 'Réessayer' : 'Approuver'}</>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}