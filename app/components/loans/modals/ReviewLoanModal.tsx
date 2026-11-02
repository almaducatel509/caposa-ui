'use client';

/**
 * ReviewLoanModal.tsx — examiner un prêt et appliquer une action
 * ─────────────────────────────────────────────────────────────────
 * Une action = un endpoint Django (jamais de PATCH status) :
 *   approuver → POST /loans/{id}/approve/
 *   rejeter   → POST /loans/{id}/reject/   (motif obligatoire)
 *   décaisser → POST /loans/{id}/disburse/
 * Les notes passent par PATCH /loans/{id}/ (seul champ modifiable
 * après `pending`). Le remboursement a son propre modal (montant + mode).
 *
 * Le modal appelle l'API lui-même et renvoie le prêt rechargé au parent.
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Landmark, Lock, AlertTriangle, Loader2,
  CheckCircle2, XCircle, Banknote, Clock, ShieldCheck,
} from 'lucide-react';
import {
  LoanData, LoanStatus,
  LOAN_TYPE_LABELS, PAYMENT_FREQUENCY_LABELS, LOAN_STATUS_LABELS,
} from '../../transactions/validation/loanSchema';
import {
  approveLoan, rejectLoan, disburseLoan, updateLoan, fetchLoan,
} from '@/app/lib/api/loans';
import { useLoanPermissions } from '@/app/lib/useLoanPermissions';

// ─── Actions ──────────────────────────────────────────────────────
// Qui peut faire quoi : voir app/lib/useLoanPermissions.ts (source unique).

type ReviewAction = 'approve' | 'reject' | 'disburse';
const REVIEW_ACTIONS: ReviewAction[] = ['approve', 'reject', 'disburse'];

const ACTION_META: Record<ReviewAction, { label: string; button: string; danger?: boolean }> = {
  approve:  { label: 'Approuver le prêt', button: 'Approuver' },
  reject:   { label: 'Rejeter le prêt',   button: 'Rejeter', danger: true },
  disburse: { label: 'Décaisser le prêt', button: 'Décaisser' },
};

const STATUS_META: Record<LoanStatus, {
  icon: React.ElementType; color: string; bg: string; text: string; dot: string;
}> = {
  pending:  { icon: Clock,        color: '#F59E0B', bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  approved: { icon: CheckCircle2, color: '#355C7D', bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]' },
  active:   { icon: Banknote,     color: '#2E7D32', bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]' },
  paid:     { icon: CheckCircle2, color: '#22C55E', bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', dot: 'bg-[#22C55E]' },
  rejected: { icon: XCircle,      color: '#EF4444', bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
};

const FINAL_STATUSES: LoanStatus[] = ['paid', 'rejected'];

// ─── Props ────────────────────────────────────────────────────────

interface ReviewLoanModalProps {
  isOpen:          boolean;
  loan:            LoanData | null;
  onClose:         () => void;
  /** Appelé avec le prêt rechargé depuis Django après une action réussie. */
  onUpdated:       (loan: LoanData) => void;
  /**
   * Confirmation par mot de passe avant approbation / rejet (facultatif).
   * Django ne la vérifie pas : c'est une friction côté interface, pas une sécurité.
   * Sans cette prop, le champ mot de passe n'est pas affiché.
   */
  verifyPassword?: (password: string) => Promise<boolean>;
}

// ─── Helpers ──────────────────────────────────────────────────────

const formatHTG = (n: number | null | undefined) =>
  n === null || n === undefined
    ? '—'
    : new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' HTG';

/**
 * Django renvoie les dates sans heure ("2026-10-29"). new Date() les lit
 * comme minuit UTC, soit la veille au soir en Haïti / à Toronto.
 * On les lit à midi local pour garder le bon jour.
 */
const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
        .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const PER: Record<string, string> = { weekly: 'semaine', biweekly: '2 semaines', monthly: 'mois' };

const PASSWORD_ACTIONS: ReviewAction[] = ['approve', 'reject'];

// ─── Composant ────────────────────────────────────────────────────

const ReviewLoanModal: React.FC<ReviewLoanModalProps> = ({
  isOpen, loan, onClose, onUpdated, verifyPassword,
}) => {
  const { actionsFor } = useLoanPermissions();
  const [action,    setAction]    = useState<ReviewAction | ''>('');
  const [reason,    setReason]    = useState('');
  const [notes,     setNotes]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    setAction('');
    setReason('');
    setNotes(loan?.notes ?? '');
    setPassword('');
    setError(null);
    setIsLoading(false);
  }, [loan, isOpen]);

  const availableActions = useMemo<ReviewAction[]>(() => {
    if (!loan) return [];
    return actionsFor(loan.status).filter((a): a is ReviewAction =>
      (REVIEW_ACTIONS as string[]).includes(a));
  }, [loan, actionsFor]);

  const notesChanged   = notes !== (loan?.notes ?? '');
  const hasChanges     = action !== '' || notesChanged;
  const reasonNeeded   = action === 'reject';
  const passwordNeeded = Boolean(verifyPassword) && action !== '' && PASSWORD_ACTIONS.includes(action);

  if (!isOpen || !loan) return null;

  const meta     = STATUS_META[loan.status];
  const isFinal  = FINAL_STATUSES.includes(loan.status);

  const handleSubmit = async () => {
    if (!hasChanges) { setError('Aucune modification détectée.'); return; }
    if (reasonNeeded && !reason.trim()) { setError('Le motif du rejet est obligatoire.'); return; }
    if (passwordNeeded && !password.trim()) { setError('Votre mot de passe est requis pour confirmer cette action.'); return; }

    setIsLoading(true);
    setError(null);
    try {
      if (passwordNeeded && verifyPassword && !(await verifyPassword(password))) {
        setError('Mot de passe incorrect.');
        return;
      }

      // 1. L'action d'abord : si Django la refuse, on n'enregistre rien d'autre
      if (action === 'approve')  await approveLoan(loan.id);
      if (action === 'reject')   await rejectLoan(loan.id, reason);
      if (action === 'disburse') await disburseLoan(loan.id);

      // 2. Les notes ensuite (autorisées quel que soit le statut)
      if (notesChanged) await updateLoan(loan.id, { notes: notes.trim() || null });

      // 3. On recharge : statut, dates et échéancier viennent de Django
      onUpdated(await fetchLoan(loan.id));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const showSchedule = loan.status === 'active' || loan.status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ── En-tête ── */}
        <div className={`flex items-start justify-between p-5 border-b border-gray-100 ${meta.bg}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" style={{ color: meta.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                Examiner le prêt #{loan.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                <span className="capitalize">{loan.member_name}</span> · {loan.account_number}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Corps ── */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Section 1 : conditions (verrouillées par Django après `pending`) */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Conditions du prêt</h3>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Montant"        value={formatHTG(loan.loan_amount)} />
              <Field label="Type de prêt"   value={LOAN_TYPE_LABELS[loan.loan_type] ?? loan.loan_type} />
              <Field label="Durée"          value={`${loan.loan_duration} mois`} />
              <Field label="Taux d'intérêt" value={`${loan.interest_rate} % / an`} />
              <Field label="Remboursement"  value={PAYMENT_FREQUENCY_LABELS[loan.payment_frequency] ?? loan.payment_frequency} />
              <Field label="Échéance"       value={loan.installment_amount == null
                ? '—'
                : `${formatHTG(loan.installment_amount)} / ${PER[loan.payment_frequency] ?? loan.payment_frequency}`} />
              <Field label="Total dû"       value={formatHTG(loan.total_due)} />
              <Field label="Demandé le"     value={formatDate(loan.request_date)} />
              {loan.approval_date     && <Field label="Approuvé le" value={formatDate(loan.approval_date)} />}
              {loan.disbursement_date && <Field label="Décaissé le" value={formatDate(loan.disbursement_date)} />}
            </div>
          </section>

          {/* Section 2 : suivi du remboursement */}
          {showSchedule && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Remboursement</h3>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Déjà payé"         value={formatHTG(loan.amount_paid)} />
                <Field label="Solde restant"     value={formatHTG(loan.remaining_balance)} />
                <Field label="Prochaine échéance" value={formatDate(loan.next_due_date)} />
                <Field label="Échéance finale"    value={formatDate(loan.due_date)} />
              </div>
              {loan.is_late && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 font-semibold">
                    En retard de {loan.late_days} jour{(loan.late_days ?? 0) > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Motif de rejet existant */}
          {loan.status === 'rejected' && loan.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-semibold text-red-700 mb-1">Motif du rejet</p>
              <p className="text-sm text-red-800 whitespace-pre-line">{loan.rejection_reason}</p>
            </div>
          )}

          {/* Section 3 : action et notes */}
          <section className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Statut</label>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-gray-500">Actuel :</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {LOAN_STATUS_LABELS[loan.status]}
                </span>
              </div>

              {availableActions.length === 0 ? (
                <div className="flex items-start gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    {isFinal
                      ? 'Ce prêt est dans un statut final. Aucune action n’est possible.'
                      : loan.status === 'active'
                        ? 'Prêt en cours : les remboursements s’enregistrent depuis le bouton « Rembourser ». Il passera à « Remboursé » automatiquement une fois soldé.'
                        : 'Aucune action disponible pour votre rôle sur ce prêt. Vous pouvez tout de même modifier les notes.'}
                  </p>
                </div>
              ) : (
                <select
                  value={action}
                  onChange={e => { setAction(e.target.value as ReviewAction | ''); setError(null); }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                >
                  <option value="">Aucune action</option>
                  {availableActions.map(a => (
                    <option key={a} value={a}>{ACTION_META[a].label}</option>
                  ))}
                </select>
              )}
            </div>

            {reasonNeeded && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Motif du rejet <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => { setReason(e.target.value); setError(null); }}
                  placeholder="Ex : Revenus insuffisants, garanties non conformes…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] resize-none"
                />
              </div>
            )}

            {passwordNeeded && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <ShieldCheck className="w-3 h-3 inline mr-1" />
                  Confirmez avec votre mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Notes internes <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Commentaires, suivi, remarques d'analyse…"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] resize-none"
              />
            </div>
          </section>

          {action === 'reject' && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Le rejet est <strong>définitif</strong>. Le membre devra refaire une demande
                s&apos;il souhaite obtenir un financement.
              </p>
            </div>
          )}

          {action === 'disburse' && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                <strong>{formatHTG(loan.loan_amount)}</strong> seront crédités sur le compte{' '}
                <strong>{loan.account_number}</strong>, et l&apos;échéancier démarrera aujourd&apos;hui.
                Cette opération ne peut pas être annulée.
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* ── Pied ── */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {hasChanges
              ? <span className="text-[#2E7D32] font-semibold">● Modifications non enregistrées</span>
              : 'Aucune modification'}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !hasChanges}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                action && ACTION_META[action].danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md'
              }`}>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {action ? ACTION_META[action].button : 'Enregistrer les notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-700">{value}</p>
  </div>
);

export default ReviewLoanModal;