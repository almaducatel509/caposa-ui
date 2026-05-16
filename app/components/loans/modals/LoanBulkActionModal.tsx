'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  X, AlertTriangle, CheckCircle2, XCircle, Bell, Banknote,
  Archive, Loader2, CheckCheck, Download, Trash2,
} from 'lucide-react';
import { LoanBulkAction } from '../LoanBulkActionDropdown';
import { LoanStatus } from '../../transactions/validation/loanSchema';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LoanForBulk {
  id_loan:           string;          // LoanData.id_loan
  member_name:       string;          // LoanData.member_name
  id_member:         string;          // LoanData.id_member
  montantDemande:    number;          // LoanData.montantDemande
  status:            LoanStatus;      // LoanData.status

  // Champs optionnels existants dans LoanData
  late_days?:        number;          // LoanData.loan_details.late_days
  remaining_balance?: number;         // LoanData.loan_details.remaining_balance
  duration_months?:  number;          // LoanData.loan_details.duration_months
  payments_made?:    number;          // LoanData.loan_details.payments_made
}

interface LoanBulkActionModalProps {
  action:    LoanBulkAction | null;
  loans:     LoanForBulk[];
  onClose:   () => void;
  onConfirm: (action: LoanBulkAction, eligibleIds: (string | number)[], payload?: string) => Promise<void>;
}

// ─── Config par action ─────────────────────────────────────────────────────────

type ActionConfig = {
  title:        (n: number) => string;
  description:  (n: number) => string;
  icon:         React.ReactNode;
  confirmLabel: (n: number) => string;
  danger:       boolean;
  color:        string;
  needsSelect:  boolean;
  selectLabel?: string;
  selectOptions?: { value: string; label: string }[];
  extraWarning?: string;
};

const ACTION_CONFIG: Record<LoanBulkAction, ActionConfig> = {
  export: {
    title:        (n) => `Exporter ${n} prêt${n > 1 ? 's' : ''}`,
    description:  (n) => `Les données de ces ${n} prêt${n > 1 ? 's' : ''} seront exportées en CSV.`,
    icon:         <Download className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (_n) => `Exporter en CSV`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
    needsSelect:  false,
  },
  approve: {
    title:        (n) => `Approuver ${n} demande${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} demande${n > 1 ? 's' : ''} passeront au statut "Approuvé" et seront prêtes pour décaissement.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Approuver ${n} demande${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
    needsSelect:  false,
  },
  reject: {
    title:        (n) => `Rejeter ${n} demande${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} demande${n > 1 ? 's' : ''} seront marquées comme "Rejetées" et archivées.`,
    icon:         <XCircle className="w-5 h-5 text-red-500" />,
    confirmLabel: (n) => `Rejeter ${n} demande${n > 1 ? 's' : ''}`,
    danger:       true,
    color:        'bg-red-50',
    needsSelect:  true,
    selectLabel:  'Motif de rejet',
    selectOptions: [
      { value: 'insufficient_income',   label: 'Revenus insuffisants' },
      { value: 'missing_collateral',    label: 'Garantie insuffisante' },
      { value: 'incomplete_documents',  label: 'Documents incomplets' },
      { value: 'credit_history',        label: 'Historique de crédit défavorable' },
      { value: 'existing_loans',        label: 'Trop de prêts actifs' },
      { value: 'other',                 label: 'Autre motif' },
    ],
  },
  disburse: {
    title:        (n) => `Décaisser ${n} prêt${n > 1 ? 's' : ''}`,
    description:  (n) => `Les fonds seront transférés aux membres et ces ${n} prêt${n > 1 ? 's' : ''} passeront au statut "Décaissé". L'échéancier de remboursement sera activé.`,
    icon:         <Banknote className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Décaisser ${n} prêt${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
    needsSelect:  false,
    extraWarning: 'Le décaissement est irréversible. Assurez-vous que les fonds sont disponibles en caisse.',
  },
  send_reminder: {
    title:        (n) => `Envoyer un rappel à ${n} membre${n > 1 ? 's' : ''}`,
    description:  (n) => `Un SMS/email de rappel de paiement sera envoyé à ${n} membre${n > 1 ? 's' : ''}.`,
    icon:         <Bell className="w-5 h-5 text-purple-500" />,
    confirmLabel: (n) => `Envoyer ${n} rappel${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-purple-50',
    needsSelect:  true,
    selectLabel:  'Canal d\'envoi',
    selectOptions: [
      { value: 'sms',   label: 'SMS uniquement' },
      { value: 'email', label: 'Email uniquement' },
      { value: 'both',  label: 'SMS + Email' },
    ],
  },
  mark_payment: {
    title:        (n) => `Enregistrer un paiement pour ${n} prêt${n > 1 ? 's' : ''}`,
    description:  (n) => `Un paiement mensuel sera enregistré pour ces ${n} prêt${n > 1 ? 's' : ''}. Le solde et la progression seront mis à jour.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Marquer ${n} paiement${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
    needsSelect:  true,
    selectLabel:  'Type de paiement',
    selectOptions: [
      { value: 'monthly',   label: 'Paiement mensuel régulier' },
      { value: 'partial',   label: 'Paiement partiel' },
      { value: 'full_early', label: 'Remboursement anticipé total' },
    ],
  },
  archive: {
    title:        (n) => `Archiver ${n} prêt${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} prêt${n > 1 ? 's' : ''} seront déplacés vers l'archive et passeront en lecture seule.`,
    icon:         <Archive className="w-5 h-5 text-red-500" />,
    confirmLabel: (n) => `Archiver ${n} prêt${n > 1 ? 's' : ''}`,
    danger:       true,
    color:        'bg-red-50',
    needsSelect:  false,
    extraWarning: 'Cette action est définitive. Seuls les prêts remboursés ou soldés peuvent être archivés.',
  },
  delete: {
    title:        (n) => `Supprimer ${n} demande${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} demande${n > 1 ? 's' : ''} seront définitivement supprimées du système.`,
    icon:         <Trash2 className="w-5 h-5 text-red-500" />,
    confirmLabel: (n) => `Supprimer ${n} demande${n > 1 ? 's' : ''}`,
    danger:       true,
    color:        'bg-red-50',
    needsSelect:  false,
    extraWarning: 'Action irréversible. Seules les demandes en attente peuvent être supprimées. Les prêts décaissés doivent être archivés.',
  },
};

// ─── Règles métier ─────────────────────────────────────────────────────────────

interface EligibilityResult {
  eligible: LoanForBulk[];
  refused:  { loan: LoanForBulk; reasons: string[] }[];
}

function checkLoanEligibility(action: LoanBulkAction, loans: LoanForBulk[]): EligibilityResult {
  const eligible: LoanForBulk[] = [];
  const refused:  { loan: LoanForBulk; reasons: string[] }[] = [];

  for (const loan of loans) {
    const reasons: string[] = [];

    switch (action) {
      // ── Export : toujours éligible ──
      case 'export':
        break;

      // ── Approuver : seulement en_attente ──
      case 'approve':
        if (loan.status !== 'en_attente') {
          reasons.push(`Statut "${loan.status}" — seules les demandes en attente peuvent être approuvées`);
        }
        break;

      // ── Rejeter : en_attente ou approuve ──
      case 'reject':
        if (loan.status === 'decaisse') reasons.push('Prêt déjà décaissé — utilisez l\'archivage');
        if (loan.status === 'rembourse') reasons.push('Prêt déjà remboursé');
        if (loan.status === 'rejete')   reasons.push('Demande déjà rejetée');
        if (loan.status === 'annule')   reasons.push('Demande déjà annulée');
        break;

      // ── Décaisser : seulement approuve ──
      case 'disburse':
        if (loan.status !== 'approuve') {
          if (loan.status === 'en_attente')   reasons.push('Demande non approuvée — approuvez-la d\'abord');
          else if (loan.status === 'decaisse') reasons.push('Prêt déjà décaissé');
          else                                 reasons.push(`Statut "${loan.status}" — décaissement impossible`);
        }
        break;

      // ── Rappel : seulement décaissé avec solde restant ──
      case 'send_reminder':
        if (loan.status !== 'decaisse') {
          reasons.push('Prêt non actif — rappel non applicable');
        } else if (loan.remaining_balance !== undefined && loan.remaining_balance <= 0) {
          reasons.push('Solde soldé — aucun rappel nécessaire');
        }
        break;

      // ── Paiement : seulement décaissé ──
      case 'mark_payment':
        if (loan.status !== 'decaisse') {
          reasons.push('Prêt non actif — paiement non applicable');
        } else if (loan.remaining_balance !== undefined && loan.remaining_balance <= 0) {
          reasons.push('Prêt déjà soldé');
        }
        break;

      // ── Archivage : remboursé, rejeté, annulé uniquement ──
      case 'archive':
        if (loan.status === 'en_attente') reasons.push('Demande en attente — traitez-la d\'abord');
        if (loan.status === 'approuve')   reasons.push('Demande approuvée — décaissez ou rejetez d\'abord');
        if (loan.status === 'decaisse' && (loan.remaining_balance ?? 1) > 0) {
          reasons.push('Prêt actif avec solde restant — remboursement requis');
        }
        break;

      // ── Suppression : seulement en_attente ──
      case 'delete':
        if (loan.status !== 'en_attente') {
          reasons.push(`Statut "${loan.status}" — seules les demandes en attente peuvent être supprimées`);
        }
        break;
    }

    if (reasons.length > 0) refused.push({ loan, reasons });
    else eligible.push(loan);
  }

  return { eligible, refused };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<LoanStatus, string> = {
  en_attente: 'En attente', approuve: 'Approuvé', decaisse: 'Décaissé',
  rembourse:  'Remboursé',  rejete: 'Rejeté',     annule: 'Annulé',
};

const STATUS_BADGE: Record<LoanStatus, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  approuve:   'bg-blue-100 text-blue-700',
  decaisse:   'bg-[#DDEAD5] text-[#1B5E20]',
  rembourse:  'bg-green-100 text-green-700',
  rejete:     'bg-red-100 text-red-600',
  annule:     'bg-gray-100 text-gray-500',
};

const formatHTG = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

// ─── Component ─────────────────────────────────────────────────────────────────

const LoanBulkActionModal: React.FC<LoanBulkActionModalProps> = ({
  action, loans, onClose, onConfirm,
}) => {
  const [selectedValue, setSelectedValue] = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  useEffect(() => {
    setSelectedValue('');
    setError(null);
    setIsLoading(false);
  }, [action]);

  const cfg = action ? ACTION_CONFIG[action] : null;

  const { eligible, refused } = useMemo(
    () => action ? checkLoanEligibility(action, loans) : { eligible: [], refused: [] },
    [action, loans],
  );

  if (!action || !cfg) return null;

  const canConfirm = cfg.needsSelect
    ? eligible.length > 0 && selectedValue !== ''
    : eligible.length > 0;

  const handleConfirm = async () => {
    if (cfg.needsSelect && !selectedValue) {
      setError('Veuillez faire une sélection.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(action, eligible.map(l => l.id_loan), cfg.needsSelect ? selectedValue : undefined);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = eligible.reduce((s, l) => s + l.montantDemande, 0);

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
              <p className="text-sm font-semibold text-gray-900">{cfg.title(loans.length)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {loans.length} prêt{loans.length > 1 ? 's' : ''} sélectionné{loans.length > 1 ? 's' : ''}
                {eligible.length > 0 && ` · ${formatHTG(totalAmount)}`}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          <p className="text-sm text-gray-600">{cfg.description(loans.length)}</p>

          {/* ── Select contextuel ── */}
          {cfg.needsSelect && cfg.selectOptions && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {cfg.selectLabel}
              </label>
              <select
                value={selectedValue}
                onChange={e => { setSelectedValue(e.target.value); setError(null); }}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 ${
                  error ? 'border-red-300' : 'border-gray-200'
                }`}>
                <option value="">— Choisir —</option>
                {cfg.selectOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* ── Prêts admissibles ── */}
          {eligible.length > 0 && (
            <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#DDEAD5]/60">
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
                  <span className="text-xs font-semibold text-[#1B5E20]">
                    {eligible.length} prêt{eligible.length > 1 ? 's' : ''} admissible{eligible.length > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#1B5E20]">
                  {formatHTG(totalAmount)}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {eligible.slice(0, 5).map(loan => (
                  <div key={String(loan.id_loan)} className="flex items-center justify-between px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {loan.member_name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{loan.id_member}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-gray-700">{formatHTG(loan.montantDemande)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[loan.status]}`}>
                        {STATUS_LABELS[loan.status]}
                      </span>
                    </div>
                  </div>
                ))}
                {eligible.length > 5 && (
                  <div className="px-4 py-2 text-xs text-gray-400">
                    +{eligible.length - 5} autres prêts admissibles
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Prêts refusés ── */}
          {refused.length > 0 && (
            <div className="rounded-xl border border-red-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-700">
                  {refused.length} prêt{refused.length > 1 ? 's' : ''} refusé{refused.length > 1 ? 's' : ''}
                  {eligible.length > 0 && ' — sera ignoré'}
                </span>
              </div>
              <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                {refused.map(({ loan, reasons }) => (
                  <div key={String(loan.id_loan)} className="px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-700 truncate">
                          {loan.member_name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{loan.id_member}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[loan.status]}`}>
                        {STATUS_LABELS[loan.status]}
                      </span>
                    </div>
                    {reasons.map((r, ri) => (
                      <p key={ri} className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                        {r}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Aucun admissible ── */}
          {eligible.length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                Aucun prêt ne remplit les conditions requises pour cette action.
              </p>
            </div>
          )}

          {/* ── Warning spécifique ── */}
          {cfg.extraWarning && eligible.length > 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{cfg.extraWarning}</p>
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !canConfirm}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              cfg.danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md'
            }`}>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {cfg.confirmLabel(eligible.length)}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoanBulkActionModal;