'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, X, ChevronDown, ArrowDownCircle,
  Banknote, FileCheck, ArrowLeftRight, MoreHorizontal,
  User, CreditCard, Hash, FileText, Clock, ShieldCheck,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw,
} from 'lucide-react';
import { depositSchema, DepositSubtype, type DepositFormValidated } from '../validation/deposit';
import DepositReceipt from './DepositReceipt';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface MemberOption {
  id: string;
  full_name: string;
  id_number: string;
  phone_number?: string;
}

interface AccountOption {
  id: string;
  account_number: string;
  typeCompte: 'epargne' | 'cheques' | 'terme';
  soldeActuel: number;
  statutCompte: 'actif' | 'suspendu' | 'ferme';
}

interface DepositFormProps {
  members?:   MemberOption[];
  onSubmit:   (data: DepositFormValidated) => Promise<void>;
  onCancel:   () => void;
  isLoading?: boolean;
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

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_MEMBERS: MemberOption[] = [
  { id: 'dcb21971', full_name: 'Hudson Joseph',       id_number: '555555', phone_number: '1248666' },
  { id: 'a1b2c3d4', full_name: 'Marie Dupont',        id_number: '987654', phone_number: '3456789' },
  { id: 'b3c4d5e6', full_name: 'Jean-Pierre Antoine', id_number: '112233', phone_number: '4567890' },
  { id: 'c4d5e6f7', full_name: 'Roseline Pierre',     id_number: '334455', phone_number: '5678901' },
  { id: 'd5e6f7a8', full_name: 'Claudette Moreau',    id_number: '556677', phone_number: '6789012' },
  { id: 'e6f7a8b9', full_name: 'Réginald Beaumont',   id_number: '778899', phone_number: '7890123' },
];

const MOCK_ACCOUNTS: Record<string, AccountOption[]> = {
  'dcb21971': [
    { id: 'acc1', account_number: '636-922-093-4469', typeCompte: 'epargne', soldeActuel: 15000, statutCompte: 'actif'    },
    { id: 'acc2', account_number: '789-123-456-7890', typeCompte: 'cheques', soldeActuel: 5500,  statutCompte: 'actif'    },
    { id: 'acc3', account_number: '111-222-333-4444', typeCompte: 'epargne', soldeActuel: 1200,  statutCompte: 'suspendu' },
  ],
  'a1b2c3d4': [{ id: 'acc4', account_number: '321-654-987-0123', typeCompte: 'terme',   soldeActuel: 50000,  statutCompte: 'actif' }],
  'b3c4d5e6': [{ id: 'acc5', account_number: '456-789-012-3456', typeCompte: 'epargne', soldeActuel: 8750,   statutCompte: 'actif' }],
  'c4d5e6f7': [{ id: 'acc6', account_number: '567-890-123-4567', typeCompte: 'cheques', soldeActuel: 2300,   statutCompte: 'actif' }],
  'd5e6f7a8': [{ id: 'acc7', account_number: '678-901-234-5678', typeCompte: 'epargne', soldeActuel: 32000,  statutCompte: 'actif' }],
  'e6f7a8b9': [{ id: 'acc8', account_number: '890-123-456-7891', typeCompte: 'terme',   soldeActuel: 100000, statutCompte: 'actif' }],
};

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

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DepositForm({
  members   = MOCK_MEMBERS,
  onSubmit,
  onCancel,
  isLoading = false,
}: DepositFormProps) {
const [submittedData, setSubmittedData] = useState<DepositFormValidated | null>(null);
  const [memberSearch,    setMemberSearch]    = useState('');
  const [memberOpen,      setMemberOpen]      = useState(false);
  const [selectedMember,  setSelectedMember]  = useState<MemberOption | null>(null);
  const [memberAccounts,  setMemberAccounts]  = useState<AccountOption[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);
  const [submitted,       setSubmitted]       = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
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
  const amount     = parseFloat(form.montantTransaction) || 0;

  // hold period : 3 jours pour chèque, 0 pour cash
  const hold = form.depositSubtype === 'check' ? 3 : 0;

  // vérification requise : chèque OU montant > 50 000
  const needsVerif = form.depositSubtype === 'check' || amount > 50000;

  // montant disponible immédiatement : 30% si chèque, 100% si cash
  const availImm   = hold > 0 ? Math.floor(amount * 0.3) : amount;

  // compte bloqué ?
  const isBlocked  =
    selectedAccount !== null &&
    selectedAccount.statutCompte !== 'actif';

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const filteredMembers = useMemo(() =>
    members.filter(m =>
      m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.id_number.includes(memberSearch)
    ), [members, memberSearch]);

  const handleMemberSelect = (m: MemberOption) => {
    setSelectedMember(m);
    setMemberOpen(false);
    setMemberSearch('');
    setSelectedAccount(null);
    setForm(f => ({ ...f, idCompte: '' }));
    setMemberAccounts(MOCK_ACCOUNTS[m.id] ?? []);
  };

  const handleAccountSelect = (acc: AccountOption) => {
    if (acc.statutCompte !== 'actif') return;
    setSelectedAccount(acc);
    setForm(f => ({ ...f, idCompte: acc.account_number }));
    setErrors(e => ({ ...e, idCompte: '' }));
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setSelectedAccount(null);
    setMemberAccounts([]);
    setForm(f => ({ ...f, idCompte: '' }));
  };
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    console.log("🟢 Form complète :", form);

      console.log("🟢 Valeurs importantes :", {
        membre: selectedMember,
        compte: selectedAccount,
        montant: form.montantTransaction,
        mode: form.depositSubtype,
        source: form.source,
        description: form.description,
      });
    console.log("📤 Données brutes du formulaire :", form);

    const payload = {
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

      // // Système
      // holdPeriod:           hold,
      // requiresVerification: needsVerif,
      // availableImmediately: availImm,
    };

    console.log("📦 Payload avant validation :", payload);

    const result = depositSchema.safeParse(payload);

    if (!result.success) {
      console.log("❌ Erreurs de validation :", result.error.format());

      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = String(err.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    console.log("✅ Données validées envoyées au backend :", result.data);

    setErrors({});
    setSubmitting(true);

    try {
      const response = await onSubmit(result.data);
      console.log("📥 Réponse backend :", response);
      try {
      const response = await onSubmit(result.data);
      console.log("📥 Réponse backend :", response);
      setSubmittedData(result.data);  // 👈 AJOUTE CETTE LIGNE
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
      setSubmitted(true);
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
setSubmittedData(null)
    setSelectedMember(null);
    setSelectedAccount(null);
    setMemberAccounts([]);
    setErrors({});
  };

  // ── Écran succès ────────────────────────────────────────────────────────────
  // if (submitted) {
  //   return (
  //     <div className="flex flex-col items-center justify-center py-16 gap-4">
  //       <div className="w-16 h-16 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
  //         <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
  //       </div>
  //       <p className="text-lg font-bold text-gray-900">Dépôt enregistré</p>
  //       <p className="text-sm text-gray-500">La transaction a été créée avec succès.</p>
  //       <button onClick={handleReset}
  //         className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
  //         <RefreshCw className="w-4 h-4" /> Nouveau dépôt
  //       </button>
  //     </div>
  //   );
  // }
  if (submitted && submittedData) {
    return (
      <DepositReceipt
        data={submittedData}
        memberName={selectedMember?.full_name}
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
                  {selectedMember?.full_name ?? 'Rechercher un membre…'}
                </span>
                {selectedMember
                  ? <button type="button" onClick={e => { e.stopPropagation(); handleClearMember(); }}
                      className="p-0.5 rounded-md hover:bg-[#c8e0bc] text-gray-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
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
                              <span className="text-xs font-bold text-[#2E7D32]">{m.full_name[0]}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{m.full_name}</p>
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
              disabled={!selectedMember} value={form.idCompte}
              onChange={e => {
                setForm(f => ({ ...f, idCompte: e.target.value }));
                const match = memberAccounts.find(a => a.account_number === e.target.value);
                setSelectedAccount(match ?? null);
              }} />
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

          <Field label="Code d'autorisation" required error={errors.codeAutorisation}
            hint="Fourni par le superviseur ou le chef de caisse — saisie manuelle obligatoire.">
            <div className="relative">
              <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input placeholder="Code remis par le superviseur" hasError={!!errors.codeAutorisation}
                className="pl-9 font-mono"
                value={form.codeAutorisation} onChange={set('codeAutorisation')} />
            </div>
          </Field>

        </div>

        <Field label="Mode de dépôt" required error={errors.depositSubtype}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

      {/* ── 3. Détails ── */}
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
          {/* Champs spécifiques au chèque */}
          {form.depositSubtype === 'check' && (
            <>
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
            </>
          )}


        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Annuler
        </button>
        <button type="submit" disabled={submitting || isLoading || isBlocked}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting || isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
            : <><ArrowDownCircle className="w-4 h-4" /> Enregistrer le dépôt</>
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