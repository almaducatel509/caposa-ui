'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight, ArrowLeft, CreditCard, Banknote,
  Building2, Landmark, User, Mail, Phone, Hash,
  FileText, Calendar, Clock, ShieldCheck, CheckCircle2,
  AlertTriangle, Loader2, ChevronDown, X,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TransferType = 'internal' | 'supplier' | 'loan_payment';
type PaymentType  = 'regular' | 'extra' | 'full';

interface AccountInfo {
  accountNumber: string;
  accountName:   string;
  balance:       number;
  accountType:   'epargne' | 'cheques' | 'terme';
}

interface LoanInfo {
  loanNumber:       string;
  loanPurpose:      string;
  monthlyPayment:   number;
  remainingBalance: number;
  nextPaymentDate:  string;
}

// ─── Config CAPOSA ─────────────────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
  bg:        '#F9F9F6',
};

const ACCOUNT_TYPE_CFG = {
  epargne: { label: 'Épargne',  bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]'  },
  cheques: { label: 'Chèques', bg: 'bg-blue-50',    text: 'text-[#355C7D]'  },
  terme:   { label: 'Terme',   bg: 'bg-yellow-50',  text: 'text-yellow-700' },
};

const TRANSFER_TYPES: { key: TransferType; label: string; desc: string; icon: React.ElementType; fees: number; delay: string }[] = [
  { key: 'internal',     label: 'Entre mes comptes', desc: 'Transfert instantané, sans frais',     icon: ArrowLeftRight, fees: 0,    delay: 'Immédiat'            },
  { key: 'supplier',     label: 'Fournisseur',       desc: 'Paiement fournisseur ou tiers',        icon: Building2,      fees: 0,    delay: '1–2 jours ouvrables' },
  { key: 'loan_payment', label: 'Remboursement prêt',desc: 'Paiement partiel ou complet d\'un prêt', icon: Landmark,     fees: 0,    delay: 'Immédiat'            },
];

// ─── Mock data ──────────────────────────────────────────────────────────────────
const MEMBER_ACCOUNTS: AccountInfo[] = [
  { accountNumber: '636-922-093-4469', accountName: 'Épargne principal',    balance: 15420, accountType: 'epargne' },
  { accountNumber: '789-123-456-7890', accountName: 'Chèques exploitation', balance: 8750,  accountType: 'cheques' },
  { accountNumber: '111-222-333-4444', accountName: 'Fonds saisonnier',     balance: 25000, accountType: 'terme'   },
];

const ACTIVE_LOANS: LoanInfo[] = [
  { loanNumber: 'PRET-2024-015', loanPurpose: 'Tracteur occasion',  monthlyPayment: 1750,  remainingBalance: 18277, nextPaymentDate: '2025-07-20' },
  { loanNumber: 'PRET-2025-001', loanPurpose: 'Équipement serre',   monthlyPayment: 2184,  remainingBalance: 50000, nextPaymentDate: '2025-08-17' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── Sub-components ─────────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function Input({ hasError, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all
        focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
        disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
        ${hasError
          ? 'border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400'
          : 'border-gray-200 bg-white hover:border-gray-300'
        } ${className}`}
    />
  );
}

function SectionHeader({ step, title, icon: Icon }: { step: number; title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-6 h-6 rounded-lg bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">{step}</span>
      </div>
      <Icon className="w-4 h-4 text-gray-400" />
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function AccountCard({ account, selected, onClick, disabled }: {
  account: AccountInfo; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  const tCfg = ACCOUNT_TYPE_CFG[account.accountType];
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all w-full
        ${selected  ? 'border-[#2E7D32] bg-[#DDEAD5]/40'
        : disabled  ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                    : 'border-gray-100 bg-white hover:border-[#2E7D32]/30 hover:bg-[#DDEAD5]/10'}`}>
      <CreditCard className={`w-4 h-4 shrink-0 ${selected ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{account.accountName}</p>
        <p className="text-xs font-mono text-gray-400">{account.accountNumber}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-[#2E7D32]">{formatHTG(account.balance)}</p>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${tCfg.bg} ${tCfg.text}`}>{tCfg.label}</span>
      </div>
      {selected && <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />}
    </button>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────────
export default function TransferForm({ onCancel }: { onCancel?: () => void }) {

  const [step,           setStep]           = useState<'form' | 'confirm' | 'success'>('form');
  const [transferType,   setTransferType]   = useState<TransferType | null>(null);
  const [sourceAccount,  setSourceAccount]  = useState<AccountInfo | null>(null);
  const [destAccount,    setDestAccount]    = useState<AccountInfo | null>(null);
  const [selectedLoan,   setSelectedLoan]   = useState<LoanInfo | null>(null);
  const [paymentType,    setPaymentType]    = useState<PaymentType>('regular');
  const [loanOpen,       setLoanOpen]       = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [errors,         setErrors]         = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    amount:           '',
    codeAutorisation: '',
    supplierName:     '',
    supplierAccount:  '',
    invoiceRef:       '',
    description:      '',
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const amount      = parseFloat(form.amount) || 0;
  const typeCfg     = transferType ? TRANSFER_TYPES.find(t => t.key === transferType)! : null;
  const insufficient = sourceAccount ? amount > sourceAccount.balance : false;

  // Montant suggéré selon prêt et type de paiement
  const suggestedAmount = useMemo(() => {
    if (!selectedLoan) return null;
    if (paymentType === 'regular') return selectedLoan.monthlyPayment;
    if (paymentType === 'full')    return selectedLoan.remainingBalance;
    return null;
  }, [selectedLoan, paymentType]);

  // Validation
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!sourceAccount)  e.source   = 'Sélectionnez un compte source';
    if (!transferType)   e.type     = 'Sélectionnez un type de virement';
    if (amount <= 0)     e.amount   = 'Montant invalide';
    if (insufficient)    e.amount   = 'Solde insuffisant';
    if (!form.codeAutorisation.trim()) e.code = 'Code d\'autorisation requis';

    if (transferType === 'internal' && !destAccount)
      e.dest = 'Sélectionnez un compte destination';
    if (transferType === 'supplier' && !form.supplierName.trim())
      e.supplier = 'Nom du fournisseur requis';
    if (transferType === 'loan_payment' && !selectedLoan)
      e.loan = 'Sélectionnez un prêt';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep('confirm');
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setStep('success');
  };

  // ── Écran succès ────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
        </div>
        <p className="text-lg font-bold text-gray-900">Virement enregistré</p>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          {typeCfg?.delay === 'Immédiat'
            ? 'La transaction a été traitée immédiatement.'
            : `Délai de traitement : ${typeCfg?.delay}`}
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => { setStep('form'); setForm({ amount: '', codeAutorisation: '', supplierName: '', supplierAccount: '', invoiceRef: '', description: '' }); setSourceAccount(null); setDestAccount(null); setTransferType(null); setSelectedLoan(null); }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
            Nouveau virement
          </button>
          {onCancel && (
            <button onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
              Fermer
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Écran confirmation ───────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Confirmer le virement</p>
              <p className="text-xs text-gray-400">Vérifiez les informations avant de valider</p>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {[
              ['Compte source',   sourceAccount?.accountName ?? '—'],
              ['Type',            typeCfg?.label ?? '—'],
              ['Montant',         formatHTG(amount)],
              ['Délai',           typeCfg?.delay ?? '—'],
              ['Vers',
                transferType === 'internal'     ? (destAccount?.accountName ?? '—')
              : transferType === 'supplier'     ? form.supplierName
              : transferType === 'loan_payment' ? (selectedLoan?.loanPurpose ?? '—')
              : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-sm font-semibold text-gray-800 ${label === 'Montant' ? 'text-[#2E7D32]' : ''}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 px-3 py-2.5 bg-yellow-50 border border-yellow-100 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 font-medium">
              Cette transaction sera traitée et ne pourra pas être annulée.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => setStep('form')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-4 h-4" /> Modifier
          </button>
          <button type="button" onClick={handleConfirm} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</>
              : <><CheckCircle2 className="w-4 h-4" /> Valider le virement</>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── Formulaire principal ─────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* ── 1. Compte source ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={1} title="Compte à débiter" icon={CreditCard} />
        <div className="flex flex-col gap-2">
          {MEMBER_ACCOUNTS.map(acc => (
            <AccountCard key={acc.accountNumber} account={acc}
              selected={sourceAccount?.accountNumber === acc.accountNumber}
              onClick={() => {
                setSourceAccount(acc);
                if (destAccount?.accountNumber === acc.accountNumber) setDestAccount(null);
                setErrors(e => ({ ...e, source: '' }));
              }} />
          ))}
          {errors.source && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> {errors.source}
            </p>
          )}
        </div>
      </div>

      {/* ── 2. Type de virement ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={2} title="Type de virement" icon={ArrowLeftRight} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {TRANSFER_TYPES.map(t => {
            const Icon   = t.icon;
            const active = transferType === t.key;
            return (
              <button key={t.key} type="button"
                onClick={() => { setTransferType(t.key); setDestAccount(null); setSelectedLoan(null); setErrors(e => ({ ...e, type: '' })); }}
                className={`flex flex-col items-start gap-2 px-4 py-3 rounded-xl border-2 text-left transition-all
                  ${active ? 'border-[#2E7D32] bg-[#DDEAD5]/40' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-xs font-semibold ${active ? 'text-[#1B5E20]' : 'text-gray-700'}`}>{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{t.desc}</p>
                </div>
                <div className="flex items-center gap-1 mt-auto">
                  <Clock className="w-3 h-3 text-gray-300" />
                  <span className="text-xs text-gray-400">{t.delay}</span>
                </div>
              </button>
            );
          })}
        </div>
        {errors.type && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
            <AlertTriangle className="w-3 h-3" /> {errors.type}
          </p>
        )}
      </div>

      {/* ── 3. Détails selon le type ── */}
      {transferType && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionHeader step={3} title="Détails" icon={FileText} />

          {/* Interne */}
          {transferType === 'internal' && (
            <Field label="Compte destination" required error={errors.dest}>
              <div className="flex flex-col gap-2">
                {MEMBER_ACCOUNTS.filter(a => a.accountNumber !== sourceAccount?.accountNumber).map(acc => (
                  <AccountCard key={acc.accountNumber} account={acc}
                    selected={destAccount?.accountNumber === acc.accountNumber}
                    onClick={() => { setDestAccount(acc); setErrors(e => ({ ...e, dest: '' })); }} />
                ))}
              </div>
            </Field>
          )}

          {/* Fournisseur */}
          {transferType === 'supplier' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nom du fournisseur" required error={errors.supplier}>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input placeholder="Ex: Semences ABC Inc." className="pl-9"
                    hasError={!!errors.supplier} value={form.supplierName} onChange={set('supplierName')} />
                </div>
              </Field>
              <Field label="N° compte fournisseur" hint="Optionnel">
                <div className="relative">
                  <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input placeholder="ACC-XXXXXX" className="pl-9 font-mono"
                    value={form.supplierAccount} onChange={set('supplierAccount')} />
                </div>
              </Field>
              <Field label="Référence facture" hint="Optionnel">
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input placeholder="INV-2025-001" className="pl-9 font-mono"
                    value={form.invoiceRef} onChange={set('invoiceRef')} />
                </div>
              </Field>
            </div>
          )}

          {/* Prêt */}
          {transferType === 'loan_payment' && (
            <div className="flex flex-col gap-4">
              <Field label="Prêt à rembourser" required error={errors.loan}>
                <div className="flex flex-col gap-2">
                  {ACTIVE_LOANS.map(loan => {
                    const isSel = selectedLoan?.loanNumber === loan.loanNumber;
                    return (
                      <button key={loan.loanNumber} type="button"
                        onClick={() => { setSelectedLoan(loan); setErrors(e => ({ ...e, loan: '' })); }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all
                          ${isSel ? 'border-[#2E7D32] bg-[#DDEAD5]/40' : 'border-gray-100 bg-white hover:border-[#2E7D32]/30 hover:bg-[#DDEAD5]/10'}`}>
                        <Landmark className={`w-4 h-4 shrink-0 ${isSel ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{loan.loanPurpose}</p>
                          <p className="text-xs text-gray-400 font-mono">{loan.loanNumber}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-500">Solde restant</p>
                          <p className="text-xs font-bold text-[#355C7D]">{formatHTG(loan.remainingBalance)}</p>
                        </div>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {selectedLoan && (
                <Field label="Type de paiement" required>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { key: 'regular', label: 'Mensualité',   sub: formatHTG(selectedLoan.monthlyPayment)   },
                      { key: 'extra',   label: 'Supplément',   sub: 'Montant libre'                         },
                      { key: 'full',    label: 'Solde complet', sub: formatHTG(selectedLoan.remainingBalance) },
                    ] as { key: PaymentType; label: string; sub: string }[]).map(pt => (
                      <button key={pt.key} type="button" onClick={() => setPaymentType(pt.key)}
                        className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 text-center transition-all
                          ${paymentType === pt.key ? 'border-[#2E7D32] bg-[#DDEAD5]/40' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                        <span className={`text-xs font-semibold ${paymentType === pt.key ? 'text-[#1B5E20]' : 'text-gray-700'}`}>{pt.label}</span>
                        <span className="text-xs text-gray-400">{pt.sub}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 4. Montant ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={4} title="Montant et description" icon={Banknote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Montant (HTG)" required error={errors.amount}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">HTG</span>
              <Input type="number" min={1} placeholder="0" hasError={!!errors.amount}
                className="pl-12 text-right font-mono text-base font-bold"
                value={form.amount}
                onChange={e => {
                  setForm(f => ({ ...f, amount: e.target.value }));
                  setErrors(er => ({ ...er, amount: '' }));
                }} />
            </div>
            {amount > 0 && !insufficient && (
              <p className="text-xs text-[#2E7D32] font-semibold text-right">{formatHTG(amount)}</p>
            )}
            {suggestedAmount && form.amount === '' && (
              <button type="button"
                onClick={() => setForm(f => ({ ...f, amount: String(suggestedAmount) }))}
                className="text-xs text-[#355C7D] hover:underline text-left">
                Utiliser {formatHTG(suggestedAmount)}
              </button>
            )}
          </Field>

          <Field label="Description" hint="Optionnel">
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input placeholder="Ex: Paiement semences printemps…" className="pl-9"
                value={form.description} onChange={set('description')} />
            </div>
          </Field>
        </div>

        {sourceAccount && amount > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-[#F9F9F6] rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Solde disponible</p>
              <p className="text-sm font-bold text-[#2E7D32]">{formatHTG(sourceAccount.balance)}</p>
            </div>
            <div className={`rounded-xl px-4 py-3 border ${insufficient ? 'bg-red-50 border-red-100' : 'bg-[#F9F9F6] border-gray-100'}`}>
              <p className="text-xs text-gray-400 mb-1">Après virement</p>
              <p className={`text-sm font-bold ${insufficient ? 'text-red-600' : 'text-gray-700'}`}>
                {formatHTG(Math.max(0, sourceAccount.balance - amount))}
              </p>
            </div>
            <div className="bg-[#F9F9F6] rounded-xl px-4 py-3 border border-gray-100">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-400">Délai</p>
              </div>
              <p className="text-sm font-bold text-gray-700">{typeCfg?.delay ?? '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Autorisation ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={5} title="Autorisation superviseur" icon={ShieldCheck} />
        <div className="flex items-start gap-3 mb-4 px-3 py-2.5 bg-[#EBF2F8] border border-[#355C7D]/20 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-[#355C7D] shrink-0 mt-0.5" />
          <p className="text-xs text-[#355C7D] font-medium">
            Le code d'autorisation est fourni par le superviseur ou le chef de caisse. Le caissier ne peut pas autoriser sa propre transaction.
          </p>
        </div>
        <Field label="Code d'autorisation" required error={errors.code}
          hint="Saisie manuelle obligatoire — remis par un responsable autorisé.">
          <div className="relative">
            <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input placeholder="Code remis par le superviseur" hasError={!!errors.code}
              className="pl-9 font-mono"
              value={form.codeAutorisation}
              onChange={e => { setForm(f => ({ ...f, codeAutorisation: e.target.value })); setErrors(er => ({ ...er, code: '' })); }} />
          </div>
        </Field>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          <ArrowLeft className="w-4 h-4" /> Annuler
        </button>
        <button type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <ArrowLeftRight className="w-4 h-4" /> Vérifier le virement
        </button>
      </div>
    </form>
  );
}