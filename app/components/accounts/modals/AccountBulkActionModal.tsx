'use client';

import React, { useMemo, useState } from 'react';
import {
  X, CheckCircle2, ShieldOff, ShieldCheck, XCircle, BadgeCheck,
  AlertTriangle, Loader2, CheckCheck,
} from 'lucide-react';
import { AccountData } from '../validationsaccount';
import { AccountBulkAction, checkEligibility } from '@/app/lib/api/accountRules';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AccountBulkActionModalProps {
  action:    AccountBulkAction | null;
  accounts:  AccountData[];
  onClose:   () => void;
  onConfirm: (action: AccountBulkAction, eligibleIds: string[]) => Promise<void>;
}

// ─── Config par action ─────────────────────────────────────────────────────────

type ActionConfig = {
  title:        (n: number) => string;
  description:  (n: number) => string;
  icon:         React.ReactNode;
  confirmLabel: (n: number) => string;
  danger:       boolean;
  color:        string;
};

const s = (n: number) => (n > 1 ? 's' : '');

const ACTION_CONFIG: Record<AccountBulkAction, ActionConfig> = {
  approve: {
    title:        (n) => `Approuver ${n} compte${s(n)}`,
    description:  (n) => `Ces ${n} compte${s(n)} passeront au statut Ouvert et pourront recevoir des dépôts. Vérifiez que les pièces d'identité des membres ont bien été contrôlées.`,
    icon:         <BadgeCheck className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Approuver ${n} compte${s(n)}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
  activate: {
    title:        (n) => `Débloquer ${n} compte${s(n)}`,
    description:  (n) => `Ces ${n} compte${s(n)} seront réouverts et les transactions autorisées à nouveau.`,
    icon:         <ShieldCheck className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Débloquer ${n} compte${s(n)}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
  suspend: {
    title:        (n) => `Geler ${n} compte${s(n)}`,
    description:  (n) => `Ces ${n} compte${s(n)} seront gelés. Aucune transaction ne sera autorisée.`,
    icon:         <ShieldOff className="w-5 h-5 text-[#355C7D]" />,
    confirmLabel: (n) => `Geler ${n} compte${s(n)}`,
    danger:       false,
    color:        'bg-blue-50',
  },
  close: {
    title:        (n) => `Fermer ${n} compte${s(n)}`,
    description:  () => `Fermeture définitive. Les données seront conservées pour la traçabilité.`,
    icon:         <XCircle className="w-5 h-5 text-red-600" />,
    confirmLabel: (n) => `Fermer les ${n} compte${s(n)} admissible${s(n)}`,
    danger:       true,
    color:        'bg-red-50',
  },
  export: {
    title:        (n) => `Exporter ${n} compte${s(n)}`,
    description:  (n) => `Les données de ${n} compte${s(n)} seront exportées en CSV.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: () => `Exporter en CSV`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

const AccountBulkActionModal: React.FC<AccountBulkActionModalProps> = ({
  action, accounts, onClose, onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const cfg = action ? ACTION_CONFIG[action] : null;

  const { eligible, refused } = useMemo(
    () => (action ? checkEligibility(action, accounts) : { eligible: [], refused: [] }),
    [action, accounts],
  );

  if (!action || !cfg) return null;
  const canConfirm = eligible.length > 0;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(action, eligible.map(a => a.id as string));
      onClose();
    } catch (e: any) {
      // Échec partiel : on garde le modal ouvert pour afficher le détail
      setError(e?.message ?? 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBtnClass = cfg.danger
    ? 'bg-red-600 hover:bg-red-700'
    : action === 'suspend'
      ? 'bg-[#355C7D] hover:bg-[#2A4A5E]'
      : 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className={`flex items-start justify-between p-5 border-b ${cfg.danger ? 'border-red-100 bg-red-50' : 'border-gray-100 ' + cfg.color}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.danger ? 'bg-red-100' : 'bg-white/60'}`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title(eligible.length)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {accounts.length} compte{s(accounts.length)} sélectionné{s(accounts.length)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          <p className="text-sm text-gray-600">{cfg.description(eligible.length)}</p>

          {/* ── Comptes admissibles ── */}
          {eligible.length > 0 && (
            <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DDEAD5]/60">
                <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-semibold text-[#1B5E20]">
                  {eligible.length} compte{s(eligible.length)} admissible{s(eligible.length)}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {eligible.slice(0, 5).map(acc => (
                  <div key={acc.id as string} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-xs font-semibold font-mono text-gray-800">{acc.account_number}</p>
                      <p className="text-xs text-gray-400">{acc.member_details?.full_name ?? '—'}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#1B5E20]">
                      {(acc.soldeActuel ?? 0).toLocaleString('fr-FR')} HTG
                    </span>
                  </div>
                ))}
                {eligible.length > 5 && (
                  <div className="px-4 py-2 text-xs text-gray-400">
                    +{eligible.length - 5} autres comptes admissibles
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Comptes refusés ── */}
          {refused.length > 0 && (
            <div className="rounded-xl border border-red-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-700">
                  {refused.length} compte{s(refused.length)} non concerné{s(refused.length)}
                  {eligible.length > 0 && ` — ignoré${s(refused.length)}`}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {refused.map(({ account, reasons }) => (
                  <div key={account.id as string} className="px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold font-mono text-gray-700">{account.account_number}</p>
                      <p className="text-xs text-gray-400">{account.member_details?.full_name ?? '—'}</p>
                    </div>
                    {reasons.map((r, ri) => (
                      <p key={ri} className="text-xs text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                        {r}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Cas : aucun admissible ── */}
          {eligible.length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                Aucun compte ne remplit les conditions requises pour cette action.
              </p>
            </div>
          )}

          {/* ── Rappel approbation (principe des 4 yeux) ── */}
          {action === 'approve' && eligible.length > 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Vous ne pouvez pas approuver un compte que vous avez ouvert vous-même : une autre personne doit le valider.
                Si c'est le cas pour un de ces comptes, il sera ignoré et les autres seront approuvés.
              </p>
            </div>
          )}

          {/* ── Warning fermeture ── */}
          {action === 'close' && eligible.length > 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                La fermeture est définitive. Les données seront conservées pour la traçabilité et l&apos;audit conformément aux réglementations bancaires.
              </p>
            </div>
          )}

          {/* ── Résultat partiel / erreur ── */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium whitespace-pre-line">{error}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {error ? 'Fermer' : 'Annuler'}
          </button>
          {!error && (
            <button
              onClick={handleConfirm}
              disabled={isLoading || !canConfirm}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${confirmBtnClass}`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {cfg.confirmLabel(eligible.length)}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AccountBulkActionModal;