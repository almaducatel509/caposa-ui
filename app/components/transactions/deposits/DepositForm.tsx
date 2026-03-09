'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, X, ChevronDown, ArrowDownCircle,
  Banknote, FileCheck, ArrowLeftRight, MoreHorizontal,
  User, CreditCard, Hash, FileText, Clock, ShieldCheck,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw,
} from 'lucide-react';
import { depositSchema, DepositSubtype, type DepositFormValidated } from '../validation/deposit';

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
  transfer: { icon: ArrowLeftRight, label: 'Virement', desc: 'Virement interne/externe', hold: 0 },
  other:    { icon: MoreHorizontal, label: 'Autre',    desc: 'Autre mode de dépôt',     hold: 1 },
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

  const [memberSearch,    setMemberSearch]    = useState('');
  const [memberOpen,      setMemberOpen]      = useState(false);
  const [selectedMember,  setSelectedMember]  = useState<MemberOption | null>(null);
  const [memberAccounts,  setMemberAccounts]  = useState<AccountOption[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);
  const [submitted,       setSubmitted]       = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    idCompte:           '',
    codeAutorisation:   '',
    montantTransaction: '',
    depositSubtype:     'cash' as DepositSubtype,
    source:             '',
    description:        '',
    transferReference:  '',
    senderName:         '',
  });

  // Calculs automatiques
  const amount     = parseFloat(form.montantTransaction) || 0;
  const hold       = form.depositSubtype === 'check' ? 3 : form.depositSubtype === 'other' ? 1 : 0;
  const needsVerif = form.depositSubtype === 'check' || amount > 50000;
  const availImm   = hold > 0 ? Math.floor(amount * 0.3) : amount;
  const isBlocked  = selectedAccount !== null && selectedAccount.statutCompte !== 'actif';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      idCompte:             form.idCompte,
      typeTransaction:      'DEPOSIT' as const,
      codeAutorisation:     form.codeAutorisation,
      montantTransaction:   amount,
      depositSubtype:       form.depositSubtype,
      source:               form.source,
      description:          form.description || null,
      transferReference:    form.transferReference || null,
      senderName:           form.senderName || null,
      holdPeriod:           hold,
      requiresVerification: needsVerif,
      availableImmediately: availImm,
    };

    const result = depositSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err: import('zod').ZodIssue) => {
        const key = String(err.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(result.data);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({ idCompte: '', codeAutorisation: '', montantTransaction: '',
      depositSubtype: 'cash', source: '', description: '', transferReference: '', senderName: '' });
    setSelectedMember(null);
    setSelectedAccount(null);
    setMemberAccounts([]);
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
        </div>
        <p className="text-lg font-bold text-gray-900">Dépôt enregistré</p>
        <p className="text-sm text-gray-500">La transaction a été créée avec succès.</p>
        <button onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-all">
          <RefreshCw className="w-4 h-4" /> Nouveau dépôt
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* ── 1. Membre + Compte ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={1} title="Membre et compte cible" icon={User} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={3} title="Détails" icon={FileText} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Source" required error={errors.source}>
            <Input placeholder="Ex: Salaire, Remboursement, Vente…"
              hasError={!!errors.source} value={form.source} onChange={set('source')} />
          </Field>
          <Field label="Description">
            <Input placeholder="Notes optionnelles…" value={form.description} onChange={set('description')} />
          </Field>
          {form.depositSubtype === 'transfer' && (
            <>
              <Field label="Référence du virement" hint="N° de référence de la transaction source">
                <div className="relative">
                  <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input placeholder="REF-XXXXXX" className="pl-9 font-mono"
                    value={form.transferReference} onChange={set('transferReference')} />
                </div>
              </Field>
              <Field label="Nom de l'émetteur">
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input placeholder="Personne ou institution source" className="pl-9"
                    value={form.senderName} onChange={set('senderName')} />
                </div>
              </Field>
            </>
          )}
        </div>
      </div>

      {/* ── 4. Récapitulatif ── */}
      {amount > 0 && (
        <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
          <SectionHeader step={4} title="Récapitulatif" icon={ShieldCheck} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Disponible immédiatement</p>
              <p className="text-base font-bold text-[#2E7D32]">{formatHTG(availImm)}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${hold > 0 ? 'bg-yellow-50 border-yellow-100' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className={`w-3.5 h-3.5 ${hold > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                <p className="text-xs text-gray-400">Délai de compensation</p>
              </div>
              <p className={`text-base font-bold ${hold > 0 ? 'text-yellow-700' : 'text-gray-500'}`}>
                {hold > 0 ? `${hold} jour${hold > 1 ? 's' : ''}` : 'Immédiat'}
              </p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${needsVerif ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck className={`w-3.5 h-3.5 ${needsVerif ? 'text-[#355C7D]' : 'text-gray-400'}`} />
                <p className="text-xs text-gray-400">Vérification</p>
              </div>
              <p className={`text-sm font-semibold ${needsVerif ? 'text-[#355C7D]' : 'text-gray-500'}`}>
                {needsVerif ? 'Requise' : 'Non requise'}
              </p>
            </div>
          </div>
          {amount > 50000 && (
            <div className="flex items-start gap-2 mt-3 px-3 py-2.5 bg-yellow-50 border border-yellow-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 font-medium">
                Montant &gt; 50 000 HTG — validation superviseur requise.
              </p>
            </div>
          )}
          {isBlocked && (
            <div className="flex items-start gap-2 mt-3 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium">
                Ce compte est suspendu — les dépôts ne sont pas autorisés.
              </p>
            </div>
          )}
        </div>
      )}

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
    </form>
  );
}