'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight, ArrowLeft, CreditCard, Banknote,
  User, UserCheck, Hash, FileText, ShieldCheck,
  CheckCircle2, AlertTriangle, Loader2,
  Printer,
} from 'lucide-react';
import MemberPicker from '../../members/MemberPicker';
import { TransferFormErrors, TransferFormData, validateTransferWithZod } from '../validation/transfert';
import { MemberOption } from '../../members/validations';
import { AccountOption } from '../../accounts/validationsaccount';

// ─── Types & config ───────────────────────────────────────────────────────────


export interface TransferFormProps {
  members?:   MemberOption[];
  onSubmit?:  (data: TransferFormData) => Promise<void>;
  onCancel?:  () => void;
  isLoading?: boolean;
}
// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_MEMBERS: MemberOption[] = [
  { id: 'dcb21971', member_name: 'Hudson Joseph',       id_number: '555555' },
  { id: 'a1b2c3d4', member_name: 'Marie Dupont',        id_number: '987654',  },
  { id: 'b3c4d5e6', member_name: 'Jean-Pierre Antoine', id_number: '112233',  },
  { id: 'c4d5e6f7', member_name: 'Roseline Pierre',     id_number: '334455', },
  { id: 'd5e6f7a8', member_name: 'Claudette Moreau',    id_number: '556677',  },
  { id: 'e6f7a8b9', member_name: 'Réginald Beaumont',   id_number: '778899', },
  { id: 'f7a8b9c0', member_name: 'Nadège Thermidor',    id_number: '990011', },
  { id: 'a8b9c0d1', member_name: 'Wilgens Désir',       id_number: '223344', },
];

const MOCK_ACCOUNTS: Record<string, AccountOption[]> = {
  dcb21971: [
    { id: 'acc-001', account_number: 'ACC1001', typeCompte: 'epargne', balance: 45000, account_status: 'actif' },
    { id: 'acc-002', account_number: 'ACC1002', typeCompte: 'terme',   balance: 12000, account_status: 'actif' },
  ],
  a1b2c3d4: [
    { id: 'acc-003', account_number: 'ACC1003', typeCompte: 'epargne', balance: 78000, account_status: 'actif' },
  ],
  b3c4d5e6: [
    { id: 'acc-004', account_number: 'ACC1004', typeCompte: 'epargne', balance: 15000, account_status: 'actif'    },
    { id: 'acc-005', account_number: 'ACC1005', typeCompte: 'terme',   balance: 60000, account_status: 'gele' },
  ],
};

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  epargne: { label: 'Épargne', bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]' },
  cheques: { label: 'Chèques', bg: 'bg-blue-50',   text: 'text-[#355C7D]' },
  terme:   { label: 'Terme',   bg: 'bg-yellow-50', text: 'text-yellow-700' },
};
 
function getMockAccounts(memberId: string): AccountOption[] {
  return MOCK_ACCOUNTS[memberId] ?? [
    {
      id: `acc-${memberId}-1`,
      account_number: `ACC${Math.floor(Math.random() * 9000) + 1000}`,
      typeCompte: 'epargne',
      balance: Math.floor(Math.random() * 50000) + 5000,
      account_status: 'actif',
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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
        ${hasError ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white hover:border-gray-300'} ${className}`}
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

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{children}</p>;
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


// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TransferForm({ members: propMembers, onSubmit, onCancel, isLoading }: TransferFormProps) {

  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  const [sourceMember,        setSourceMember]        = useState<MemberOption | null>(null);
  const [sourceMemberAccounts, setSourceMemberAccounts] = useState<AccountOption[]>([]);
  const [sourceAccount,       setSourceAccount]       = useState<AccountOption | null>(null);
  const [loadingSource,       setLoadingSource]       = useState(false);
  const [sourceError,         setSourceError]         = useState('');
  const [members,        setMembers]        = useState<MemberOption[]>(propMembers ?? MOCK_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
// ── Account state ──
  const [accounts,        setAccounts]        = useState<AccountOption[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);

  const [destMember,          setDestMember]          = useState<MemberOption | null>(null);
  const [destMemberAccounts,  setDestMemberAccounts]  = useState<AccountOption[]>([]);
  const [destAccount,         setDestAccount]         = useState<AccountOption | null>(null);
  const [loadingDest,         setLoadingDest]         = useState(false);
  const [destError,           setDestError]           = useState('');

  const [form, setForm] = useState({ montant: '', description: '', });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<TransferFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<null | any>(null);   
   
    const handleSelectDestMember = (m: MemberOption | null) => {
      setDestMember(m);
      setDestAccount(null);

      if (!m) {
        setDestMemberAccounts([]);

        setForm(f => ({
          ...f,
          account_destination: "",
        }));

        return;
      }

      setLoadingDest(true);

      setTimeout(() => {
        setDestMemberAccounts(getMockAccounts(m.id));
        setLoadingDest(false);
      }, 400);
    };
    const handleSelectSourceMember = (m: MemberOption | null) => {
      setSourceMember(m);
      setSourceAccount(null);

      if (!m) {
        setSourceMemberAccounts([]);

        setForm(f => ({
          ...f,
          id_member: "",
          account_source: "",
        }));

        return;
      }

      setForm(f => ({
        ...f,
        id_member: m.id, // initiateur du transfert
      }));

      setLoadingSource(true);

      setTimeout(() => {
        setSourceMemberAccounts(getMockAccounts(m.id));
        setLoadingSource(false);
      }, 400);
    };
  // ── Derived ──métier

// 🚀 Règle d’or
// parseFloat = formulaire tolérant
// Number = logique métier sérieuse
  const sameMember   = !!sourceMember && destMember?.id === sourceMember.id;
  const amount = Number(form.montant || 0);
  const sourceBalance = sourceAccount?.balance ?? 0;
  const insufficient =
    sourceAccount && amount > sourceBalance;
  const generateReference = () => {
    return `REF-${Date.now()}`;
  };
  // ── Validation ──
  const validate = (): boolean => {
    const payload: TransferFormData = {
      id_member:           sourceMember?.id ?? '',
      account_source:      sourceAccount?.account_number ?? '',
      account_destination: destAccount?.account_number ?? '',
      typeTransfert:       'interne',
      montant:             amount,
      description:         form.description || undefined,
    };
    const result = validateTransferWithZod(payload);
    const all: TransferFormErrors = { ...result.errors };
    if (!destMember)  (all as any).destMember = 'Membre destination requis.';
    if (insufficient) all.montant             = 'Solde insuffisant sur le compte source.';
    setErrors(all);
    return Object.keys(all).length === 0;
  };
 
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 800));

    const reference = generateReference();
    const payload = {
      sourceAccount,
      destAccount,
      amount,
      date: new Date().toISOString(),
      reference,
    };

    console.log("🚀 TRANSFER SUBMITTED:", payload);

    setSubmittedData(payload);
    setIsSubmitting(false);
    setStep('success'); // 👈 bascule vers l'écran/modal de succès
  };
    
  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setStep('success');
  };

  // ── Écrans succès & confirmation ──
  if (step === 'success') {
    return (
      <>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #transfer-receipt, #transfer-receipt * { visibility: visible; }
            #transfer-receipt {
              position: absolute;
              left: 0; top: 0;
              width: 100%;
              padding: 40px;
            }
            .no-print { display: none !important; }
          }
        `}
        </style>

        <div className="flex flex-col items-center justify-center py-12 px-6 gap-5">
          {/* Icône */}
          <div className="no-print w-20 h-20 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#2E7D32]" />
          </div>

          {/* Titre */}
          <div className="no-print text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Transfert effectué avec succès
            </h2>
          </div>

          {/* Récap / Fiche imprimable */}
          {submittedData && (
            <div
              id="transfer-receipt"
              className="w-full bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5 mt-2"
            >
              {/* En-tête CAPOSA (visible uniquement à l'impression) */}
              <div className="hidden print:block text-center pb-4 mb-4 border-b border-gray-300 divide-y divide-gray-200">
                <h1 className="text-2xl font-bold tracking-wide text-gray-900" style={{ fontFamily: 'serif' }}>
                  CAPOSA
                </h1>
                <p className="text-base font-bold text-gray-800 mt-3" style={{ fontFamily: 'serif' }}>
                  Confirmation de virement
                </p>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100 divide-y divide-gray-200">
                <span className="text-xs uppercase tracking-widest text-gray-500">
                  Référence
                </span>
                <span className="text-sm font-mono font-bold text-gray-800">
                  {submittedData.reference}
                </span>
              </div>

              {/* Date + heure (uniquement à l'impression) */}
              <div className="hidden print:flex items-center justify-between py-2 border-b border-gray-100  divide-gray-400">
                <span className="text-xs uppercase tracking-widest text-gray-500">Date</span>
                <span className="text-sm text-gray-800">
                  {new Date(submittedData.date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="hidden print:flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Heure</span>
                <span className="text-sm text-gray-800">
                  {new Date(submittedData.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100  divide-gray-200">
                <span className="text-xs uppercase tracking-widest text-gray-500">
                  Montant
                </span>
                <span className="text-sm font-bold text-[#2E7D32]">
                  {formatHTG(submittedData.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100  divide-gray-200">
                <span className="text-xs uppercase tracking-widest text-gray-500">
                  Compte source
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {submittedData.sourceAccount?.account_number}
                </span>
              </div>
              <div className="flex items-center justify-between py-2  divide-gray-200">
                <span className="text-xs uppercase tracking-widest text-gray-500">
                  Compte destination
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {submittedData.destAccount?.account_number}
                </span>
              </div>

              {/* Destinataire + message + statut (uniquement à l'impression) */}
              {destMember && (
                <div className="hidden print:flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Destinataire</span>
                  <span className="text-sm text-gray-800">{destMember.member_name}</span>
                </div>
              )}
              {form.description && (
                <div className="hidden print:flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Message</span>
                  <span className="text-sm text-gray-800">{form.description}</span>
                </div>
              )}
              <div className="hidden print:flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Statut</span>
                <span className="text-sm font-bold text-[#2E7D32]">Envoyé</span>
              </div>

              {/* Pied de page (uniquement à l'impression) */}
              <div className="hidden print:block mt-6 pt-4 border-t border-gray-300 text-center">
                <p className="text-xs text-gray-500">
                  Veuillez conserver cette confirmation pour vos dossiers.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Pour toute question, veuillez contacter notre service à la clientèle.
                </p>
              </div>
            </div>
          )}

          {/* Bouton Imprimer */}
          <div className="no-print flex w-full mt-4">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-shadow"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>
      </>
    );
  }
  // confirm
  if (step === 'confirm') {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-bold text-gray-900">Confirmer le transfert</p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              ['Membre source',      sourceMember?.member_name],
              ['Compte source',      `${sourceAccount?.account_number} — ${sourceAccount?.account_number}`],
              ['Membre destination', destMember?.member_name],
              ['Compte destination', `${destAccount?.account_number} — ${destAccount?.account_number}`],
              ['Montant',            formatHTG(amount)],
              ['Description',        form.description || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-sm font-semibold ${label === 'Montant' ? 'text-[#2E7D32]' : 'text-gray-800'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => setStep('form')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4" /> Modifier
          </button>
          <button type="button" onClick={handleConfirm} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg disabled:opacity-50">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</>
              : <><CheckCircle2 className="w-4 h-4" /> Valider</>}
          </button>
        </div>
      </div>
    );
  }

  // ── Formulaire ──
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

     {/* ─── 2. Compte à débiter ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={2} title="Compte à débiter" icon={CreditCard} />

        <MemberPicker
          members={members}
          selectedMember={sourceMember}
          onSelect={handleSelectSourceMember}
          isRequired
          errorMessage={errors.id_member_source}
          label="Rechercher un membre source"
        />

        {sourceMember && (
          <div className="mt-4">
            {loadingSource ? (
              <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement des comptes…
              </div>
            ) : sourceMemberAccounts.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                Ce membre n'a aucun compte.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {sourceMemberAccounts.map(acc => {
                  const badge = TYPE_BADGE[acc.typeCompte];
                  const isInactive = acc.account_status !== 'actif';
                  const isSelected =
                    sourceAccount?.account_number === acc.account_number;

                  return (
                    <button
                      key={acc.account_number}
                      type="button"
                      disabled={isInactive}
                      onClick={() => {
                        if (isInactive) return;

                        const next = isSelected ? null : acc;

                        setSourceAccount(next);

                        setForm(f => ({
                          ...f,
                          account_source: next?.account_number || "",
                        }));
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#2E7D32] bg-[#DDEAD5]/40 shadow-sm'
                          : isInactive
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-100 bg-[#F9F9F6] hover:border-[#81C784] hover:bg-[#DDEAD5]/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-gray-400 shrink-0" />

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {acc.account_number}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatHTG(acc.balance)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        )}

                        {isInactive && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            {acc.account_status}
                          </span>
                        )}

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {errors.account_source && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
            <AlertTriangle className="w-3 h-3" />
            {errors.account_source}
          </p>
        )}
      </div>
           {/* ─── 4. Compte à créditer ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={4} title="Compte à créditer" icon={CreditCard} />

        <MemberPicker
          members={members}
          selectedMember={destMember}
          onSelect={handleSelectDestMember}
          isRequired
          errorMessage={errors.id_member_destination}
          label="Rechercher un membre destination"
        />

        {destMember && (
          <div className="mt-4">
            {loadingDest ? (
              <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement des comptes…
              </div>
            ) : destMemberAccounts.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                Ce membre n'a aucun compte.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {destMemberAccounts.map(acc => {
                  const badge = TYPE_BADGE[acc.typeCompte];

                  const isInactive = acc.account_status !== 'actif';

                  const isSameAsSrc =
                    sameMember &&
                    sourceAccount?.account_number === acc.account_number;
                  const isDisabled = isInactive || isSameAsSrc;

                  const isSelected =
                    destAccount?.account_number === acc.account_number;

                  return (
                    <button
                      key={acc.account_number}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;

                        const next = isSelected ? null : acc;

                        setDestAccount(next);

                        setForm(f => ({
                          ...f,
                          account_destination: next?.account_number || "",
                        }));
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#2E7D32] bg-[#DDEAD5]/40 shadow-sm'
                          : isDisabled
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-100 bg-[#F9F9F6] hover:border-[#81C784] hover:bg-[#DDEAD5]/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-gray-400 shrink-0" />

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {acc.account_number}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatHTG(acc.balance)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        )}

                        {isSameAsSrc && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Source
                          </span>
                        )}

                        {isInactive && !isSameAsSrc && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            {acc.account_status}
                          </span>
                        )}

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {errors.account_destination && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
            <AlertTriangle className="w-3 h-3" />
            {errors.account_destination}
          </p>
        )}
      </div>

      {/* 5. Montant et détails */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={5} title="Montant et détails" icon={Banknote} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Montant (HTG)" required error={errors.montant}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">HTG</span>
              <Input type="number" min={1} placeholder="0" hasError={!!errors.montant}
                className="pl-12 text-right font-mono text-base font-bold"
                value={form.montant}
                onChange={e => { setForm(f => ({ ...f, montant: e.target.value })); setErrors(er => ({ ...er, montant: undefined })); }} />
            </div>
            {amount > 0 && !insufficient && (
              <p className="text-xs text-[#2E7D32] font-semibold text-right">{formatHTG(amount)}</p>
            )}
          </Field>

          <Field label="Référence">
            <div className="px-3 py-2 rounded-xl bg-gray-50 border text-sm font-mono text-gray-500">
              Générée automatiquement à la soumission
            </div>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description / Motif" hint="Optionnel (max 500 caractères)" error={errors.description}>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <textarea
                placeholder="Ex: Réallocation épargne vers compte courant…"
                value={form.description} maxLength={500} rows={2}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white outline-none transition-all
                  focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32] hover:border-gray-300 resize-none"
              />
            </div>
          </Field>
        </div>

        {sourceAccount && amount > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            
            <div className="bg-[#F9F9F6] rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Solde disponible</p>
              <p className="text-sm font-bold text-[#2E7D32]">
                {formatHTG(sourceAccount.balance)}
              </p>
            </div>

            <div
              className={`rounded-xl px-4 py-3 border ${
                insufficient
                  ? 'bg-red-50 border-red-100'
                  : 'bg-[#F9F9F6] border-gray-100'
              }`}
            >
              <p className="text-xs text-gray-400 mb-1">Après transfert</p>

              <p
                className={`text-sm font-bold ${
                  insufficient ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                {insufficient
                  ? '— HTG (solde insuffisant)'
                  : formatHTG(sourceAccount.balance - amount)}
              </p>
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" /> Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-4 h-4" />
              Soumettre
            </>
          )}
        </button>
      </div>
      
    </form>
  );
}