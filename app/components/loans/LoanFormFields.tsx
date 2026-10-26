'use client';

/**
 * LoanFormFields.tsx — formulaire de demande de prêt
 * ─────────────────────────────────────────────────────────────────
 * Flux : formulaire → confirmation → POST /loans/ → reçu imprimable.
 *
 * Règles (voir docs/caposa-module-prets-contrat.md) :
 * - aucun mock : membres fournis par le parent, comptes chargés via l'API ;
 * - aucun calcul financier : échéance, solde et date de fin viennent du backend ;
 * - la création ne demande ni caisse ni session (travail de conseiller).
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Landmark, ArrowLeft, User, Hash, FileText, ShieldCheck,
  CheckCircle2, AlertTriangle, Loader2, Banknote, Percent,
  Package, Leaf, Home, GraduationCap, Wrench, Zap, Printer, X,
} from 'lucide-react';

import MemberPicker from '../members/MemberPicker';
import { MemberOption } from '../members/validations';
import { fetchAccountsByMember, CaisseAccountOption } from '@/app/lib/api/caisse';
import { createLoan } from '@/app/lib/api/loans';
import {
  LoanType, PaymentFrequency, LoanData, LoanFormData, LoanFormErrors,
  LOAN_TYPE_LABELS, PAYMENT_FREQUENCY_LABELS, LOAN_STATUS_LABELS,
  paymentFrequencies, validateLoanForm, toCreateLoanPayload,
} from '../transactions/validation/loanSchema';

// ─── Props ────────────────────────────────────────────────────────

export interface LoanFormProps {
  members:     MemberOption[];
  onCancel:    () => void;
  /** Appelé après création réussie — le parent recharge sa liste. Ne ferme PAS le modal. */
  onCreated?:  (loan: LoanData) => void;
}

// ─── Affichage des types (icône + description) ────────────────────

const LOAN_TYPE_UI: Record<LoanType, { icon: React.ElementType; desc: string }> = {
  commerce:    { icon: Package,       desc: 'Fonds de roulement, stock'   },
  agriculture: { icon: Leaf,          desc: 'Plantation, intrants'        },
  elevage:     { icon: Zap,           desc: 'Bétail, équipement animal'   },
  logement:    { icon: Home,          desc: 'Construction ou réparation'  },
  equipement:  { icon: Wrench,        desc: 'Outils, machines'            },
  scolaire:    { icon: GraduationCap, desc: 'Frais de scolarité'          },
  personnel:   { icon: User,          desc: 'Urgence, dépenses courantes' },
};

const ACCOUNT_BADGE: Record<string, { label: string; cls: string }> = {
  epargne: { label: 'Épargne', cls: 'bg-[#DDEAD5] text-[#1B5E20]' },
  cheques: { label: 'Chèques', cls: 'bg-blue-50 text-[#355C7D]'  },
  terme:   { label: 'Terme',   cls: 'bg-yellow-50 text-yellow-700' },
};

const formatHTG = (n: number) => new Intl.NumberFormat('fr-HT').format(n) + ' HTG';

/** '' → undefined, pour que Zod signale « requis » au lieu de lire 0. */
const blankToUndef = (s: string) => (s.trim() === '' ? undefined : s);

// ─── Comptes d'un membre (chargés via l'API, annulation si le membre change) ──

function useMemberAccounts(memberId: string | null) {
  const [accounts, setAccounts] = useState<CaisseAccountOption[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) { setAccounts([]); setError(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAccountsByMember(memberId)
      .then(a  => { if (!cancelled) setAccounts(a); })
      .catch(e => { if (!cancelled) { setAccounts([]); setError(e instanceof Error ? e.message : String(e)); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [memberId]);

  return { accounts, loading, error };
}

// ─── Petits composants ────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{children}</p>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{msg}</p>;
}

function SectionTitle({ icon: Icon, label, color = '#2E7D32' }: { icon: React.ElementType; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

/** Liste de comptes sélectionnables — seuls les comptes actifs sont choisissables. */
function AccountList({ accounts, loading, error, selectedId, onSelect }: {
  accounts:   CaisseAccountOption[];
  loading:    boolean;
  error:      string | null;
  selectedId: string | null;
  onSelect:   (acc: CaisseAccountOption | null) => void;
}) {
  if (loading) {
    return <div className="flex items-center gap-2 py-3 text-xs text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des comptes…</div>;
  }
  if (error) {
    return <p className="text-xs text-red-500 py-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>;
  }
  if (accounts.length === 0) {
    return <p className="text-xs text-gray-400 py-2">Aucun compte trouvé pour ce membre.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {accounts.map(acc => {
        const badge      = ACCOUNT_BADGE[acc.typeCompte];
        const isInactive = acc.account_status !== 'actif';
        const isSelected = selectedId === acc.id;
        return (
          <button key={acc.id} type="button" disabled={isInactive}
            onClick={() => onSelect(isSelected ? null : acc)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
              isSelected   ? 'border-[#2E7D32] bg-[#DDEAD5]/40 shadow-sm'
              : isInactive ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              :              'border-gray-100 bg-[#F9F9F6] hover:border-[#81C784] hover:bg-[#DDEAD5]/20'
            }`}>
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{acc.account_number}</p>
                <p className="text-xs text-gray-500">{formatHTG(acc.soldeActuel)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {badge && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span>}
              {isInactive && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{acc.account_status || 'inactif'}</span>}
              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────

export default function LoanForm({ members, onCancel, onCreated }: LoanFormProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  // Emprunteur + compte crédité au décaissement
  const [borrower, setBorrower] = useState<MemberOption | null>(null);
  const [account,  setAccount]  = useState<CaisseAccountOption | null>(null);
  const borrowerAccounts = useMemberAccounts(borrower?.id ?? null);

  // Garant (facultatif) : un AUTRE membre et l'un de ses comptes
  const [guarantor,        setGuarantor]        = useState<MemberOption | null>(null);
  const [guarantorAccount, setGuarantorAccount] = useState<CaisseAccountOption | null>(null);
  const guarantorAccounts = useMemberAccounts(guarantor?.id ?? null);

  // Conditions — nombres gardés en texte tant que l'utilisateur tape
  const [loanType,      setLoanType]      = useState<LoanType | undefined>();
  const [amount,        setAmount]        = useState('');
  const [rate,          setRate]          = useState('');
  const [duration,      setDuration]      = useState('');
  const [frequency,     setFrequency]     = useState<PaymentFrequency>('monthly');
  const [notes,         setNotes]         = useState('');

  const [errors,     setErrors]     = useState<LoanFormErrors>({});
  const [validated,  setValidated]  = useState<LoanFormData | null>(null);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created,    setCreated]    = useState<LoanData | null>(null);
  const submitLock = useRef(false);   // verrou synchrone anti double-clic

  const clearError = (k: keyof LoanFormErrors) => setErrors(e => ({ ...e, [k]: undefined }));

  const handleSelectBorrower = (m: MemberOption | null) => {
    setBorrower(m);
    setAccount(null);
    clearError('member');
    clearError('account');
    // Le garant ne peut pas être l'emprunteur lui-même
    if (m && guarantor?.id === m.id) { setGuarantor(null); setGuarantorAccount(null); }
  };

  const handleSelectGuarantor = (m: MemberOption | null) => {
    setGuarantor(m);
    setGuarantorAccount(null);
    clearError('guarantor_account');
  };

  // ── Étape 1 : valider puis passer à la confirmation ──
  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const result = validateLoanForm({
      member:            borrower?.id ?? '',
      account:           account?.id ?? '',
      loan_type:         loanType,
      loan_amount:       blankToUndef(amount),
      interest_rate:     blankToUndef(rate),
      loan_duration:     blankToUndef(duration),
      payment_frequency: frequency,
      guarantor_account: guarantorAccount?.id ?? null,
      notes:             notes || undefined,
    });

    if (!result.isValid) { setErrors(result.errors); return; }
    if (guarantor && !guarantorAccount) {
      setErrors({ guarantor_account: 'Choisissez un compte du garant, ou retirez le garant.' });
      return;
    }
    setErrors({});
    setValidated(result.data);
    setStep('confirm');
  };

  // ── Étape 2 : envoyer au backend ──
  const handleConfirm = async () => {
    if (!validated || submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setApiError(null);
    try {
      const loan = await createLoan(toCreateLoanPayload(validated));
      setCreated(loan);
      setStep('success');
      onCreated?.(loan);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur inconnue lors de la création.');
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  // ═══ Écran succès + reçu imprimable ═════════════════════════════
  if (step === 'success' && created) {
    const rows: [string, string][] = [
      ['Référence',      created.id.slice(0, 8).toUpperCase()],
      ['Membre',         created.member_name || borrower?.member_name || '—'],
      ['Compte',         created.account_number || account?.account_number || '—'],
      ['Type de prêt',   LOAN_TYPE_LABELS[created.loan_type] ?? created.loan_type],
      ['Montant',        formatHTG(created.loan_amount)],
      ['Durée',          `${created.loan_duration} mois`],
      ["Taux d'intérêt", `${created.interest_rate} %`],
      ['Remboursement',  PAYMENT_FREQUENCY_LABELS[created.payment_frequency] ?? created.payment_frequency],
      ['Garant',         guarantor ? `${guarantor.member_name} (${guarantorAccount?.account_number})` : 'Aucun'],
      ['Statut',         LOAN_STATUS_LABELS[created.status]],
    ];

    return (
      <div>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #loan-receipt, #loan-receipt * { visibility: visible; }
            #loan-receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="flex flex-col items-center justify-center py-8 px-6 gap-5">
          <div className="no-print w-20 h-20 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#2E7D32]" />
          </div>
          <div className="no-print text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Demande de prêt enregistrée</h2>
            <p className="text-sm text-gray-500">Elle attend maintenant l'approbation d'un superviseur.</p>
          </div>

          <div id="loan-receipt" className="w-full bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
            <div className="hidden print:block text-center pb-4 mb-4 border-b border-gray-300">
              <h1 className="text-2xl font-bold tracking-wide text-gray-900" style={{ fontFamily: 'serif' }}>CAPOSA</h1>
              <p className="text-base font-bold text-gray-800 mt-3" style={{ fontFamily: 'serif' }}>Confirmation de demande de prêt</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(created.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
                <span className={`text-sm font-semibold ${label === 'Montant' ? 'text-[#2E7D32]' : 'text-gray-800'}`}>{value}</span>
              </div>
            ))}
            {created.notes && (
              <div className="pt-3">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Objet et remarques</p>
                <p className="text-sm text-gray-800 whitespace-pre-line">{created.notes}</p>
              </div>
            )}

            <div className="hidden print:block mt-6 pt-4 border-t border-gray-300 text-center">
              <p className="text-xs text-gray-500">Cette confirmation n'est pas un engagement de prêt. Les échéances seront communiquées au décaissement.</p>
            </div>
          </div>

          <div className="no-print flex w-full gap-3">
            <button type="button" onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
              <X className="w-4 h-4" /> Fermer
            </button>
            <button type="button" onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg">
              <Printer className="w-4 h-4" /> Imprimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ Écran confirmation ═════════════════════════════════════════
  if (step === 'confirm' && validated) {
    const rows: [string, string][] = [
      ['Membre',         borrower?.member_name ?? '—'],
      ['Compte crédité', account?.account_number ?? '—'],
      ['Type de prêt',   LOAN_TYPE_LABELS[validated.loan_type]],
      ['Montant',        formatHTG(validated.loan_amount)],
      ['Durée',          `${validated.loan_duration} mois`],
      ["Taux d'intérêt", `${validated.interest_rate} %`],
      ['Remboursement',  PAYMENT_FREQUENCY_LABELS[validated.payment_frequency]],
      ['Garant',         guarantor ? `${guarantor.member_name} (${guarantorAccount?.account_number})` : 'Aucun'],
      ['Objet',          validated.notes || '—'],
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Confirmer la demande de prêt</p>
              <p className="text-xs text-gray-400">Les échéances seront calculées par le système au décaissement.</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <span className="text-xs text-gray-500 shrink-0">{label}</span>
                <span className={`text-sm font-semibold text-right ${label === 'Montant' ? 'text-[#2E7D32]' : 'text-gray-800'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {apiError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{apiError}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => setStep('form')} disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <ArrowLeft className="w-4 h-4" /> Modifier
          </button>
          <button type="button" onClick={handleConfirm} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg disabled:opacity-50">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
              : <><CheckCircle2 className="w-4 h-4" /> Envoyer la demande</>}
          </button>
        </div>
      </div>
    );
  }

  // ═══ Formulaire ═════════════════════════════════════════════════
  const guarantorCandidates = members.filter(m => m.id !== borrower?.id);

  return (
    <form onSubmit={handleReview} noValidate className="flex flex-col gap-5">

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#DDEAD5]/40 border border-[#DDEAD5]">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-[#2E7D32]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1B5E20]">Avant de commencer</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            La demande sera examinée par un superviseur. Les échéances et la date de fin sont calculées par le système au décaissement.
          </p>
        </div>
      </div>

      {/* 1. Membre et compte */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={User} label="Membre" />
        <MemberPicker
          members={members}
          selectedMember={borrower}
          onSelect={handleSelectBorrower}
          isRequired
          errorMessage={errors.member}
          label="Rechercher un membre"
        />
        {borrower && (
          <div className="mt-4">
            <Label>Compte à créditer au décaissement *</Label>
            <AccountList
              {...borrowerAccounts}
              selectedId={account?.id ?? null}
              onSelect={acc => { setAccount(acc); clearError('account'); }}
            />
            <FieldError msg={errors.account} />
          </div>
        )}
      </div>

      {/* 2. Type de prêt */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Landmark} label="Type de prêt" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(Object.keys(LOAN_TYPE_UI) as LoanType[]).map(key => {
            const { icon: Icon, desc } = LOAN_TYPE_UI[key];
            const selected = loanType === key;
            return (
              <button key={key} type="button"
                onClick={() => { setLoanType(key); clearError('loan_type'); }}
                className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all ${
                  selected ? 'border-[#2E7D32] bg-[#DDEAD5]/40 shadow-sm'
                           : 'border-gray-100 bg-[#F9F9F6] hover:border-[#81C784] hover:bg-[#DDEAD5]/20'
                }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selected ? 'bg-[#2E7D32]/15' : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${selected ? 'text-[#2E7D32]' : 'text-gray-500'}`} />
                </div>
                <p className={`text-xs font-bold ${selected ? 'text-[#1B5E20]' : 'text-gray-700'}`}>{LOAN_TYPE_LABELS[key]}</p>
                <p className="text-xs text-gray-400 leading-tight">{desc}</p>
              </button>
            );
          })}
        </div>
        <FieldError msg={errors.loan_type} />
      </div>

      {/* 3. Montant et conditions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Banknote} label="Montant et conditions" color="#355C7D" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Montant demandé (HTG) *</Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#355C7D]" />
              <input type="number" min={0} inputMode="decimal" value={amount}
                onChange={e => { setAmount(e.target.value); clearError('loan_amount'); }}
                placeholder="0"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm font-semibold text-[#355C7D] focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D]" />
            </div>
            <FieldError msg={errors.loan_amount} />
          </div>

          <div>
            <Label>Durée (mois, de 3 à 60) *</Label>
            <input type="number" min={3} max={60} step={1} inputMode="numeric" value={duration}
              onChange={e => { setDuration(e.target.value); clearError('loan_duration'); }}
              placeholder="12"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
            <FieldError msg={errors.loan_duration} />
          </div>

          <div>
            <Label>Taux d'intérêt annuel (%) *</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" min={0} max={100} step={0.5} inputMode="decimal" value={rate}
                onChange={e => { setRate(e.target.value); clearError('interest_rate'); }}
                placeholder="18"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
            </div>
            <FieldError msg={errors.interest_rate} />
          </div>

          <div className="md:col-span-2">
            <Label>Fréquence de remboursement *</Label>
            <div className="flex gap-2">
              {paymentFrequencies.map(freq => (
                <button key={freq} type="button" onClick={() => setFrequency(freq)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    frequency === freq
                      ? 'border-[#2E7D32] bg-[#DDEAD5]/40 text-[#1B5E20] font-semibold'
                      : 'border-gray-200 bg-[#F9F9F6] text-gray-600 hover:border-[#81C784]'
                  }`}>
                  {PAYMENT_FREQUENCY_LABELS[freq]}
                </button>
              ))}
            </div>
            <FieldError msg={errors.payment_frequency} />
          </div>
        </div>
      </div>

      {/* 4. Garant et objet */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={ShieldCheck} label="Garant et objet du prêt" />

        <MemberPicker
          members={guarantorCandidates}
          selectedMember={guarantor}
          onSelect={handleSelectGuarantor}
          label="Garant (facultatif) — un autre membre"
        />
        {guarantor && (
          <div className="mt-4">
            <Label>Compte du garant</Label>
            <AccountList
              {...guarantorAccounts}
              selectedId={guarantorAccount?.id ?? null}
              onSelect={acc => { setGuarantorAccount(acc); clearError('guarantor_account'); }}
            />
          </div>
        )}
        <FieldError msg={errors.guarantor_account} />

        <div className="mt-5">
          <Label>Objet du prêt et remarques <span className="text-gray-400 normal-case font-normal">facultatif</span></Label>
          <textarea value={notes} rows={3} maxLength={500}
            onChange={e => { setNotes(e.target.value); clearError('notes'); }}
            placeholder="À quoi servira le prêt, autres garanties (bétail, terrain…), contexte…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
          <div className="flex justify-between mt-1">
            <FieldError msg={errors.notes} />
            <p className="text-xs text-gray-400 ml-auto">{notes.length}/500</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" /> Annuler
        </button>
        <button type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg">
          <Landmark className="w-4 h-4" /> Vérifier la demande
        </button>
      </div>
    </form>
  );
}