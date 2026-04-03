'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, XCircle, MapPin, Briefcase, Archive, Loader2 } from 'lucide-react';
import { BulkAction } from './BulkActionDropdown';
import { BranchData, Post, EmployeeData } from '@/app/components/employees/validations';

interface BulkActionModalProps {
  action:        BulkAction | null;
  employees:     EmployeeData[];
  branches:      BranchData[];
  posts:         Post[];
  onClose:       () => void;
  onConfirm:     (action: BulkAction, payload?: string) => Promise<void>;
}

// ─── Config par action ─────────────────────────────────────────────────────────
const ACTION_CONFIG: Record<
  BulkAction,
  {
    title:       (count: number) => string;
    description: (count: number) => string;
    icon:        React.ReactNode;
    confirmLabel: string;
    danger:      boolean;
    needsSelect: boolean;
  }
> = {
  activate: {
    title:        n => `Activer ${n} employé${n > 1 ? 's' : ''}`,
    description:  n => `Ces ${n} employé${n > 1 ? 's' : ''} seront marqués comme Actifs et pourront opérer des transactions.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: 'Activer',
    danger:       false,
    needsSelect:  false,
  },
  deactivate: {
    title:        n => `Désactiver ${n} employé${n > 1 ? 's' : ''}`,
    description:  n => `Ces ${n} employé${n > 1 ? 's' : ''} seront marqués comme Inactifs. Ils ne pourront plus ouvrir de caisse.`,
    icon:         <XCircle className="w-5 h-5 text-yellow-500" />,
    confirmLabel: 'Désactiver',
    danger:       false,
    needsSelect:  false,
  },
  change_branch: {
    title:        n => `Transférer ${n} employé${n > 1 ? 's' : ''}`,
    description:  n => `Choisissez la succursale cible pour ces ${n} employé${n > 1 ? 's' : ''}.`,
    icon:         <MapPin className="w-5 h-5 text-blue-500" />,
    confirmLabel: 'Transférer',
    danger:       false,
    needsSelect:  true,
  },
  change_post: {
    title:        n => `Assigner un poste à ${n} employé${n > 1 ? 's' : ''}`,
    description:  n => `Le poste sélectionné remplacera le poste principal de ces ${n} employé${n > 1 ? 's' : ''}.`,
    icon:         <Briefcase className="w-5 h-5 text-purple-500" />,
    confirmLabel: 'Assigner',
    danger:       false,
    needsSelect:  true,
  },
  archive: {
    title:        n => `Archiver ${n} employé${n > 1 ? 's' : ''}`,
    description:  n => `Ces ${n} employé${n > 1 ? 's' : ''} seront déplacés vers l'archive. Toute réactivation devra être approuvée.`,
    icon:         <Archive className="w-5 h-5 text-red-500" />,
    confirmLabel: 'Archiver quand même',
    danger:       true,
    needsSelect:  false,
  },
  export: {
    title:        n => `Exporter ${n} employé${n > 1 ? 's' : ''}`,
    description:  n => `Les données de ${n} employé${n > 1 ? 's' : ''} sélectionnés seront exportées en CSV.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: 'Exporter en CSV',
    danger:       false,
    needsSelect:  false,
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────
const BulkActionModal: React.FC<BulkActionModalProps> = ({
  action,
  employees,
  branches,
  posts,
  onClose,
  onConfirm,
}) => {
  const [selectedValue, setSelectedValue] = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  // Reset quand l'action change
  useEffect(() => {
    setSelectedValue('');
    setError(null);
    setIsLoading(false);
  }, [action]);

  if (!action) return null;

  const cfg   = ACTION_CONFIG[action];
  const count = employees.length;

  const handleConfirm = async () => {
    if (cfg.needsSelect && !selectedValue) {
      setError('Veuillez faire une sélection.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(action, selectedValue || undefined);
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
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              cfg.danger ? 'bg-red-100' : 'bg-[#DDEAD5]'
            }`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title(count)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{count} employé{count > 1 ? 's' : ''} concerné{count > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Description */}
          <p className="text-sm text-gray-600">{cfg.description(count)}</p>

          {/* Aperçu des employés sélectionnés (max 3) */}
          <div className="flex flex-wrap gap-1.5">
            {employees.slice(0, 3).map(e => (
              <span key={String(e.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                {e.first_name} {e.last_name}
              </span>
            ))}
            {count > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                +{count - 3} autres
              </span>
            )}
          </div>
          {/* ← COLLE ICI */}
          {action === 'activate' && (() => {
            const n = employees.filter(e => (e.status ?? 'active') === 'active').length;
            return n > 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
                {n} employé{n > 1 ? 's sont déjà actifs' : ' est déjà actif'} — ils seront ignorés.
              </p>
            ) : null;
          })()}

          {action === 'deactivate' && (() => {
            const n = employees.filter(e => e.status === 'inactive').length;
            return n > 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
                {n} employé{n > 1 ? 's sont déjà inactifs' : ' est déjà inactif'} — ils seront ignorés.
              </p>
            ) : null;
          })()}
          {/* Select pour branch / post */}
          {cfg.needsSelect && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {action === 'change_branch' ? 'Succursale cible' : 'Poste à assigner'}
              </label>
              <select
                value={selectedValue}
                onChange={e => { setSelectedValue(e.target.value); setError(null); }}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 ${
                  error ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">
                  {action === 'change_branch' ? '— Choisir une succursale —' : '— Choisir un poste —'}
                </option>
                {action === 'change_branch'
                  ? branches.map(b => (
                      <option key={String(b.id)} value={String(b.id)}>
                        {b.branch_name}
                      </option>
                    ))
                  : posts.map(p => (
                      <option key={String(p.id)} value={String(p.id)}>
                        {p.name || p.post_name}
                      </option>
                    ))
                }
              </select>
            </div>
          )}

          {/* Avertissement danger */}
          {cfg.danger && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">
                Cette action déplacera les employés vers l'archive. Ils n'auront plus accès au système.
                Une réactivation nécessite une approbation manuelle.
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              cfg.danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {cfg.confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BulkActionModal;