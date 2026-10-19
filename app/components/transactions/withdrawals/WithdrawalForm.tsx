'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard, Banknote, User, FileText, ShieldCheck,
  CheckCircle2, AlertTriangle, Loader2, Search,
  X, ChevronDown, ArrowDownCircle,
} from 'lucide-react';
import { MemberOption } from '../../members/validations';
import { WithdrawalFormValidated, withdrawalSchema } from '../validation/withdrawal';
import WithdrawalReceipt, { type WithdrawalApiResult } from './WithdrawalReceipt';
// ─── Types ───────────────────────────────────────────────────────────────────

type AccountStatus = 'actif' | 'gele' | 'ferme' | 'en_attente' | 'archive';

interface AccountOption {
  id:             string;   // UUID — c'est lui qui part au backend
  account_number: string;   // affichage uniquement
  typeCompte:     'epargne' | 'cheques' | 'terme';
  soldeActuel:    number;
  account_status: AccountStatus;
}

export interface WithdrawalFormProps {
  members:             MemberOption[];
  fetchMemberAccounts: (memberId: string) => Promise<any[]>;
  onSubmit: (data: WithdrawalFormValidated) => Promise<WithdrawalApiResult>;
  onCancel:            () => void;
  isLoading?:          boolean;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  epargne: { label: 'Épargne', bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]'  },
  cheques: { label: 'Chèques', bg: 'bg-blue-50',   text: 'text-[#355C7D]'  },
  terme:   { label: 'Terme',   bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  actif:      'Actif',
  gele:       'Gelé',
  ferme:      'Fermé',
  en_attente: 'En attente',
  archive:    'Archivé',
};

const MOTIFS = ['Achat fournitures', 'Paiement facture', 'Dépenses courantes', 'Urgence médicale', 'Autre'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' HTG';
}

// Normalise la réponse de fetchMemberAccounts (API brute ou déjà mappée)
function toAccountOption(a: any): AccountOption {
  return {
    id:             String(a.id),
    account_number: a.account_number ?? '',
    typeCompte:     a.typeCompte ?? a.account_type ?? 'epargne',
    soldeActuel:    Number(a.soldeActuel ?? a.balance ?? 0),
    account_status: a.account_status ?? 'en_attente',
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({ label, required, error, hint, className = '', children }: {
  label: string; required?: boolean; error?: string; hint?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
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

function StyledInput({ hasError, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
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

// ─── Main ────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { idCompte: '', montantTransaction: '', motif: '', description: '' };

export default function WithdrawalForm({
  members,
  fetchMemberAccounts,
  onSubmit,
  onCancel,
  isLoading = false,
}: WithdrawalFormProps) {

  const [memberSearch,    setMemberSearch]    = useState('');
  const [memberOpen,      setMemberOpen]      = useState(false);
  const [selectedMember,  setSelectedMember]  = useState<MemberOption | null>(null);
  const [memberAccounts,  setMemberAccounts]  = useState<AccountOption[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);
  const [submitted,       setSubmitted]       = useState(false);
  const [submittedData,   setSubmittedData]   = useState<WithdrawalFormValidated | null>(null);
  const [submitting,      setSubmitting]      = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [form,            setForm]            = useState(EMPTY_FORM);
  const [created, setCreated] = useState<WithdrawalApiResult | null>(null);
  const amount       = parseFloat(form.montantTransaction) || 0;
  const isBlocked    = selectedAccount !== null && selectedAccount.account_status !== 'actif';
  const insufficient = selectedAccount ? amount > selectedAccount.soldeActuel : false;
  const needsVerif   = amount > 50000;

  // ── Membres ─────────────────────────────────────────────────
  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    return members.filter(m =>
      (m.member_name ?? '').toLowerCase().includes(q) ||
      (m.id_number ?? '').includes(memberSearch)
    );
  }, [members, memberSearch]);

  const handleMemberSelect = async (m: MemberOption) => {
    setSelectedMember(m);
    setMemberOpen(false);
    setMemberSearch('');
    setSelectedAccount(null);
    setMemberAccounts([]);
    setForm(f => ({ ...f, idCompte: '' }));
    setErrors(e => ({ ...e, member: '', idCompte: '' }));

    setAccountsLoading(true);
    try {
      const list = await fetchMemberAccounts(String(m.id));
      setMemberAccounts(list.map(toAccountOption));
    } catch (e: any) {
      setErrors(er => ({ ...er, idCompte: e?.message ?? 'Impossible de charger les comptes du membre.' }));
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleAccountSelect = (acc: AccountOption) => {
    if (acc.account_status !== 'actif') return;
    setSelectedAccount(acc);
    setForm(f => ({ ...f, idCompte: acc.id }));   // UUID, pas account_number
    setErrors(e => ({ ...e, idCompte: '' }));
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setSelectedAccount(null);
    setMemberAccounts([]);
    setForm(f => ({ ...f, idCompte: '' }));
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const extraErrors: Record<string, string> = {};
    if (!selectedMember) extraErrors.member = 'Sélectionnez un membre.';
    // if (!form.motif)     extraErrors.motif  = 'Sélectionnez un motif.';

    const payload = {
      idCompte:           form.idCompte,
      typeTransaction:    'WITHDRAWAL' as const,
      montantTransaction: amount,
      reason:             [form.motif, form.description].filter(Boolean).join(' — ') || null,
    };

    const result = withdrawalSchema.safeParse(payload);

    if (!result.success || Object.keys(extraErrors).length > 0) {
      const fieldErrors: Record<string, string> = { ...extraErrors };
      if (!result.success) {
        result.error.errors.forEach(err => {
          const key = String(err.path[0]);
          if (!fieldErrors[key]) fieldErrors[key] = err.message;
        });
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const response = await onSubmit(result.data);
      setCreated(response);   
      await onSubmit(result.data);
      setSubmittedData(result.data);
      setSubmitted(true);
    } catch (err: any) {
      // ex. « Fonds insuffisants sur le compte. » renvoyé par Django
      setErrors({ submit: err?.message ?? "Le retrait n'a pas pu être enregistré." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmittedData(null);
    setForm(EMPTY_FORM);
    setSelectedMember(null);
    setSelectedAccount(null);
    setMemberAccounts([]);
    setErrors({});
  };

   if (submitted && submittedData) {
    return (
      <WithdrawalReceipt
        data={submittedData}
        apiResponse={created}
        memberName={selectedMember?.member_name}
        accountLabel={selectedAccount?.account_number}
        onReset={handleReset}
      />
    );
  }
  // ── Formulaire ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* ── 1. Membre + Compte ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={1} title="Membre et compte à débiter" icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Membre */}
            <Field label="Motif" hint="Optionnel" error={errors.motif}>            
              <div className="relative">
              <div role="button" tabIndex={0}
                onClick={() => setMemberOpen(o => !o)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setMemberOpen(o => !o); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all cursor-pointer
                  ${selectedMember ? 'border-[#2E7D32] bg-[#DDEAD5]/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <span className={`flex-1 truncate ${selectedMember ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                  {selectedMember?.member_name ?? 'Rechercher un membre…'}
                </span>
                {selectedMember
                  ? <button type="button" onClick={e => { e.stopPropagation(); handleClearMember(); }}
                      className="p-0.5 rounded-md hover:bg-[#c8e0bc] text-gray-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </div>

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
                              <span className="text-xs font-bold text-[#2E7D32]">{(m.member_name ?? '?')[0]}</span>
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

          {/* Compte à débiter */}
          <Field label="Compte à débiter" required error={errors.idCompte}
            hint={!selectedMember ? "Sélectionnez un membre d'abord" : undefined}>

            {!selectedMember && (
              <StyledInput disabled placeholder="Ex: 636-922-093-4469" value="" readOnly />
            )}

            {selectedMember && accountsLoading && (
              <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#2E7D32]" /> Chargement des comptes…
              </div>
            )}

            {selectedMember && !accountsLoading && memberAccounts.length === 0 && !errors.idCompte && (
              <p className="px-3 py-2.5 text-xs text-gray-400 bg-[#F9F9F6] rounded-xl border border-gray-100">
                Aucun compte pour ce membre.
              </p>
            )}

            {!accountsLoading && memberAccounts.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {memberAccounts.map(acc => {
                  const tCfg  = TYPE_LABEL[acc.typeCompte] ?? TYPE_LABEL.epargne;
                  const isAct = acc.account_status === 'actif';
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
                      {!isAct && (
                        <span className="px-1.5 py-0.5 rounded-md text-xs bg-gray-100 text-gray-500">
                          {STATUS_LABEL[acc.account_status] ?? acc.account_status}
                        </span>
                      )}
                      {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>
        </div>
      </div>

      {/* ── 2. Montant + Motif ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={2} title="Montant et motif" icon={Banknote} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Montant (HTG)" required error={errors.montantTransaction}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">HTG</span>
              <StyledInput type="number" min={1} placeholder="0" hasError={!!errors.montantTransaction}
                className="pl-12 text-right font-mono text-base font-bold"
                value={form.montantTransaction}
                onChange={e => {
                  setForm(f => ({ ...f, montantTransaction: e.target.value }));
                  setErrors(er => ({ ...er, montantTransaction: '' }));
                }} />
            </div>
            {amount > 0 && (
              <p className={`text-xs font-semibold text-right ${insufficient ? 'text-red-500' : 'text-red-600'}`}>
                − {formatHTG(amount)}
                {insufficient && ' · Solde insuffisant'}
              </p>
            )}
          </Field>

          <Field label="Motif" required error={errors.motif}>
            <select value={form.motif}
              onChange={e => { setForm(f => ({ ...f, motif: e.target.value })); setErrors(er => ({ ...er, motif: '' })); }}
              className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all appearance-none bg-white
                focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
                ${errors.motif ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'}`}>
              <option value="">Sélectionner un motif…</option>
              {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>

          <Field label="Description" hint="Optionnel" className="sm:col-span-2">
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <StyledInput placeholder="Notes complémentaires…" className="pl-9"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </Field>
        </div>

        {/* Récapitulatif solde */}
        {selectedAccount && amount > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-[#F9F9F6] rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Solde actuel</p>
              <p className="text-sm font-bold text-[#2E7D32]">{formatHTG(selectedAccount.soldeActuel)}</p>
            </div>
            <div className={`rounded-xl px-4 py-3 border ${insufficient ? 'bg-red-50 border-red-100' : 'bg-[#F9F9F6] border-gray-100'}`}>
              <p className="text-xs text-gray-400 mb-1">Solde après retrait</p>
              <p className={`text-sm font-bold ${insufficient ? 'text-red-600' : 'text-gray-700'}`}>
                {formatHTG(Math.max(0, selectedAccount.soldeActuel - amount))}
              </p>
            </div>
            <div className={`rounded-xl px-4 py-3 border ${needsVerif ? 'bg-[#EBF2F8] border-[#355C7D]/20' : 'bg-[#F9F9F6] border-gray-100'}`}>
              <div className="flex items-center gap-1 mb-1">
                <ShieldCheck className={`w-3 h-3 ${needsVerif ? 'text-[#355C7D]' : 'text-gray-400'}`} />
                <p className="text-xs text-gray-400">Vérification</p>
              </div>
              <p className={`text-xs font-semibold ${needsVerif ? 'text-[#355C7D]' : 'text-gray-500'}`}>
                {needsVerif ? 'Requise' : 'Non requise'}
              </p>
            </div>
          </div>
        )}

        {needsVerif && (
          <div className="flex items-start gap-2 mt-3 px-3 py-2.5 bg-yellow-50 border border-yellow-100 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 font-medium">Montant &gt; 50 000 HTG — validation superviseur requise.</p>
          </div>
        )}
      </div>

      {/* ── Erreur backend ── */}
      {errors.submit && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 font-medium">{errors.submit}</p>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Annuler
        </button>
        <button type="submit" disabled={submitting || isLoading || isBlocked || insufficient}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting || isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
            : <><ArrowDownCircle className="w-4 h-4" /> Enregistrer le retrait</>
          }
        </button>
      </div>

    </form>
  );
}