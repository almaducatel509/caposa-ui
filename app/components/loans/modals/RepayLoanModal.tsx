'use client';

/**
 * RepayLoanModal.tsx — enregistrer un remboursement
 * ─────────────────────────────────────────────────────────────────
 * POST /loans/{id}/repay/ via repayLoan().
 * - Espèces : la session caisse ouverte du caissier est trouvée
 *   automatiquement (erreur claire si aucune n'est ouverte).
 * - Débit du compte : prélevé sur le compte du membre (refusé par
 *   Django si fonds insuffisants ou compte gelé / fermé).
 *
 * Règle Django des échéances : une échéance est « couverte » quand le
 * TOTAL déjà payé atteint son montant. Les paiements s'additionnent ;
 * un paiement partiel réduit le solde mais n'avance pas l'échéance.
 *
 * L'encadré « Effet de ce paiement » applique cette règle pour expliquer
 * au guichet ce qui va se passer. Ce n'est qu'un aperçu : après
 * l'encaissement, le prêt est rechargé et l'écran de confirmation
 * affiche les valeurs réelles calculées par Django.
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  X, Wallet, Banknote, CreditCard, Loader2, AlertTriangle, CheckCircle2, Info, CalendarClock,
} from 'lucide-react';
import type { LoanData } from '../../transactions/validation/loanSchema';
import { repayLoan, fetchLoan, RepayMethod } from '@/app/lib/api/loans';
import { fetchAccountsByMember, CaisseAccountOption } from '@/app/lib/api/caisse';

/** Statuts de compte que Django refuse de débiter (loans/views.py → repay). */
const BLOCKED_ACCOUNT_STATUS = ['gele', 'ferme', 'archive'];

/**
 * Compte du prêt, chargé seulement quand on choisit « Débit du compte ».
 * Sert à montrer le solde AVANT l'encaissement ; Django revérifie de toute façon.
 */
function useLoanAccount(memberId: string, accountId: string, enabled: boolean) {
  const [account, setAccount] = useState<CaisseAccountOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || account) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAccountsByMember(memberId)
      .then(list => {
        if (cancelled) return;
        const found = list.find(a => a.id === accountId) ?? null;
        setAccount(found);
        if (!found) setError('Compte du prêt introuvable pour ce membre.');
      })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enabled, memberId, accountId, account]);

  return { account, loading, error };
}

interface Props {
  loan:    LoanData;
  onClose: () => void;
  /** Appelé après un remboursement réussi (le parent recharge la liste). */
  onDone:  () => void;
}

const htg = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' HTG';

/** Dates Django sans heure lues à midi local (sinon la veille en Haïti). */
const date = (iso: string | null | undefined) =>
  iso
    ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
        .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

const round2 = (n: number) => Math.round(n * 100) / 100;

// ─── Effet prévu du paiement (aperçu de la règle Django) ──────────

type Effect =
  | { kind: 'none' }
  | { kind: 'over'; excess: number }
  | { kind: 'payoff' }
  | { kind: 'partial'; stillDue: number }
  | { kind: 'covers'; extra: number; extraInstallments: number };

function previewEffect(amount: number, dueNow: number | null, installment: number | null, remaining: number | null): Effect {
  if (!(amount > 0)) return { kind: 'none' };
  // Django refuse tout trop-perçu : au-delà du solde, ce n'est pas un remboursement complet
  if (remaining != null && round2(amount) > round2(remaining)) return { kind: 'over', excess: round2(amount - remaining) };
  if (remaining != null && round2(amount) === round2(remaining)) return { kind: 'payoff' };
  if (dueNow == null || installment == null) return { kind: 'none' };
  if (amount < dueNow) return { kind: 'partial', stillDue: round2(dueNow - amount) };
  const extra = round2(amount - dueNow);
  return { kind: 'covers', extra, extraInstallments: Math.floor(extra / installment) };
}

// ─── Composant ────────────────────────────────────────────────────

export default function RepayLoanModal({ loan, onClose, onDone }: Props) {
  const [amount,     setAmount]     = useState('');
  const [method,     setMethod]     = useState<RepayMethod>('cash');
  const [note,       setNote]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [result,     setResult]     = useState<{ remaining: number | null; paid: boolean; next: LoanData | null } | null>(null);

  const remaining   = loan.remaining_balance ?? null;
  const installment = loan.installment_amount ?? null;
  const paidSoFar   = loan.amount_paid ?? 0;
  const value       = Number(amount);

  // Ce qui reste à payer pour couvrir l'échéance en cours (la plus ancienne non couverte).
  const dueNow = installment != null && installment > 0
    ? round2(Math.min(installment - (paidSoFar % installment || 0), remaining ?? Infinity))
    : null;
  const alreadyOnCurrent = installment != null ? round2(paidSoFar % installment) : 0;

  // ── Débit du compte : solde et statut visibles avant d'encaisser ──
  const byAccount = method === 'account';
  const acc = useLoanAccount(loan.member, loan.account, byAccount);
  const accountBlocked = byAccount && acc.account != null && BLOCKED_ACCOUNT_STATUS.includes(acc.account.account_status);
  const insufficient   = byAccount && acc.account != null && value > 0 && value > acc.account.soldeActuel;
  const accountProblem = accountBlocked || insufficient;
  const overpaid       = remaining != null && value > 0 && round2(value) > round2(remaining);

  const effect      = previewEffect(value, dueNow, installment, remaining);
  const balanceAfter = remaining != null && value > 0 ? Math.max(0, round2(remaining - value)) : null;

  const handleSubmit = async () => {
    setError(null);
    if (!Number.isFinite(value) || value <= 0) { setError('Saisissez un montant supérieur à zéro.'); return; }
    if (remaining != null && value > remaining) { setError(`Le montant dépasse le solde restant (${htg(remaining)}).`); return; }
    if (accountBlocked) { setError('Ce compte ne peut pas être débité (gelé, fermé ou archivé). Encaissez en espèces.'); return; }
    if (insufficient)   { setError(`Fonds insuffisants : le compte n'a que ${htg(acc.account!.soldeActuel)}.`); return; }

    setSubmitting(true);
    try {
      const res = await repayLoan(loan.id, { amount: value, method, note: note || undefined });
      // On recharge le prêt pour afficher la prochaine échéance réellement fixée par Django
      const next = await fetchLoan(loan.id).catch(() => null);
      setResult({ remaining: res.remaining_balance, paid: res.status === 'paid', next });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’enregistrer le remboursement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* En-tête */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-[#DDEAD5] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">Enregistrer un remboursement</p>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                <span className="capitalize">{loan.member_name}</span> · {loan.account_number}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded-lg text-gray-500 hover:bg-white/60"><X className="w-4 h-4" /></button>
        </div>

        {/* ═══ Confirmation (valeurs Django) ═══ */}
        {result ? (
          <div className="p-6 flex flex-col items-center gap-4 text-center overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">
                {result.paid ? 'Prêt entièrement remboursé' : 'Remboursement enregistré'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {result.paid ? 'Le prêt passe au statut « Remboursé ».' : `${htg(value)} encaissés.`}
              </p>
            </div>
            {!result.paid && (
              <div className="w-full rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100 text-left">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-500">Solde restant</span>
                  <span className="text-sm font-bold text-gray-800">{htg(result.remaining)}</span>
                </div>
                {result.next && (
                  <>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-xs text-gray-500">Prochaine échéance</span>
                      <span className="text-sm font-bold text-gray-800">{date(result.next.next_due_date)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-xs text-gray-500">Situation</span>
                      <span className={`text-sm font-bold ${result.next.is_late ? 'text-red-600' : 'text-[#2E7D32]'}`}>
                        {result.next.is_late ? `En retard de ${result.next.late_days} j` : 'À jour'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
            <button onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white">
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4 overflow-y-auto">

              {/* Situation actuelle */}
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

              {/* Échéance en cours */}
              {loan.next_due_date && dueNow != null && (
                <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  loan.is_late ? 'bg-red-50 border-red-100' : 'bg-[#EBF2F8] border-[#355C7D]/15'
                }`}>
                  <CalendarClock className={`w-4 h-4 shrink-0 mt-0.5 ${loan.is_late ? 'text-red-500' : 'text-[#355C7D]'}`} />
                  <div className={`text-xs ${loan.is_late ? 'text-red-700' : 'text-[#355C7D]'}`}>
                    <p className="font-semibold">
                      {loan.is_late
                        ? `Échéance du ${date(loan.next_due_date)} en retard de ${loan.late_days} jour${(loan.late_days ?? 0) > 1 ? 's' : ''}`
                        : `Prochaine échéance : ${date(loan.next_due_date)}`}
                    </p>
                    <p className="mt-0.5">
                      Pour la couvrir, il faut encore <strong>{htg(dueNow)}</strong>
                      {alreadyOnCurrent > 0 && <> ({htg(alreadyOnCurrent)} déjà versés sur cette échéance)</>}.
                    </p>
                  </div>
                </div>
              )}

              {/* Montant */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Montant reçu (HTG) *</label>
                <input type="number" min={0} step="0.01" inputMode="decimal" value={amount}
                  onChange={e => { setAmount(e.target.value); setError(null); }}
                  className="w-full px-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {dueNow != null && (
                    <button type="button" onClick={() => setAmount(String(dueNow))}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F9F9F6] border border-gray-200 text-gray-600 hover:border-[#2E7D32]">
                      {alreadyOnCurrent > 0 ? 'Compléter l’échéance' : 'Une échéance'} ({htg(dueNow)})
                    </button>
                  )}
                  {remaining != null && (
                    <button type="button" onClick={() => setAmount(String(remaining))}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F9F9F6] border border-gray-200 text-gray-600 hover:border-[#2E7D32]">
                      Solder le prêt
                    </button>
                  )}
                </div>
              </div>

              {/* Effet de ce paiement */}
              {effect.kind !== 'none' && (
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  effect.kind === 'over'    ? 'bg-red-50 border-red-100 text-red-700'
                  : effect.kind === 'partial' ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-[#DDEAD5]/50 border-[#2E7D32]/20 text-[#1B5E20]'
                }`}>
                  <p className="flex items-center gap-1.5 font-bold">
                    {effect.kind === 'over' || effect.kind === 'partial'
                      ? <AlertTriangle className="w-3.5 h-3.5" />
                      : <Info className="w-3.5 h-3.5" />}
                    {effect.kind === 'over' ? 'Montant trop élevé' : 'Effet de ce paiement'}
                  </p>

                  {effect.kind === 'over' && (
                    <>
                      <p>
                        Le prêt ne doit plus que <strong>{htg(remaining)}</strong>.
                        Ce montant le dépasse de <strong>{htg(effect.excess)}</strong> : le système refuse les trop-perçus.
                      </p>
                      <p>Utilisez « Solder le prêt » pour encaisser le montant exact.</p>
                    </>
                  )}

                  {effect.kind === 'payoff' && (
                    <p>Ce paiement <strong>solde entièrement le prêt</strong>. Il passera au statut « Remboursé ».</p>
                  )}

                  {effect.kind === 'partial' && (
                    <>
                      <p><strong>Paiement partiel.</strong> L&apos;argent est bien encaissé et déduit du solde.</p>
                      <p>
                        Mais l&apos;échéance du <strong>{date(loan.next_due_date)}</strong> n&apos;est pas encore couverte :
                        il restera <strong>{htg(effect.stillDue)}</strong> à payer
                        {loan.is_late ? ' pour régulariser le retard.' : ' avant cette date, sinon le prêt passera en retard.'}
                      </p>
                      <p>Les versements s&apos;additionnent : le prochain paiement complétera celui-ci.</p>
                    </>
                  )}

                  {effect.kind === 'covers' && (
                    <>
                      <p>Couvre l&apos;échéance du <strong>{date(loan.next_due_date)}</strong>{loan.is_late ? ' et régularise le retard' : ''}.</p>
                      {effect.extra > 0 && (
                        <p>
                          Les <strong>{htg(effect.extra)}</strong> en plus sont déduits du solde et comptent pour la suite
                          {effect.extraInstallments > 0
                            ? ` (ils couvrent aussi ${effect.extraInstallments} échéance${effect.extraInstallments > 1 ? 's' : ''} suivante${effect.extraInstallments > 1 ? 's' : ''}).`
                            : ' (pas encore assez pour couvrir l’échéance suivante).'}
                        </p>
                      )}
                    </>
                  )}

                  {balanceAfter != null && effect.kind !== 'payoff' && effect.kind !== 'over' && (
                    <p className="pt-1 border-t border-current/10">Solde après paiement : <strong>{htg(balanceAfter)}</strong></p>
                  )}
                </div>
              )}

              {/* Mode de paiement */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mode de paiement *</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'cash',    label: 'Espèces',         hint: 'Session caisse ouverte', icon: Banknote   },
                    { id: 'account', label: 'Débit du compte', hint: loan.account_number,      icon: CreditCard },
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

                {/* Solde du compte, visible avant d'encaisser */}
                {byAccount && (
                  <div className="mt-2">
                    {acc.loading && (
                      <p className="flex items-center gap-2 text-xs text-gray-400 py-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Vérification du compte…
                      </p>
                    )}
                    {acc.error && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600 py-1">
                        <AlertTriangle className="w-3.5 h-3.5" />{acc.error}
                      </p>
                    )}
                    {acc.account && (
                      <div className={`p-3 rounded-xl border text-xs ${
                        accountProblem ? 'bg-red-50 border-red-100 text-red-700' : 'bg-[#DDEAD5]/40 border-[#2E7D32]/20 text-[#1B5E20]'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span>Solde disponible sur {acc.account.account_number}</span>
                          <strong className="text-sm">{htg(acc.account.soldeActuel)}</strong>
                        </div>
                        {accountBlocked && (
                          <p className="mt-1.5 font-semibold">
                            Compte {acc.account.account_status} : il ne peut pas être débité. Encaissez en espèces.
                          </p>
                        )}
                        {!accountBlocked && insufficient && (
                          <p className="mt-1.5 font-semibold">
                            Fonds insuffisants : il manque {htg(round2(value - acc.account.soldeActuel))}.
                            Réduisez le montant ou encaissez en espèces.
                          </p>
                        )}
                        {!accountProblem && value > 0 && (
                          <p className="mt-1.5">
                            Solde du compte après débit : <strong>{htg(round2(acc.account.soldeActuel - value))}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
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

            <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <button onClick={onClose} disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSubmit} disabled={submitting || !amount || overpaid || accountProblem || (byAccount && acc.loading)}
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