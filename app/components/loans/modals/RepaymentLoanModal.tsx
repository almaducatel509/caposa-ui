"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  CalendarDays,
} from "lucide-react";
import { Modal } from "../../ui/Modal";

// ─── Types ────────────────────────────────────────────────────────────────
export interface LoanForRepayment {
  id_loan: string;

  member_name: string;
  member_id: string;

  loan_details: {
    total_amount: number;

    monthly_payment: number;

    remaining_balance: number;

    repayment_frequency:
      | "mensuel"
      | "hebdomadaire"
      | "saisonnier";

    next_payment_date?: string;

    late_days?: number;

    payments_made?: number;
  };
}

interface RepaymentLoanModalProps {
  isOpen: boolean;
  loan: LoanForRepayment | null;
  onClose: () => void;

  onConfirm: (payload: {
    loan_id: string;
    amount_paid: number;
    note?: string;
  }) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const formatHTG = (n: number) =>
  new Intl.NumberFormat("fr-HT", {
    maximumFractionDigits: 0,
  }).format(n) + " HTG";

const formatDate = (date?: string) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(new Date(date));
};

// ─── Component ────────────────────────────────────────────────────────────
const RepaymentLoanModal: React.FC<RepaymentLoanModalProps> = ({
  isOpen,
  loan,
  onClose,
  onConfirm,
}) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [note, setNote] = useState("");

  const [confirmed, setConfirmed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
useEffect(() => {
  if (isOpen) {
    setAmountPaid("");
    setNote("");
    setConfirmed(false);
    setError(null);
    setIsLoading(false);
  }
}, [isOpen, loan]);

// ─── Safe destructuring (loan peut être null) ──────────────────────────
const {
  total_amount       = 0,
  monthly_payment    = 0,
  remaining_balance  = 0,
  repayment_frequency = "mensuel" as const,
  next_payment_date,
  late_days          = 0,
  payments_made      = 0,
} = loan?.loan_details ?? {};

// ─── Calcul pénalité retard ────────────────────────────────────────────
const lateFee = useMemo(() => {
  if (!late_days || late_days <= 0) return 0;
  return (monthly_payment * 0.02) * (late_days / 30);
}, [monthly_payment, late_days]);

// ─── Montant dû ────────────────────────────────────────────────────────
const montantDu = remaining_balance + lateFee;

// ─── Placeholder dynamique ─────────────────────────────────────────────
const paymentPlaceholder = useMemo(() => {
  switch (repayment_frequency) {
    case "hebdomadaire":
      return `Paiement hebdo : ${formatHTG(Math.round(monthly_payment / 4))}`;
    case "saisonnier":
      return `Paiement saisonnier : ${formatHTG(Math.round(monthly_payment * 3))}`;
    default:
      return `Mensualité : ${formatHTG(monthly_payment)}`;
  }
}, [repayment_frequency, monthly_payment]);

// ─── Submit ────────────────────────────────────────────────────────────
const handleSubmit = async () => {
  if (!loan) return;  // safety guard

  const parsedAmount = Number(amountPaid);

  if (!parsedAmount || parsedAmount <= 0) {
    setError("Veuillez entrer un montant valide.");
    return;
  }

  if (!confirmed) {
    setError("Veuillez confirmer le remboursement.");
    return;
  }

  try {
    setIsLoading(true);
    setError(null);

    await onConfirm({
      loan_id: loan.id_loan,
      amount_paid: parsedAmount,
      note,
    });

    onClose();
  } catch (e: any) {
    setError(e?.message ?? "Erreur lors de l'enregistrement du remboursement.");
  } finally {
    setIsLoading(false);
  }
};

// ─── Early return APRÈS tous les hooks ─────────────────────────────────
if (!loan) return null;

return (
  <Modal
    isOpen={isOpen}
    onClose={isLoading ? () => {} : onClose}
    size="4xl"
  >
    {/* ── Header ───────────────────────────────────────────── */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-[#2E7D32]" />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">
            Remboursement du prêt #{loan.id_loan}
          </p>

          <p className="text-xs text-gray-600 mt-0.5">
            Enregistrement d’un paiement
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>

    {/* ── Body ─────────────────────────────────────────────── */}
    {/* <div className="p-5 space-y-4"> */}
    <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5 max-h-[70vh]">

      {/* ── Membre ───────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
          Bénéficiaire
        </p>

        <p className="text-sm font-bold text-gray-800">
          {loan.member_name}
        </p>

        <p className="text-xs text-gray-400 font-mono">
          {loan.member_id}
        </p>
      </div>

      {/* ── Solde restant ───────────────────────────── */}
      <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] rounded-xl p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
          Solde restant
        </p>

        <p className="text-3xl font-bold text-white">
          {formatHTG(Math.round(montantDu))}
        </p>

        {lateFee > 0 && (
          <p className="text-xs text-amber-200 mt-2">
            Inclut {formatHTG(Math.round(lateFee))} de frais de retard
          </p>
        )}
      </div>

      {/* ── Détails ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">

        <div>
          <p className="text-xs text-gray-400">
            Montant total
          </p>

          <p className="text-sm font-semibold text-gray-700">
            {formatHTG(total_amount)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Paiements effectués
          </p>

          <p className="text-sm font-semibold text-gray-700">
            {payments_made ?? 0}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Fréquence
          </p>

          <p className="text-sm font-semibold text-gray-700 capitalize">
            {repayment_frequency}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Retard
          </p>

          <p className="text-sm font-semibold text-gray-700">
            {late_days ? `${late_days} jours` : "Aucun"}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-gray-400 mb-1">
            Prochaine échéance
          </p>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <CalendarDays className="w-4 h-4 text-[#2E7D32]" />
            {formatDate(next_payment_date)}
          </div>
        </div>
      </div>

      {/* ── Input montant ───────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Montant reçu
        </label>

        <input
          type="number"
          value={amountPaid}
          onChange={(e) => {
            setAmountPaid(e.target.value);
            setError(null);
          }}
          placeholder={paymentPlaceholder}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
        />
      </div>

      {/* ── Note ────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Note (optionnel)
        </label>

        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ajouter une note..."
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
        />
      </div>

      {/* ── Warning retard ─────────────────────────── */}
      {late_days > 0 && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />

          <p className="text-xs text-amber-700">
            Ce prêt présente un retard de{" "}
            <strong>{late_days} jours</strong>.
          </p>
        </div>
      )}

      {/* ── Confirmation ───────────────────────────── */}
      <label className="flex items-start gap-3 p-3 bg-[#F9F9F6] border border-gray-100 rounded-xl cursor-pointer hover:bg-[#DDEAD5]/20 transition-colors">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => {
            setConfirmed(e.target.checked);
            setError(null);
          }}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30"
        />

        <span className="text-sm text-gray-700">
          Je confirme avoir reçu{" "}
          <strong>
            {amountPaid
              ? formatHTG(Number(amountPaid))
              : "le paiement"}
          </strong>{" "}
          de {loan.member_name}.
        </span>
      </label>

      {/* ── Error ─────────────────────────────────── */}
      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>

    {/* ── Footer ───────────────────────────────────── */}
    <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">

      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Annuler
      </button>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !confirmed}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-[#2E7D32] to-[#1B5E20] rounded-xl hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Enregistrement…
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmer le remboursement
          </>
        )}
      </button>
    </div>
    {/* </div> */}
    </Modal>
  );
};

export default RepaymentLoanModal;