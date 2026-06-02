'use client';

import React, { useState } from 'react';
import {
  AlertTriangle, Clock, User, CreditCard, Hash,
  FileText, Search, ChevronDown, X, CheckCircle2,
  Loader2, ArrowDownCircle,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MemberOption } from '../../members/validations';
import { TransactionDiffere, TransactionDiffereSchema } from '../validation/TransactionDiffereSchema';

// ─── Types locaux ────────────────────────────────────────────────────────────

interface AccountOption {
  id:             string;
  account_number: string;
  typeCompte:     'epargne' | 'cheques' | 'terme';
  soldeActuel:    number;
  statutCompte:   'actif' | 'suspendu' | 'ferme';
}

interface DifferedDepositModalProps {
  sessionId:  string;
  saisiPar:   string;           // UUID user connecté — auto-rempli
  members?:   MemberOption[];
  accounts?:  Record<string, AccountOption[]>;
  onSubmit:   (data: TransactionDiffere) => Promise<void>;
  onCancel:   () => void;
  isLoading?: boolean;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  epargne: { label: 'Épargne',  bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]'  },
  cheques: { label: 'Chèques', bg: 'bg-blue-50',    text: 'text-[#355C7D]'  },
  terme:   { label: 'Terme',   bg: 'bg-yellow-50',  text: 'text-yellow-700' },
};

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── Sous-composants (identiques à DepositForm) ───────────────────────────────

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
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">{step}</span>
      </div>
      <Icon className="w-4 h-4 text-gray-400" />
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Mock data (à remplacer par les vraies props) ─────────────────────────────

const MOCK_MEMBERS: MemberOption[] = [
  { id: 'dcb21971', member_name: 'Hudson Joseph',       id_number: '555555', phone_number: '1248666' },
  { id: 'a1b2c3d4', member_name: 'Marie Dupont',        id_number: '987654', phone_number: '3456789' },
];

const MOCK_ACCOUNTS: Record<string, AccountOption[]> = {
  'dcb21971': [
    { id: 'acc1', account_number: '636-922-093-4469', typeCompte: 'epargne', soldeActuel: 15000, statutCompte: 'actif' },
  ],
  'a1b2c3d4': [
    { id: 'acc4', account_number: '321-654-987-0123', typeCompte: 'terme',   soldeActuel: 50000, statutCompte: 'actif' },
  ],
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function DifferedDepositModal({
  sessionId,
  saisiPar,
  members   = MOCK_MEMBERS,
  accounts  = MOCK_ACCOUNTS,
  onSubmit,
  onCancel,
  isLoading = false,
}: DifferedDepositModalProps) {

  // ── Sélection membre / compte (pattern identique à DepositForm) ──
  const [memberSearch,    setMemberSearch]    = useState('');
  const [memberOpen,      setMemberOpen]      = useState(false);
  const [selectedMember,  setSelectedMember]  = useState<MemberOption | null>(null);
  const [memberAccounts,  setMemberAccounts]  = useState<AccountOption[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);
  const [submitting,      setSubmitting]      = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TransactionDiffere>({
    resolver: zodResolver(TransactionDiffereSchema),
    defaultValues: {
      session_id: sessionId,
      saisi_par:  saisiPar,
      type:       'depot',
    },
  });

  // ── Sélection membre ─────────────────────────────────────────────
  const filteredMembers = members.filter(m =>
    m.member_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.id_number.includes(memberSearch)
  );

  const handleMemberSelect = (m: MemberOption) => {
    setSelectedMember(m);
    setMemberOpen(false);
    setMemberSearch('');
    setSelectedAccount(null);
    setMemberAccounts(accounts[m.id] ?? []);
  };

  const handleAccountSelect = (acc: AccountOption) => {
    if (acc.statutCompte !== 'actif') return;
    setSelectedAccount(acc);
    // on stocke l'id du compte dans le champ session_id n'est pas le bon —
    // adapter selon ton vrai schéma backend si besoin
  };

  // ── Submit ───────────────────────────────────────────────────────
  // const onValid = async (data: TransactionDiffere) => {
  //   setSubmitting(true);
  //   try {
  //     await onSubmit(data);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  // const onValid = async (data: TransactionDiffere) => {
  //   setSubmitting(true);
  //   try {
  //     console.log("[MOCK POST] /api/transactions/differe", {
  //       payload: data,
  //       sent_at: new Date().toISOString(),
  //     });
  //     await onSubmit(data);
  //     setSuccess(true);   // ← affiche la confirmation
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  const onInvalid = (errors: any) => {
  console.log("❌ Formulaire invalide :", errors);
};

  const onValid = async (data: TransactionDiffere) => {
     console.log("🔥 onValid appelé !");
  console.log("Payload :", data);
  setSubmitting(true);
  try {
    console.log("[MOCK POST] /api/transactions/differe", {
      payload: data,
      sent_at: new Date().toISOString(),
    });

    await onSubmit(data);
    setSuccess(true);
  } finally {
    setSubmitting(false);
  }
};

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-amber-600" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">Saisie différée enregistrée</p>
          <p className="text-sm text-gray-500 mt-1">
            La transaction a été soumise et sera traitée par le backend.
          </p>
        </div>
        <div className="w-full bg-gray-50 rounded-xl border border-gray-100 p-4 text-left text-xs font-mono text-gray-500 max-h-40 overflow-y-auto">
          <pre>{JSON.stringify({ status: 'mock_ok', message: 'En attente endpoint Django' }, null, 2)}</pre>
        </div>
        <button onClick={onCancel}
          className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors">
          Fermer
        </button>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────


  return (
    <form onSubmit={handleSubmit(onValid,onInvalid)} noValidate className="flex flex-col gap-5">

      {/* ── Bandeau avertissement ── */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800">Saisie différée — action traçée</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Cette transaction sera enregistrée avec la date que vous indiquez.
            Un motif obligatoire sera conservé dans le journal d'audit.
          </p>
        </div>
      </div>

      {/* ── 1. Membre + Compte (même pattern que DepositForm) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={1} title="Membre et compte cible" icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Membre */}
          <Field label="Membre" required
            error={!selectedMember ? 'Sélectionnez un membre' : undefined}>
            <div className="relative">
              <button type="button" onClick={() => setMemberOpen(o => !o)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all
                  ${selectedMember ? 'border-[#2E7D32] bg-[#DDEAD5]/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <span className={`flex-1 truncate ${selectedMember ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                  {selectedMember?.member_name ?? 'Rechercher un membre…'}
                </span>
                {selectedMember
                  ?  <span onClick={e => { e.stopPropagation(); setSelectedMember(null); setSelectedAccount(null); setMemberAccounts([]); }}
                        className="p-0.5 rounded-md hover:bg-[#c8e0bc] text-gray-500 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                    </span>
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
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
          </Field>

          {/* Compte cible */}
          <Field label="Compte cible" required
            hint={!selectedMember ? "Sélectionnez un membre d'abord" : undefined}>
            <Input placeholder="Ex: 636-922-093-4469"
              disabled={!selectedMember}
              value={selectedAccount?.account_number ?? ''}
              readOnly />
            {memberAccounts.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {memberAccounts.map(acc => {
                  const tCfg  = TYPE_LABEL[acc.typeCompte];
                  const isAct = acc.statutCompte === 'actif';
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
                      {!isAct && <span className="px-1.5 py-0.5 rounded-md text-xs bg-gray-100 text-gray-400">Suspendu</span>}
                      {isSel  && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

        </div>
      </div>

      {/* ── 2. Montant + Type ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={2} title="Montant et type" icon={ArrowDownCircle} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Field label="Montant (HTG)" required error={errors.montant?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">HTG</span>
              <Input type="number" min={1} placeholder="0"
                hasError={!!errors.montant}
                className="pl-12 text-right font-mono text-base font-bold"
                {...register('montant', { valueAsNumber: true })}
              />
            </div>
          </Field>

          <Field label="Type de transaction" required error={errors.type?.message}>
            <select
              {...register('type')}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white outline-none
                focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32] transition-all">
              <option value="depot">Dépôt</option>
              <option value="retrait">Retrait</option>
              <option value="transfert_entrant">Transfert entrant</option>
              <option value="transfert_sortant">Transfert sortant</option>
              <option value="pret_encaisse">Prêt encaissé</option>
              <option value="pret_debourse">Prêt déboursé</option>
              <option value="frais">Frais</option>
              <option value="autre">Autre</option>
            </select>
          </Field>

        </div>
      </div>

      {/* ── 3. Champs saisie différée ── */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm ring-1 ring-amber-100">
        <SectionHeader step={3} title="Données de la saisie différée" icon={Clock} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Date de la transaction (modifiable) */}
          <Field label="Date de la transaction" required error={errors.transaction_date?.message}
            hint="Date réelle à laquelle la transaction a eu lieu.">
            <Input type="datetime-local"
              hasError={!!errors.transaction_date}
              {...register('transaction_date')}
            />
          </Field>

         

          {/* Motif — pleine largeur */}
          <div className="sm:col-span-2">
            <Field label="Motif de la saisie différée" required error={errors.motif_saisie_differee?.message}
              hint="Min. 10 caractères. Sera conservé dans le journal d'audit.">
              <textarea
                {...register('motif_saisie_differee')}
                rows={3}
                placeholder="Ex: Panne système le 30/05 entre 14h et 16h — transactions enregistrées manuellement et saisies le lendemain."
                className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none resize-none transition-all
                  focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
                  ${errors.motif_saisie_differee
                    ? 'border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              />
            </Field>
          </div>

        </div>
      </div>

      {/* ── 4. Note optionnelle ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={4} title="Note (optionnel)" icon={FileText} />
        <Field label="Note interne">
          <Input placeholder="Référence, remarque…" {...register('note')} />
        </Field>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Annuler
        </button>
        <button type="submit"
          onClick={() => console.log("🟧 Bouton Saisie différée cliqué")}
          disabled={submitting || isLoading || !selectedAccount}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
            bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all
            disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting || isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
            : <><Clock className="w-4 h-4" /> Enregistrer la saisie différée</>
          }
        </button>
      </div>

    </form>
  );
}