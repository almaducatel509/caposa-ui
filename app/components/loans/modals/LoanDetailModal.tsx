'use client';

/**
 * LoanDetailModal.tsx — fiche d'un prêt (lecture seule)
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/components/loans/modals/LoanDetailModal.tsx
 * Remplace TransactionDetailModal pour les prêts : un prêt n'est pas
 * une transaction et n'a ni caisse ni session.
 *
 * Les champs calculés par le backend s'affichent « — » tant qu'ils
 * ne sont pas fournis. Rien n'est recalculé ici.
 * ─────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { X, Landmark } from 'lucide-react';
import {
  LoanData, LOAN_TYPE_LABELS, LOAN_STATUS_LABELS, PAYMENT_FREQUENCY_LABELS,
} from '../../transactions/validation/loanSchema';

interface Props {
  loan:    LoanData | null;
  onClose: () => void;
}

const DASH = '—';
const htg  = (n: number | null | undefined) =>
  n == null ? DASH : new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 2 }).format(n) + ' HTG';
const date = (iso: string | null | undefined) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : DASH;

function Section({ title, rows }: { title: string; rows: [string, React.ReactNode][] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32] mb-2">{title}</p>
      <div className="divide-y divide-gray-50 rounded-xl border border-gray-100 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
            <span className="text-xs text-gray-500 shrink-0">{label}</span>
            <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoanDetailModal({ loan, onClose }: Props) {
  if (!loan) return null;

  const lateLabel =
    loan.late_days == null ? DASH
    : loan.late_days === 0  ? 'À jour'
    : `${loan.late_days} jour${loan.late_days > 1 ? 's' : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10"
      onClick={onClose}>
      <div className="w-full max-w-xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Prêt de {loan.member_name}</p>
              <p className="text-xs text-gray-400 font-mono">Réf. {loan.id.slice(0, 8).toUpperCase()} · {LOAN_STATUS_LABELS[loan.status]}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          <Section title="Conditions" rows={[
            ['Membre',         loan.member_name],
            ['Compte crédité', loan.account_number || DASH],
            ['Type',           LOAN_TYPE_LABELS[loan.loan_type] ?? loan.loan_type],
            ['Montant',        htg(loan.loan_amount)],
            ["Taux d'intérêt", `${loan.interest_rate} %`],
            ['Durée',          `${loan.loan_duration} mois`],
            ['Remboursement',  PAYMENT_FREQUENCY_LABELS[loan.payment_frequency] ?? loan.payment_frequency],
            ['Garant',         loan.guarantor_account ? 'Oui' : 'Aucun'],
          ]} />

          <Section title="Suivi" rows={[
            ['Demandé le',         date(loan.request_date ?? loan.created_at)],
            ['Approuvé le',        date(loan.approval_date)],
            ['Décaissé le',        date(loan.disbursement_date)],
            ['Fin prévue',         loan.disbursement_date ? date(loan.due_date) : DASH],
            ['Total dû',           htg(loan.total_due)],
            ['Échéance',           htg(loan.installment_amount)],
            ['Déjà remboursé',     htg(loan.amount_paid)],
            ['Solde restant',      htg(loan.remaining_balance)],
            ['Prochaine échéance', date(loan.next_due_date)],
            ['Retard',             lateLabel],
          ]} />

          {(loan.rejection_reason || loan.notes) && (
            <Section title="Notes" rows={[
              ...(loan.rejection_reason ? [['Raison du rejet', loan.rejection_reason] as [string, React.ReactNode]] : []),
              ...(loan.notes ? [['Objet et remarques', <span key="n" className="whitespace-pre-line font-normal">{loan.notes}</span>] as [string, React.ReactNode]] : []),
            ]} />
          )}
        </div>
      </div>
    </div>
  );
}