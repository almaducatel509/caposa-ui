'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, X, ArrowDownCircle,
  Banknote, FileCheck,
  User, CreditCard, Hash, FileText,
  CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react';
import { depositSchema, DepositSubtype, type DepositFormValidated } from '../validation/deposit';
import DepositReceipt from './DepositReceipt';
import { MemberOption } from '../../members/validations';

// ─── Types ─────────────────────────────────────────────────────────────────────

// interface AccountOption {
//   id: string;
//   account_number: string;
//   typeCompte: 'epargne' | 'cheques' | 'terme';
//   soldeActuel: number;
//   account_status: 'actif' | 'suspendu' | 'ferme';
// }
interface AccountOption {
  id: string;
  account_number: string;
  typeCompte: string;            // l'API peut renvoyer 'epargne' ou 'SAVINGS'
  soldeActuel: number;
  account_status: string;        // 'actif' | 'en_attente' | 'gele' | 'ferme'…
}
interface DepositFormProps {
  members:              MemberOption[];
  /** Doit appeler l'API réelle et lever une Error avec un message explicite en cas d'échec. */
  fetchMemberAccounts:  (memberId: string) => Promise<AccountOption[]>;
  onSubmit:             (data: DepositFormValidated) => Promise<void>;
  onCancel:             () => void;
  isLoading?:           boolean;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const SUBTYPE_CFG = {
  cash:     { icon: Banknote,       label: 'Espèces',  desc: 'Dépôt en liquide',        hold: 0 },
  check:    { icon: FileCheck,      label: 'Chèque',   desc: 'Compensation 1–5 jours',  hold: 3 },
} as const;

const TYPE_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  epargne: { label: 'Épargne',  bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]'  },
  cheques: { label: 'Chèques', bg: 'bg-blue-50',    text: 'text-[#355C7D]'  },
  terme:   { label: 'Terme',   bg: 'bg-yellow-50',  text: 'text-yellow-700' },
};
const TYPE_ALIAS: Record<string, string> = { savings: 'epargne', checking: 'cheques', term: 'terme' };

function getTypeCfg(raw?: string) {
  const key = String(raw ?? '').toLowerCase();
  return TYPE_LABEL[TYPE_ALIAS[key] ?? key]
    ?? { label: raw || 'Compte', bg: 'bg-gray-100', text: 'text-gray-500' };
}

// Un compte en_attente doit pouvoir recevoir son premier dépôt (qui l'active)
const peutRecevoirDepot = (status?: string) =>
  ['actif', 'en_attente'].includes(String(status ?? '').toLowerCase());

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── Small components ──────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string;
  hint?: string; children: React.ReactNode;
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
        ${hasError ? 'border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400'
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

/** Bannière d'erreur générique (API indisponible, échec de soumission, etc.) */
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DepositForm({
  members,
  fetchMemberAccounts,
  onSubmit,
  onCancel,
  isLoading = false,
}: DepositFormProps) {
  const [submittedData, setSubmittedData] = useState<DepositFormValidated | null>(null);
  const [memberSearch,    setMemberSearch]    = useState('');
  const [memberOpen,      setMemberOpen]      = useState(false);
  const [selectedMember,  setSelectedMember]  = useState<MemberOption | null>(null);
  const [memberAccounts,  setMemberAccounts]  = useState<AccountOption[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError,   setAccountsError]   = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);
  const [submitted,       setSubmitted]       = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [submitError,     setSubmitError]     = useState<string | null>(null);
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    idCompte: '',
    codeAutorisation: '',
    montantTransaction: '',
    depositSubtype: 'cash',
    source: '',
    description: '',

    // Champs chèque existants
    checkNumber: '',
    issuingBank: '',
    checkIssuerName: '',
    checkDate: '',

    // Nouveaux champs MICR
    micrSequence: '',
    bankCode: '',
    accountNumberMicr: '',
    branchCode: '',
    productCode: '',

    // Champs supplémentaires
    beneficiary: '',
    amountWords: '',
    issuePlace: '',
  });

  // Calculs automatiques
  const amount = parseFloat(form.montantTransaction) || 0;
  const solde             = selectedAccount?.soldeActuel ?? 0;
  // hold period : 3 jours pour chèque, 0 pour cash
  const hold = form.depositSubtype === 'check' ? 3 : 0;

  // vérification requise : chèque OU montant > 50 000
  const needsVerif = form.depositSubtype === 'check' || amount > 50000;

  // montant disponible immédiatement : 30% si chèque, 100% si cash
  const availImm = hold > 0 ? Math.floor(amount * 0.3) : amount;

  // compte bloqué ?
  // const isBlocked =
  //   selectedAccount !== null &&
  //   selectedAccount.account_status !== 'actif';
  const isBlocked =
  selectedAccount !== null &&
  !peutRecevoirDepot(selectedAccount.account_status);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const filteredMembers = useMemo(() =>
    members.filter(m =>
      m.member_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.id_number.includes(memberSearch)
    ), [members, memberSearch]);

  const handleMemberSelect = async (m: MemberOption) => {
    setSelectedMember(m);
    setMemberOpen(false);
    setMemberSearch('');
    setSelectedAccount(null);
    setForm(f => ({ ...f, idCompte: '' }));
    setMemberAccounts([]);
    setAccountsError(null);
    setAccountsLoading(true);

    try {
      const accounts = await fetchMemberAccounts(m.id);
      setMemberAccounts(accounts);
    } catch (err) {
      setAccountsError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les comptes de ce membre."
      );
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleAccountSelect = (acc: AccountOption) => {
    if (!peutRecevoirDepot(acc.account_status)) return;
    // if (acc.account_status !== 'actif') return;
    setSelectedAccount(acc);
    setForm(f => ({ ...f, idCompte: acc.account_number }));
    setErrors(e => ({ ...e, idCompte: '' }));
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setSelectedAccount(null);
    setMemberAccounts([]);
    setAccountsError(null);
    setForm(f => ({ ...f, idCompte: '' }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const payload = {
      accountId: selectedAccount?.id ?? '',
      idCompte:             form.idCompte,
      typeTransaction:      'DEPOSIT' as const,
      codeAutorisation:     form.codeAutorisation,
      montantTransaction:   amount,
      depositSubtype:       form.depositSubtype,
      source:               form.source,
      description:          form.description || null,

      // Champs chèque
      checkNumber:          form.checkNumber || null,
      issuingBank:          form.issuingBank || null,
      checkIssuerName:      form.checkIssuerName || null,
      checkDate:            form.checkDate || null,

      // MICR
      micrSequence:         form.micrSequence || null,
      bankCode:             form.bankCode || null,
      accountNumberMicr:    form.accountNumberMicr || null,
      branchCode:           form.branchCode || null,
      productCode:          form.productCode || null,

      // Supplémentaires
      beneficiary:          form.beneficiary || null,
      amountWords:          form.amountWords || null,
      issuePlace:           form.issuePlace || null,
    };

    const result = depositSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = String(err.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      await onSubmit(result.data);
      setSubmittedData(result.data);
      setSubmitted(true);
    } catch (err) {
      // Aucune soumission "silencieuse" : on affiche le vrai problème à l'utilisateur
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'enregistrement du dépôt."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({
      idCompte: '',
      codeAutorisation: '',
      montantTransaction: '',
      depositSubtype: 'cash',
      source: '',
      description: '',

      // Champs chèque existants
      checkNumber: '',
      issuingBank: '',
      checkIssuerName: '',
      checkDate: '',

      // Nouveaux champs MICR
      micrSequence: '',
      bankCode: '',
      accountNumberMicr: '',
      branchCode: '',
      productCode: '',

      // Champs supplémentaires
      beneficiary: '',
      amountWords: '',
      issuePlace: '',
    });
    setSubmittedData(null);
    setSelectedMember(null);
    setSelectedAccount(null);
    setMemberAccounts([]);
    setAccountsError(null);
    setSubmitError(null);
    setErrors({});
  };

  if (submitted && submittedData) {
    return (
      <DepositReceipt
        data={submittedData}
        memberName={selectedMember?.member_name}
        onReset={handleReset}
      />
    );
  }

  // ── Formulaire ──────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      
      {/* ── 1. Membre + Compte ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={1} title="Membre et compte cible" icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Membre */}
          <Field label="Membre" required
            error={errors.idCompte && !selectedMember ? 'Sélectionnez un membre' : undefined}>
            <div className="relative">
              <button type="button" onClick={() => setMemberOpen(o => !o)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all
                  ${selectedMember ? 'border-[#2E7D32] bg-[#DDEAD5]/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <span className={`flex-1 truncate ${selectedMember ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                  {selectedMember?.member_name ?? 'Rechercher un membre…'}
                </span>
                  {selectedMember ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={e => { e.stopPropagation(); handleClearMember(); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          handleClearMember();
                        }
                      }}
                      className="p-0.5 rounded-md hover:bg-[#c8e0bc] text-gray-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </div>
                  ) : null}
              </button>

              {memberOpen && (
                <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input autoFocus type="text" value={memberSearch}
                        onChange={e => setMemberSearch(e.target.value)}
                        placeholder="Nom ou N° identification…"
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#DDEAD5]" />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                    {filteredMembers.length === 0
                      ? <p className="text-xs text-gray-400 text-center py-4">Aucun membre trouvé</p>
                      : filteredMembers.map(m => (
                          <button key={m.id} type="button" onClick={() => handleMemberSelect(m)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#DDEAD5]/30 transition-colors text-left">
                            <div className="w-7 h-7 rounded-lg bg-[#DDEAD5] flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-[#2E7D32]">{m.member_name[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{m.member_name}</p>
                              <p className="text-xs text-gray-400">N° {m.id_number}</p>
                            </div>
                          </button>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>

            {selectedMember && (
              <div className="flex items-center gap-3 px-3 py-2 bg-[#F9F9F6] rounded-xl border border-gray-100 text-xs text-gray-500">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>ID : <span className="font-mono font-semibold text-gray-700">{selectedMember.id_number}</span></span>
                {selectedMember.phone_number && <span className="ml-auto">{selectedMember.phone_number}</span>}
              </div>
            )}
          </Field>

          {/* Compte cible */}
          <Field label="Compte cible" required error={errors.idCompte}
            hint={!selectedMember ? "Sélectionnez un membre d'abord" : undefined}>
            <Input placeholder="Ex: 636-922-093-4469" hasError={!!errors.idCompte}
              disabled={!selectedMember || accountsLoading} value={form.idCompte}
              onChange={e => {
                setForm(f => ({ ...f, idCompte: e.target.value }));
                const match = memberAccounts.find(a => a.account_number === e.target.value);
                setSelectedAccount(match ?? null);
              }} />

            {accountsLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Chargement des comptes du membre…
              </div>
            )}

            {accountsError && (
              <div className="mt-1">
                <ErrorBanner message={accountsError} />
              </div>
            )}

            {!accountsLoading && !accountsError && memberAccounts.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {memberAccounts.map(acc => {
                  // const tCfg  = TYPE_LABEL[acc.typeCompte];
                  // const isAct = acc.account_status === 'actif';
                  const tCfg  = getTypeCfg(acc.typeCompte);
                  const isAct = peutRecevoirDepot(acc.account_status);
                  const isSel = selectedAccount?.id === acc.id;
                  return (
                    <button key={acc.id} type="button" disabled={!isAct}
                      onClick={() => handleAccountSelect(acc)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all
                        ${isSel  ? 'border-[#2E7D32] bg-[#DDEAD5]/40'
                                 : isAct ? 'border-gray-100 bg-white hover:border-[#2E7D32]/30 hover:bg-[#DDEAD5]/10'
                                         : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'}`}>
                      <CreditCard className={`w-4 h-4 shrink-0 ${isSel ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-semibold text-gray-800">{acc.account_number}</p>
                        <p className="text-xs text-gray-400">{formatHTG(acc.soldeActuel)}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${tCfg.bg} ${tCfg.text}`}>{tCfg.label}</span>
                      {/* {!isAct && <span className="px-1.5 py-0.5 rounded-md text-xs bg-gray-100 text-gray-400">Suspendu</span>} */}
                      {!isAct && <span className="px-1.5 py-0.5 rounded-md text-xs bg-gray-100 text-gray-400">{acc.account_status}</span>}
                      {isSel  && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {!accountsLoading && !accountsError && selectedMember && memberAccounts.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">Ce membre n'a aucun compte.</p>
            )}
          </Field>

        </div>
      </div>

      {/* ── 2. Montant + Type ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={2} title="Montant et type de dépôt" icon={ArrowDownCircle} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          <Field label="Montant (HTG)" required error={errors.montantTransaction}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">HTG</span>
              <Input type="number" min={1} placeholder="0" hasError={!!errors.montantTransaction}
                className="pl-12 text-right font-mono text-base font-bold"
                value={form.montantTransaction} onChange={set('montantTransaction')} />
            </div>
            {amount > 0 && <p className="text-xs text-[#2E7D32] font-semibold text-right">{formatHTG(amount)}</p>}
          </Field>
          <Field label="type de dépôt" required error={errors.depositSubtype}>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {(Object.keys(SUBTYPE_CFG) as DepositSubtype[]).map(sub => {
                const cfg    = SUBTYPE_CFG[sub as keyof typeof SUBTYPE_CFG];
                const Icon   = cfg.icon;
                const active = form.depositSubtype === sub;
                return (
                  <button key={sub} type="button"
                    onClick={() => setForm(f => ({ ...f, depositSubtype: sub }))}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-center transition-all
                      ${active ? 'border-[#2E7D32] bg-[#DDEAD5]/40 text-[#1B5E20]'
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
                    <span className="text-xs font-semibold">{cfg.label}</span>
                    <span className="text-xs text-gray-400 leading-tight hidden sm:block">{cfg.desc}</span>
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </div>

      {/* ── 3. Détails ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={3} title="Détails" icon={FileText} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Source */}
          <Field label="Source" required error={errors.source}>
            <Input
              placeholder="Ex: Salaire, Remboursement, Vente…"
              hasError={!!errors.source}
              value={form.source}
              onChange={set('source')}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <Input
              placeholder="Notes optionnelles…"
              value={form.description}
              onChange={set('description')}
            />
          </Field>

          {/* Champs spécifiques au chèque */}
          {form.depositSubtype === 'check' && (
            <div>
              {/* Numéro du chèque (imprimé) */}
              <Field label="Numéro du chèque (imprimé)" required error={errors.checkNumber}>
                <Input
                  placeholder="Ex: 001245"
                  hasError={!!errors.checkNumber}
                  value={form.checkNumber}
                  onChange={set('checkNumber')}
                />
              </Field>

              {/* Numéro séquentiel MICR */}
              <Field label="Numéro séquentiel MICR" required error={errors.micrSequence}>
                <Input
                  placeholder="Ex: 907"
                  hasError={!!errors.micrSequence}
                  value={form.micrSequence}
                  onChange={set('micrSequence')}
                />
              </Field>

              {/* Code banque (MICR) */}
              <Field label="Code banque (MICR)" required error={errors.bankCode}>
                <Input
                  placeholder="Ex: 121000031"
                  hasError={!!errors.bankCode}
                  value={form.bankCode}
                  onChange={set('bankCode')}
                />
              </Field>

              {/* Numéro de compte (MICR) */}
              <Field label="Numéro de compte (MICR)" required error={errors.accountNumberMicr}>
                <Input
                  placeholder="Ex: 10100600000"
                  hasError={!!errors.accountNumberMicr}
                  value={form.accountNumberMicr}
                  onChange={set('accountNumberMicr')}
                />
              </Field>

              {/* Code succursale */}
              <Field label="Code succursale" required error={errors.branchCode}>
                <Input
                  placeholder="Ex: SC #0102"
                  hasError={!!errors.branchCode}
                  value={form.branchCode}
                  onChange={set('branchCode')}
                />
              </Field>

              {/* Code produit */}
              <Field label="Code produit" required error={errors.productCode}>
                <Input
                  placeholder="Ex: 031, 001…"
                  hasError={!!errors.productCode}
                  value={form.productCode}
                  onChange={set('productCode')}
                />
              </Field>

              {/* Banque émettrice */}
              <Field label="Banque émettrice" required error={errors.issuingBank}>
                <Input
                  placeholder="Ex: Unibank, Sogebank…"
                  hasError={!!errors.issuingBank}
                  value={form.issuingBank}
                  onChange={set('issuingBank')}
                />
              </Field>

              {/* Nom de l'émetteur */}
              <Field label="Nom de l'émetteur" required error={errors.checkIssuerName}>
                <Input
                  placeholder="Nom inscrit sur le chèque"
                  hasError={!!errors.checkIssuerName}
                  value={form.checkIssuerName}
                  onChange={set('checkIssuerName')}
                />
              </Field>

              {/* Bénéficiaire */}
              <Field label="Bénéficiaire" required error={errors.beneficiary}>
                <Input
                  placeholder="Nom du bénéficiaire"
                  hasError={!!errors.beneficiary}
                  value={form.beneficiary}
                  onChange={set('beneficiary')}
                />
              </Field>

              {/* Montant en lettres */}
              <Field label="Montant en lettres" required error={errors.amountWords}>
                <Input
                  placeholder="Ex: Dix mille gourdes"
                  hasError={!!errors.amountWords}
                  value={form.amountWords}
                  onChange={set('amountWords')}
                />
              </Field>

              {/* Lieu d'émission */}
              <Field label="Lieu d'émission" required error={errors.issuePlace}>
                <Input
                  placeholder="Ex: Pétion-Ville"
                  hasError={!!errors.issuePlace}
                  value={form.issuePlace}
                  onChange={set('issuePlace')}
                />
              </Field>

              {/* Date du chèque */}
              <Field label="Date du chèque">
                <Input
                  type="date"
                  value={form.checkDate ?? ''}
                  onChange={set('checkDate')}
                />
              </Field>
            </div>
          )}

        </div>
      </div>

      {/* ── Erreur de soumission (API indisponible, erreur métier, etc.) ── */}
      {submitError && <ErrorBanner message={submitError} />}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Annuler
        </button>
        <button type="submit" disabled={submitting || isLoading || isBlocked}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting || isLoading
            ? <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</div>
            : <div className="flex items-center gap-2"><ArrowDownCircle className="w-4 h-4" /> Enregistrer le dépôt</div>
          }
        </button>
      </div>
      {form.depositSubtype === 'check' && amount > 0 && (
        <div className="text-xs text-gray-500 px-3 py-2 bg-blue-50 rounded-lg">
          Le montant sera disponible après vérification (généralement 3 jours).
          Le délai final sera confirmé après traitement.
        </div>
      )}
    </form>
  );
}