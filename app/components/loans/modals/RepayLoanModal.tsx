'use client';

/**
 * RepayLoanModal.tsx — enregistrer un remboursement
 * ─────────────────────────────────────────────────────────────────
 * POST /loans/{id}/repay/ via repayLoan().
 * - Espèces : la session caisse ouverte du caissier est trouvée
 *   automatiquement (erreur claire si aucune n'est ouverte).
 * - Débit du compte : prélevé sur le compte du membre (refusé par
 *   Django si fonds insuffisants ou compte gelé / fermé).
 * Django refuse tout montant supérieur au solde restant et passe le
 * prêt à « Remboursé » quand le solde atteint 0.
 * Un paiement partiel est accepté mais n'avance pas l'échéance.
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { X, Wallet, Banknote, CreditCard, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { LoanData } from '../../transactions/validation/loanSchema';
import { repayLoan, RepayMethod } from '@/app/lib/api/loans';

interface Props {
  loan:    LoanData;
  onClose: () => void;
  /** Appelé après un remboursement réussi (le parent recharge la liste). */
  onDone:  () => void;
}

const htg = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' HTG';

export default function RepayLoanModal({ loan, onClose, onDone }: Props) {
  const [amount,     setAmount]     = useState('');
  const [method,     setMethod]     = useState<RepayMethod>('cash');
  const [note,       setNote]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [result,     setResult]     = useState<{ remaining: number | null; paid: boolean } | null>(null);

  const remaining   = loan.remaining_balance ?? null;
  const installment = loan.installment_amount ?? null;
  const value       = Number(amount);
  const isPartial   = installment != null && value > 0 && value < installment;

  const handleSubmit = async () => {
    setError(null);
    if (!Number.isFinite(value) || value <= 0) { setError('Saisissez un montant supérieur à zéro.'); return; }
    if (remaining != null && value > remaining) { setError(`Le montant dépasse le solde restant (${htg(remaining)}).`); return; }

    setSubmitting(true);
    try {
      const res = await repayLoan(loan.id, { amount: value, method, note: note || undefined });
      setResult({ remaining: res.remaining_balance, paid: res.status === 'paid' });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’enregistrer le remboursement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-[#DDEAD5]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">Enregistrer un remboursement</p>
              <p className="text-xs text-gray-600 mt-0.5 truncate capitalize">{loan.member_name} · {loan.account_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:bg-white/60"><X className="w-4 h-4" /></button>
        </div>

        {result ? (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">
                {result.paid ? 'Prêt entièrement remboursé' : 'Remboursement enregistré'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {result.paid ? 'Le prêt passe au statut « Remboursé ».' : `Solde restant : ${htg(result.remaining)}`}
              </p>
            </div>
            <button onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white">
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Solde restant</p>
                  <p className="text-sm font-bold text-gray-800">{htg(remaining)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Échéance</p>
                  <p className="text-sm font-bold text-gray-800">{htg(installment)}</p>
                </div>
              </div>

              {loan.is_late && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 font-semibold">En retard de {loan.late_days} jour{(loan.late_days ?? 0) > 1 ? 's' : ''}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Montant (HTG) *</label>
                <input type="number" min={0} step="0.01" inputMode="decimal" value={amount}
                  onChange={e => { setAmount(e.target.value); setError(null); }}
                  className="w-full px-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]" />
                <div className="flex gap-2 mt-2">
                  {installment != null && (
                    <button type="button" onClick={() => setAmount(String(Math.min(installment, remaining ?? installment)))}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F9F9F6] border border-gray-200 text-gray-600 hover:border-[#2E7D32]">
                      Une échéance
                    </button>
                  )}
                  {remaining != null && (
                    <button type="button" onClick={() => setAmount(String(remaining))}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F9F9F6] border border-gray-200 text-gray-600 hover:border-[#2E7D32]">
                      Solder le prêt
                    </button>
                  )}
                </div>
                {isPartial && (
                  <p className="text-xs text-amber-700 mt-2">
                    Paiement partiel : il est enregistré, mais l&apos;échéance reste due tant qu&apos;elle n&apos;est pas complète.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mode de paiement *</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'cash',    label: 'Espèces',        hint: 'Session caisse ouverte', icon: Banknote   },
                    { id: 'account', label: 'Débit du compte', hint: loan.account_number,    icon: CreditCard },
                  ] as const).map(m => {
                    const Icon = m.icon;
                    const on = method === m.id;
                    return (
                      <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                        className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                          on ? 'border-[#2E7D32] bg-[#DDEAD5]/40' : 'border-gray-200 bg-[#F9F9F6] hover:border-[#81C784]'
                        }`}>
                        <Icon className={`w-4 h-4 ${on ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
                        <span className={`text-xs font-bold ${on ? 'text-[#1B5E20]' : 'text-gray-700'}`}>{m.label}</span>
                        <span className="text-xs text-gray-400 font-mono">{m.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Note <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input value={note} onChange={e => setNote(e.target.value)} maxLength={200}
                  placeholder="Ex : reçu n°…"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]" />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={onClose} disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSubmit} disabled={submitting || !amount}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] disabled:opacity-60">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Encaisser {value > 0 ? htg(value) : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}