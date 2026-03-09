'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, ShieldOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { AccountData } from '../validationsaccount';
import { suspendAccount, reactivateAccount } from '@/app/lib/api/accounts';

// ─── Props ─────────────────────────────────────────────────────────────────────
interface SuspendAccountModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  account:   AccountData | null;
  onSuccess: (updated: AccountData) => void;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const SuspendAccountModal: React.FC<SuspendAccountModalProps> = ({
  isOpen, onClose, account, onSuccess,
}) => {
  const [reason,      setReason]      = useState('');
  const [isSubmitting,setIsSubmitting] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Détecter l'action selon le statut actuel
  const isSuspended = account?.statutCompte === 'suspendu';
  const action      = isSuspended ? 'reactivate' : 'suspend';

  // Reset à chaque ouverture
  useEffect(() => {
    if (isOpen) { setReason(''); setError(null); }
  }, [isOpen, account]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleClose = () => { if (!isSubmitting) onClose(); };

  const handleSubmit = async () => {
    if (!account) return;

    // Raison obligatoire pour suspension
    if (action === 'suspend' && !reason.trim()) {
      setError('La raison de la suspension est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let updated: AccountData;

      if (action === 'suspend') {
        updated = await suspendAccount(account.id, { reason: reason.trim() });
      } else {
        updated = await reactivateAccount(account.id, { reason: reason.trim() });
      }

      onSuccess(updated);
      onClose();

    } catch (err: any) {
      console.error('❌ Erreur suspension/réactivation:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !account) return null;

  // ── Config visuelle selon l'action ─────────────────────────────────────────
  const cfg = isSuspended ? {
    icon:        ShieldCheck,
    iconBg:      'bg-linear-to-br from-[#2E7D32] to-[#1B5E20]',
    title:       'Réactiver le compte',
    subtitle:    `Compte ${account.account_number}`,
    description: 'Ce compte sera de nouveau opérationnel. Le membre pourra effectuer des dépôts, retraits et transactions.',
    bannerBg:    'bg-[#DDEAD5] border-[#2E7D32]/20',
    bannerIcon:  'text-[#2E7D32]',
    bannerText:  'text-[#1B5E20]',
    bannerMsg:   'La réactivation sera enregistrée dans le journal d\'audit avec la date, l\'heure et l\'auteur.',
    reasonLabel: 'Raison de la réactivation',
    reasonHint:  'Ex : Litige résolu, suspension levée par la direction…',
    required:    false,
    btnLabel:    'Réactiver le compte',
    btnClass:    'bg-linear-to-r from-[#2E7D32] to-[#1B5E20]',
  } : {
    icon:        ShieldOff,
    iconBg:      'bg-linear-to-br from-[#355C7D] to-[#2A4A5E]',
    title:       'Suspendre le compte',
    subtitle:    `Compte ${account.account_number}`,
    description: 'Toutes les opérations seront bloquées immédiatement. Le membre ne pourra plus effectuer de transactions.',
    bannerBg:    'bg-yellow-50 border-yellow-200',
    bannerIcon:  'text-yellow-600',
    bannerText:  'text-yellow-800',
    bannerMsg:   'La suspension sera enregistrée dans le journal d\'audit. Elle peut être levée à tout moment par un superviseur.',
    reasonLabel: 'Raison de la suspension',
    reasonHint:  'Ex : Activité suspecte, demande du membre, contrôle interne…',
    required:    true,
    btnLabel:    'Confirmer la suspension',
    btnClass:    'bg-linear-to-r from-[#355C7D] to-[#2A4A5E]',
  };

  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">{cfg.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">{cfg.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Info membre + compte */}
          <div className="flex items-center gap-3 p-3 bg-[#F9F9F6] rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#1B5E20]">
                {account.member_details?.full_name?.[0] ?? '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {account.member_details?.full_name ?? account.id_membre ?? '—'}
              </p>
              <p className="text-xs text-gray-400 font-mono">{account.account_number}</p>
            </div>
            <div className="ml-auto shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isSuspended ? 'bg-blue-50 text-[#355C7D]' : 'bg-[#DDEAD5] text-[#1B5E20]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-[#355C7D]' : 'bg-[#2E7D32]'}`} />
                {isSuspended ? 'Suspendu' : 'Actif'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{cfg.description}</p>

          {/* Bannière audit */}
          <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${cfg.bannerBg}`}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.bannerIcon}`} />
            <p className={`text-xs leading-relaxed ${cfg.bannerText}`}>{cfg.bannerMsg}</p>
          </div>

          {/* Champ raison */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {cfg.reasonLabel}
              {cfg.required && <span className="text-red-500 ml-1">*</span>}
              {!cfg.required && <span className="text-gray-400 font-normal ml-1">(optionnel)</span>}
            </label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError(null); }}
              placeholder={cfg.reasonHint}
              rows={3}
              disabled={isSubmitting}
              className={`w-full px-3 py-2.5 text-sm border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all disabled:bg-gray-50 disabled:text-gray-400 ${
                error
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : 'border-gray-200 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]'
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <X className="w-3 h-3" /> {error}
              </p>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-[#F9F9F6]">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${cfg.btnClass}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isSuspended ? 'Réactivation…' : 'Suspension…'}
              </>
            ) : (
              <>
                <Icon className="w-4 h-4" />
                {cfg.btnLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendAccountModal;