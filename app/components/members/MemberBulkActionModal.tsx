'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, XCircle, Archive, Loader2 } from 'lucide-react';
import { MemberBulkAction } from './MemberBulkActionDropdown';
import { MemberData } from '@/app/components/members/validations';

interface MemberBulkActionModalProps {
  action:    MemberBulkAction | null;
  members:   MemberData[];
  onClose:   () => void;
  onConfirm: (action: MemberBulkAction) => Promise<void>;
}

const ACTION_CONFIG: Record<
  MemberBulkAction,
  {
    title:        (count: number) => string;
    description:  (count: number) => string;
    icon:         React.ReactNode;
    confirmLabel: string;
    danger:       boolean;
  }
> = {
  activate: {
    title:        n => `Activer ${n} membre${n > 1 ? 's' : ''}`,
    description:  n => `Ces ${n} membre${n > 1 ? 's' : ''} seront marqués comme Actifs.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: 'Activer',
    danger:       false,
  },
  deactivate: {
    title:        n => `Désactiver ${n} membre${n > 1 ? 's' : ''}`,
    description:  n => `Ces ${n} membre${n > 1 ? 's' : ''} seront marqués comme Inactifs.`,
    icon:         <XCircle className="w-5 h-5 text-yellow-500" />,
    confirmLabel: 'Désactiver',
    danger:       false,
  },
  archive: {
    title:        n => `Archiver ${n} membre${n > 1 ? 's' : ''}`,
    description:  n => `Ces ${n} membre${n > 1 ? 's' : ''} seront déplacés vers l'archive.`,
    icon:         <Archive className="w-5 h-5 text-red-500" />,
    confirmLabel: 'Archiver quand même',
    danger:       true,
  },
  export: {
    title:        n => `Exporter ${n} membre${n > 1 ? 's' : ''}`,
    description:  n => `Les données de ${n} membre${n > 1 ? 's' : ''} seront exportées en CSV.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: 'Exporter en CSV',
    danger:       false,
  },
};

const MemberBulkActionModal: React.FC<MemberBulkActionModalProps> = ({
  action, members, onClose, onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setIsLoading(false);
  }, [action]);

  if (!action) return null;

  const cfg   = ACTION_CONFIG[action];
  const count = members.length;

  // Feedback ignorés
  function isActiveMember(m: MemberData): boolean {
    return !isArchivedMember(m) && (m.status === true || (m.status as any) === 'true' || (m.status as any) === 'active');
  }
  function isArchivedMember(m: MemberData): boolean {
    return (m.status as any) === 'archive' || (m.status as any) === 'archived';
  }

  const alreadyActive   = members.filter(m =>  isActiveMember(m)).length;
  const alreadyInactive = members.filter(m => !isActiveMember(m) && !isArchivedMember(m)).length;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(action);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className={`flex items-start justify-between p-5 border-b ${cfg.danger ? 'border-red-100 bg-red-50' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.danger ? 'bg-red-100' : 'bg-[#DDEAD5]'}`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title(count)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{count} membre{count > 1 ? 's' : ''} concerné{count > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          <p className="text-sm text-gray-600">{cfg.description(count)}</p>

          {/* Aperçu membres sélectionnés */}
          <div className="flex flex-wrap gap-1.5">
            {members.slice(0, 3).map(m => (
              <span key={String(m.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                {m.first_name} {m.last_name}
              </span>
            ))}
            {count > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                +{count - 3} autres
              </span>
            )}
          </div>

          {/* Feedback : membres déjà dans le bon statut */}
          {action === 'activate' && alreadyActive > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
              {alreadyActive} membre{alreadyActive > 1 ? 's sont déjà actifs' : ' est déjà actif'} — ils seront ignorés.
            </p>
          )}
          {action === 'deactivate' && alreadyInactive > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
              {alreadyInactive} membre{alreadyInactive > 1 ? 's sont déjà inactifs' : ' est déjà inactif'} — ils seront ignorés.
            </p>
          )}

          {/* Warning danger */}
          {cfg.danger && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">
                Les membres archivés n'auront plus accès à leurs comptes. Une réactivation nécessite une approbation manuelle.
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button onClick={handleConfirm} disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              cfg.danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md'
            }`}>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {cfg.confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MemberBulkActionModal;