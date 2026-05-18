"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  LoanType, LoanPurpose, CollateralType, RepaymentFrequency,
  LoanFormErrors,
  LoanFormData,
  validateLoanWithZod,
} from "../transactions/validation/loanSchema";
import {
  calculateEffectiveRate,
  calculateMonthlyPayment,
  calculateTotalInterest,
} from "../transactions/validation/loanCalculations";
import { validateLoanForm } from "../transactions/validation/loanLogic";

import {
  Landmark, ArrowLeft, User, Hash, FileText, ShieldCheck,
  CheckCircle2, AlertTriangle, Loader2, Search, X,
  ChevronDown, Calendar, Percent, Banknote, Package,
  Leaf, Home, GraduationCap, Wrench, Zap, RefreshCw,
} from 'lucide-react';
import MemberPicker from "../members/MemberPicker";

// ─── Local types ──────────────────────────────────────────────────────────────
interface MemberOption {
  id:            string;
  full_name:     string;
  id_number:     string;
  phone_number?: string;
}

interface AccountOption {
  id:             string;
  account_number: string;
  account_type:   'epargne' | 'cheques' | 'terme';
  balance:        number;
  account_status: 'actif' | 'suspendu' | 'ferme';
}

export interface LoanFormProps {
  members?:   MemberOption[];
  onSubmit?:  (data: LoanFormData) => Promise<void>;
  onCancel?:  () => void;
  isLoading?: boolean;
}

// ─── Display config ───────────────────────────────────────────────────────────
const LOAN_TYPE_CFG: Record<LoanType, { icon: React.ElementType; label: string; desc: string }> = {
  commerce:    { icon: Package,        label: 'Commerce',      desc: 'Fonds de roulement, stock'   },
  logement:    { icon: Home,           label: 'Logement',      desc: 'Construction ou réparation'  },
  agriculture: { icon: Leaf,           label: 'Agriculture',   desc: 'Plantation, intrants'        },
  elevage:     { icon: Zap,            label: 'Élevage',       desc: 'Bétail, équipement animal'   },
  equipement:  { icon: Wrench,         label: 'Équipement',    desc: 'Outils, machines'            },
  scolaire:    { icon: GraduationCap,  label: 'Scolaire',      desc: 'Frais de scolarité'          },
  personnel:   { icon: User,           label: 'Personnel',     desc: 'Urgence, dépenses courantes' },
};

const PURPOSE_LABELS: Record<LoanPurpose, string> = {
  achat_marchandises: 'Achat de marchandises',
  fonds_roulement:    'Fonds de roulement',
  construction:       'Construction',
  reparation_maison:  'Réparation maison',
  plantation:         'Plantation',
  elevage:            'Élevage',
  scolarite:          'Scolarité',
  urgence:            'Urgence',
  equipement:         'Équipement',
};

const COLLATERAL_LABELS: Record<CollateralType, string> = {
  epargne_bloquee:   'Épargne bloquée',
  caution_solidaire: 'Caution solidaire',
  betail:            'Bétail',
  terrain:           'Terrain',
  materiel:          'Matériel',
  aucune:            'Aucune garantie',
};

const FREQ_LABELS: Record<RepaymentFrequency, string> = {
  mensuel:      'Mensuel',
  hebdomadaire: 'Hebdomadaire',
  saisonnier:   'Saisonnier',
};

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  epargne: { label: 'Épargne', bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]'  },
  cheques: { label: 'Chèques', bg: 'bg-blue-50',   text: 'text-[#355C7D]'  },
  terme:   { label: 'Terme',   bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_MEMBERS: MemberOption[] = [
  { id: 'dcb21971', full_name: 'Hudson Joseph',       id_number: '555555', phone_number: '1248666' },
  { id: 'a1b2c3d4', full_name: 'Marie Dupont',        id_number: '987654', phone_number: '3456789' },
  { id: 'b3c4d5e6', full_name: 'Jean-Pierre Antoine', id_number: '112233', phone_number: '4567890' },
  { id: 'c4d5e6f7', full_name: 'Roseline Pierre',     id_number: '334455', phone_number: '5678901' },
  { id: 'd5e6f7a8', full_name: 'Claudette Moreau',    id_number: '556677', phone_number: '6789012' },
  { id: 'e6f7a8b9', full_name: 'Réginald Beaumont',   id_number: '778899', phone_number: '7890123' },
  { id: 'f7a8b9c0', full_name: 'Nadège Thermidor',    id_number: '990011', phone_number: '8901234' },
  { id: 'a8b9c0d1', full_name: 'Wilgens Désir',       id_number: '223344', phone_number: '9012345' },
];

const MOCK_ACCOUNTS: Record<string, AccountOption[]> = {
  dcb21971: [
    { id: 'acc-001', account_number: 'ACC1001', account_type: 'epargne', balance: 45000, account_status: 'actif' },
    { id: 'acc-002', account_number: 'ACC1002', account_type: 'terme',   balance: 12000, account_status: 'actif' },
  ],
  a1b2c3d4: [
    { id: 'acc-003', account_number: 'ACC1003', account_type: 'epargne', balance: 78000, account_status: 'actif' },
  ],
  b3c4d5e6: [
    { id: 'acc-004', account_number: 'ACC1004', account_type: 'epargne', balance: 15000, account_status: 'actif'    },
    { id: 'acc-005', account_number: 'ACC1005', account_type: 'terme',   balance: 60000, account_status: 'suspendu' },
  ],
};

function getMockAccounts(memberId: string): AccountOption[] {
  return MOCK_ACCOUNTS[memberId] ?? [
    {
      id: `acc-${memberId}-1`,
      account_number: `ACC${Math.floor(Math.random() * 9000) + 1000}`,
      account_type: 'epargne',
      balance: Math.floor(Math.random() * 50000) + 5000,
      account_status: 'actif',
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function addMonths(date: string, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

// ─── Internal components ──────────────────────────────────────────────────────
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

function RecapSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] mb-2">{title}</p>
      <div className="bg-[#F9F9F6] rounded-xl border border-gray-100 p-3 space-y-1.5">
        {children}
      </div>
    </div>
  );
}

function RecapRow({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs text-right ${highlight ? 'font-bold text-[#1B5E20] text-sm' : 'font-semibold text-gray-700'}`}>
        {value || '—'}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoanForm({ members: propMembers, onSubmit, onCancel, isLoading }: LoanFormProps) {
  // const members = propMembers ?? MOCK_MEMBERS;

  // ── Member state ──
  const [memberSearch,   setMemberSearch]   = useState('');
  const [memberOpen,     setMemberOpen]     = useState(false);
  // State simplifié
  const [members,        setMembers]        = useState<MemberOption[]>(propMembers ?? MOCK_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);

  // ── Account state ──
  const [accounts,        setAccounts]        = useState<AccountOption[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);

  // ── Form state ──
  const [form, setForm] = useState<LoanFormData>({
    interest_rate:       1.5,
    repayment_frequency: 'mensuel',
  });
  const [errors,     setErrors]     = useState<LoanFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [showRecap,  setShowRecap]  = useState(false);

  // ── Member filtering ──
  const filteredMembers = useMemo(() =>
    memberSearch.trim().length === 0
      ? members
      : members.filter(m =>
          m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
          m.id_number.includes(memberSearch)
        ),
    [members, memberSearch]
  );

  // ── Member selection ──
  // const handleSelectMember = (m: MemberOption) => {
  //   setSelectedMember(m);
  //   setMemberOpen(false);
  //   setMemberSearch('');
  //   setSelectedAccount(null);
  //   setForm(f => ({ ...f, id_member: m.id }));
  //   // Load accounts
  //   setAccountsLoading(true);
  //   setTimeout(() => {
  //     setAccounts(getMockAccounts(m.id));
  //     setAccountsLoading(false);
  //   }, 400);
  // };
  const handleSelectMember = (m: MemberOption | null) => {
    setSelectedMember(m);
    setSelectedAccount(null);

    if (!m) {
      setAccounts([]);
      setForm(f => ({ ...f, id_member: undefined }));
      return;
    }

    setForm(f => ({ ...f, id_member: m.id }));
    setAccountsLoading(true);
    setTimeout(() => {
      setAccounts(getMockAccounts(m.id));
      setAccountsLoading(false);
    }, 400);
  };
  // When wired to API:
  // const handleSelectMember = async (m: MemberOption) => {
  //   setAccountsLoading(true);
  //   try {
  //     const apiAccounts = await fetchMemberAccounts(m.id);
  //     // Django already returns english keys (account_type, balance, account_status)
  //     // → no mapping needed, just setAccounts(apiAccounts)
  //     setAccounts(apiAccounts);
  //   } finally {
  //     setAccountsLoading(false);
  //   }
  // };

  const clearMember = () => {
    setSelectedMember(null);
    setSelectedAccount(null);
    setAccounts([]);
    setForm(f => ({ ...f, id_member: undefined }));
  };

  // ── Financial calculations ──
  const monthly = useMemo(() => {
    if (!form.amount || !form.interest_rate || !form.duration_months) return 0;
    return calculateMonthlyPayment(form.amount, form.interest_rate, form.duration_months);
  }, [form.amount, form.interest_rate, form.duration_months]);

  const totalInterest = useMemo(() => {
    if (!form.duration_months) return 0;
    return calculateTotalInterest(monthly, form.duration_months, form.amount ?? 0);
  }, [monthly, form.duration_months, form.amount]);

  const effectiveRate = useMemo(() => {
    if (!form.interest_rate || !form.amount) return form.interest_rate ?? 0;
    return calculateEffectiveRate(form.interest_rate, form.fees ?? 0, form.amount);
  }, [form.interest_rate, form.fees, form.amount]);

  const endDate = useMemo(() => {
    if (!form.start_date || !form.duration_months) return '';
    return addMonths(form.start_date, form.duration_months);
  }, [form.start_date, form.duration_months]);

  const handleOpenRecap = () => {
    // Validate first, only open recap if everything's OK
    const business = validateLoanForm(form);
    const zod      = validateLoanWithZod(form);
    const combined = { ...zod.errors, ...business.errors };

    if (!business.isValid || !zod.isValid) {
      setErrors(combined);
      return;
    }

    setErrors({});
    setShowRecap(true);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        
      };

      // ─── Log submission payload ───
      console.group('📤 Loan request submission');
      console.log('Member:', selectedMember);
      console.log('Selected account:', selectedAccount);
      console.log('Payload:', payload);
      console.table(payload);
      console.groupEnd();

      await onSubmit?.(payload);
      setShowRecap(false);
      setSubmitted(true);
    } catch {
      setErrors({ comment: 'Erreur lors de la soumission. Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ──
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-14 h-14 rounded-full bg-[#DDEAD5] flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-[#2E7D32]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-800">Demande de prêt enregistrée</p>
          <p className="text-xs text-gray-500 mt-1">La demande est en attente de validation.</p>
        </div>
        <button onClick={onCancel}
          className="mt-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold">
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Intro banner ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#DDEAD5]/40 border border-[#DDEAD5]">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-[#2E7D32]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1B5E20]">Avant de commencer</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            Une saisie précise aide l'agent de crédit à analyser le dossier et à éviter les retours inutiles.
          </p>
        </div>
      </div>

      {/* ── 1. MEMBER ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={User} label="Membre" />

       <MemberPicker
          members={members}
          selectedMember={selectedMember}
          onSelect={handleSelectMember}
          isRequired
          errorMessage={errors.id_member}
          label="Rechercher un membre"
        />
        {/* Linked account */}
        {selectedMember && (
          <div className="mt-4">
            <Label>Compte associé <span className="text-gray-400 normal-case font-normal">(optionnel — pour lien de traçabilité)</span></Label>
            {accountsLoading ? (
              <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement des comptes…
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Aucun compte trouvé.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {accounts.map(acc => {
                  const badge = TYPE_BADGE[acc.account_type];
                  const isInactive = acc.account_status !== 'actif';
                  const isSelected = selectedAccount?.id === acc.id;
                  return (
                    <button key={acc.id}
                      onClick={() => !isInactive && setSelectedAccount(isSelected ? null : acc)}
                      disabled={isInactive}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#2E7D32] bg-[#DDEAD5]/40 shadow-sm'
                          : isInactive
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-100 bg-[#F9F9F6] hover:border-[#81C784] hover:bg-[#DDEAD5]/20'
                      }`}>
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{acc.account_number}</p>
                          <p className="text-xs text-gray-500">{formatHTG(acc.balance)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        {isInactive && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{acc.account_status}</span>}
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2. LOAN TYPE ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Landmark} label="Type de prêt" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(Object.entries(LOAN_TYPE_CFG) as [LoanType, typeof LOAN_TYPE_CFG[LoanType]][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const selected = form.loan_type === key;
            return (
              <button key={key}
                onClick={() => setForm(f => ({ ...f, loan_type: key }))}
                className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all ${
                  selected
                    ? 'border-[#2E7D32] bg-[#DDEAD5]/40 shadow-sm'
                    : 'border-gray-100 bg-[#F9F9F6] hover:border-[#81C784] hover:bg-[#DDEAD5]/20'
                }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selected ? 'bg-[#2E7D32]/15' : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${selected ? 'text-[#2E7D32]' : 'text-gray-500'}`} />
                </div>
                <p className={`text-xs font-bold ${selected ? 'text-[#1B5E20]' : 'text-gray-700'}`}>{cfg.label}</p>
                <p className="text-xs text-gray-400 leading-tight">{cfg.desc}</p>
              </button>
            );
          })}
        </div>
        <FieldError msg={errors.loan_type} />
      </div>

      {/* ── 3. AMOUNT & DURATION ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Banknote} label="Montant & conditions" color="#355C7D" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <Label>Montant demandé (HTG)</Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#355C7D]" />
              <input type="number" min={0}
                value={form.amount ?? ''}
                onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || undefined }))}
                placeholder="0"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm font-semibold text-[#355C7D] focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D]"
              />
            </div>
            <FieldError msg={errors.amount} />
          </div>

          {/* Duration */}
          <div>
            <Label>Durée (mois)</Label>
            <input type="number" min={1} max={360}
              value={form.duration_months ?? ''}
              onChange={e => setForm(f => ({ ...f, duration_months: parseInt(e.target.value) || undefined }))}
              placeholder="12"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
            />
            <FieldError msg={errors.duration_months} />
          </div>

          {/* Interest rate */}
          <div>
            <Label>Taux d'intérêt annuel (%)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" min={0} max={100} step={0.5}
                value={form.interest_rate ?? ''}
                onChange={e => setForm(f => ({ ...f, interest_rate: parseFloat(e.target.value) || undefined }))}
                placeholder="18"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
              />
            </div>
            <FieldError msg={errors.interest_rate} />
          </div>

          {/* Fees */}
          <div>
            <Label>Frais de dossier (HTG) <span className="text-gray-400 normal-case font-normal">optionnel</span></Label>
            <input type="number" min={0}
              value={form.fees ?? ''}
              onChange={e => setForm(f => ({ ...f, fees: parseFloat(e.target.value) || undefined }))}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
            />
          </div>

          {/* Repayment frequency */}
          <div className="md:col-span-2">
            <Label>Fréquence de remboursement</Label>
            <div className="flex gap-2">
              {(['mensuel', 'hebdomadaire', 'saisonnier'] as RepaymentFrequency[]).map(freq => (
                <button key={freq}
                  onClick={() => setForm(f => ({ ...f, repayment_frequency: freq }))}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.repayment_frequency === freq
                      ? 'border-[#2E7D32] bg-[#DDEAD5]/40 text-[#1B5E20] font-semibold'
                      : 'border-gray-200 bg-[#F9F9F6] text-gray-600 hover:border-[#81C784]'
                  }`}>
                  {FREQ_LABELS[freq]}
                </button>
              ))}
            </div>
            <FieldError msg={errors.repayment_frequency} />
          </div>
        </div>

        {/* Financial simulation */}
        {monthly > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-[#355C7D]/6 border border-[#355C7D]/15">
            <p className="text-xs font-bold uppercase tracking-widest text-[#355C7D] mb-3">Simulation</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-[#355C7D]">{formatHTG(Math.round(monthly))}</p>
                <p className="text-xs text-gray-500 mt-0.5">Mensualité</p>
              </div>
              <div className="text-center border-x border-[#355C7D]/15">
                <p className="text-lg font-bold text-gray-700">{formatHTG(Math.round(totalInterest))}</p>
                <p className="text-xs text-gray-500 mt-0.5">Intérêts totaux</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-700">{effectiveRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Taux effectif</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. DATES (read-only — defined by backend / workflow) ──────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Calendar} label="Dates" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Request date — set automatically by the backend */}
          <div>
            <Label>Date de demande</Label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            <p className="text-xs text-gray-400 mt-1">Enregistrée automatiquement à la soumission</p>
          </div>

          {/* End date — computed after disbursement */}
          <div>
            <Label>Date de fin estimée</Label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400">
              <Calendar className="w-4 h-4 text-gray-300" />
              Calculée après décaissement
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Basée sur la durée ({form.duration_months ?? '—'} mois) + date de décaissement
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. PURPOSE & COLLATERAL ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={FileText} label="But & garantie" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Purpose */}
          <div>
            <Label>But du prêt</Label>
            <div className="relative">
              <select
                value={form.purpose ?? ''}
                onChange={e => setForm(f => ({ ...f, purpose: e.target.value as LoanPurpose }))}
                className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]">
                <option value="">— Sélectionner —</option>
                {Object.entries(PURPOSE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <FieldError msg={errors.purpose} />
          </div>

          {/* Collateral */}
          <div>
            <Label>Garantie</Label>
            <div className="relative">
              <select
                value={form.collateral ?? ''}
                onChange={e => setForm(f => ({ ...f, collateral: e.target.value as CollateralType }))}
                className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]">
                <option value="">— Sélectionner —</option>
                {Object.entries(COLLATERAL_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <FieldError msg={errors.collateral} />
          </div>
        </div>

        {/* Comment */}
        <div className="mt-4">
          <Label>Commentaire <span className="text-gray-400 normal-case font-normal">optionnel</span></Label>
          <textarea
            value={form.comment ?? ''}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            rows={3}
            maxLength={500}
            placeholder="Observations, contexte, informations complémentaires…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
          />
          <div className="flex justify-between mt-1">
            <FieldError msg={errors.comment} />
            <p className="text-xs text-gray-400 ml-auto">{(form.comment ?? '').length}/500</p>
          </div>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 pb-2">
        {onCancel && (
          <button onClick={onCancel} disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <ArrowLeft className="w-4 h-4" /> Annuler
          </button>
        )}
        <button onClick={handleOpenRecap} disabled={submitting || isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r
           from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md
           hover:shadow-lg transition-all disabled:opacity-60 ml-auto">
          {submitting || isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
            : <><Landmark className="w-4 h-4" /> Soumettre la demande</>
          }
        </button>
      </div>

      {showRecap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#DDEAD5]/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Vérification avant soumission</p>
                  <p className="text-xs text-gray-500 mt-0.5">Récapitulatif de la demande</p>
                </div>
              </div>
              <button onClick={() => setShowRecap(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body — data recap */}
            <div className="px-5 py-4 overflow-y-auto space-y-4">

              {/* Warning */}
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Des données exactes facilitent l'étude du crédit. Merci de vérifier avant de soumettre.
                </p>
              </div>

              {/* Member */}
              <RecapSection title="Membre">
                <RecapRow label="Nom" value={selectedMember?.full_name} />
                <RecapRow label="ID"  value={selectedMember?.id_number} />
                {selectedAccount && (
                  <RecapRow label="Compte" value={`${selectedAccount.account_number} · ${formatHTG(selectedAccount.balance)}`} />
                )}
              </RecapSection>

              {/* Loan */}
              <RecapSection title="Prêt demandé">
                <RecapRow label="Type"      value={form.loan_type ? LOAN_TYPE_CFG[form.loan_type].label : '—'} />
                <RecapRow label="Montant"   value={form.amount ? formatHTG(form.amount) : '—'} highlight />
                <RecapRow label="Durée"     value={form.duration_months ? `${form.duration_months} mois` : '—'} />
                <RecapRow label="Taux"      value={form.interest_rate ? `${form.interest_rate}% / an` : '—'} />
                <RecapRow label="Fréquence" value={form.repayment_frequency ? FREQ_LABELS[form.repayment_frequency] : '—'} />
                {form.fees && <RecapRow label="Frais de dossier" value={formatHTG(form.fees)} />}
              </RecapSection>

              {/* Simulation */}
              <RecapSection title="Simulation">
                <RecapRow label="Mensualité"      value={formatHTG(Math.round(monthly))} highlight />
                <RecapRow label="Intérêts totaux" value={formatHTG(Math.round(totalInterest))} />
                <RecapRow label="Taux effectif"   value={`${effectiveRate.toFixed(2)}%`} />
              </RecapSection>

              {/* Dates */}
              <RecapSection title="Dates">
                <RecapRow label="Demande" value={form.created_at ? new Date(form.created_at).toLocaleDateString('fr-FR') : '—'} />
                {form.start_date && (
                  <RecapRow label="Début" value={new Date(form.start_date).toLocaleDateString('fr-FR')} />
                )}
                {endDate && (
                  <RecapRow label="Fin estimée" value={new Date(endDate).toLocaleDateString('fr-FR')} />
                )}
              </RecapSection>

              {/* Purpose & collateral */}
              <RecapSection title="But & garantie">
                <RecapRow label="But"      value={form.purpose    ? PURPOSE_LABELS[form.purpose]       : '—'} />
                <RecapRow label="Garantie" value={form.collateral ? COLLATERAL_LABELS[form.collateral] : '—'} />
                {form.comment && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 mb-1">Commentaire</p>
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-2.5">
                      {form.comment}
                    </p>
                  </div>
                )}
              </RecapSection>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowRecap(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                <ArrowLeft className="w-3.5 h-3.5" />
                Modifier
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                {submitting
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi en cours…</>
                  : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirmer et soumettre</>
                }
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}