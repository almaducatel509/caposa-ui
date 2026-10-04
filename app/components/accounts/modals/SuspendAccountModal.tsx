'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, ShieldOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { AccountData } from '../validationsaccount';
import { suspendAccount, reactivateAccount } from '@/app/lib/api/accounts';

interface SuspendAccountModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  account:   AccountData | null;
  onSuccess: (updated: AccountData) => void;
}

const SuspendAccountModal: React.FC<SuspendAccountModalProps> = ({
  isOpen, onClose, account, onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  // ← reason retiré

  const isSuspended = account?.account_status === 'gele';
  const action = isSuspended ? 'reactivate' : 'suspend';

  useEffect(() => {
    if (isOpen) { setError(null); }   // ← setReason('') retiré
  }, [isOpen, account]);

  const handleClose  = () => { if (!isSubmitting) onClose(); };

  const handleSubmit = async () => {
    if (!account) return;
    // ← le bloc "if (action === 'suspend' && !reason.trim())" est retiré
    setIsSubmitting(true);
    setError(null);
    try {
      const updated: AccountData = action === 'suspend'
        ? await suspendAccount(account.id)
        : await reactivateAccount(account.id);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !account) return null;
    const cfg = isSuspended ? {
      Icon: ShieldCheck,
      iconBg: 'bg-[#DDEAD5]',
      iconColor: 'text-[#2E7D32]',
      headerBg: 'bg-gradient-to-r from-[#DDEAD5]/60 to-[#F9F9F6]',
      title: 'Débloquer le compte',
      subtitle: `Compte ${account.account_number}`,
      description: 'Ce compte sera de nouveau opérationnel. Le membre pourra effectuer des dépôts, retraits et transactions.',
      bannerBg: 'bg-[#DDEAD5]/50 border-[#2E7D32]/20',
      bannerIcon: 'text-[#2E7D32]',
      bannerText: 'text-[#1B5E20]',
      bannerMsg: "La réactivation sera enregistrée dans le journal d'audit avec la date, l'heure et l'auteur.",
      btnLabel: 'Débloquer le compte',
      btnClass: 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20]',
      statusBg: 'bg-blue-50 text-[#355C7D]',
      statusDot: 'bg-[#355C7D]',
      statusLabel: 'Gelé',
    } : {
      Icon: ShieldOff,
      iconBg: 'bg-blue-50',
      iconColor: 'text-[#355C7D]',
      headerBg: 'bg-gradient-to-r from-blue-50/60 to-[#F9F9F6]',
      title: 'Geler le compte',
      subtitle: `Compte ${account.account_number}`,
      description: 'Toutes les opérations seront bloquées immédiatement. Le membre ne pourra plus effectuer de transactions.',
      bannerBg: 'bg-yellow-50 border-yellow-200',
      bannerIcon: 'text-yellow-600',
      bannerText: 'text-yellow-800',
      bannerMsg: "La suspension sera enregistrée dans le journal d'audit. Elle peut être levée à tout moment par un superviseur.",
      btnLabel: 'Confirmer le gel',
      btnClass: 'bg-gradient-to-r from-[#355C7D] to-[#2A4A5E]',
      statusBg: 'bg-[#DDEAD5] text-[#1B5E20]',
      statusDot: 'bg-[#2E7D32]',
      statusLabel: 'Ouvert',
    };

  const { Icon } = cfg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className={`flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 ${cfg.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{cfg.subtitle}</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Info compte + membre */}
          <div className="flex items-center gap-3 p-3 bg-[#F9F9F6] rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#1B5E20]">
                {account.member_details?.full_name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {account.member_details?.full_name ?? account.id_membre ?? '—'}
              </p>
              <p className="text-xs text-gray-400 font-mono">{account.account_number}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.statusBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.statusDot}`} />
              {cfg.statusLabel}
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{cfg.description}</p>

          {/* Bannière audit */}
          <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${cfg.bannerBg}`}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.bannerIcon}`} />
            <p className={`text-xs leading-relaxed ${cfg.bannerText}`}>{cfg.bannerMsg}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-[#F9F9F6]">
          <button onClick={handleClose} disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed ${cfg.btnClass}`}>
            {isSubmitting
              ? <div><Loader2 className="w-3.5 h-3.5 animate-spin" />{isSuspended ? 'Déblocage…' : 'Gel…'}</div>
              : <div><Icon className="w-3.5 h-3.5" />{cfg.btnLabel}</div>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendAccountModal;