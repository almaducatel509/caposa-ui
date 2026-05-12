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




// ─── Types locaux ─────────────────────────────────────────────────────────────
interface MemberOption {
  id:            string;
  full_name:     string;
  id_number:     string;
  phone_number?: string;
}
interface AccountOption {
  id: string;
  account_number: string;
  typeCompte: 'epargne' | 'cheques' | 'terme';
  soldeActuel: number;
  statutCompte: 'actif' | 'suspendu' | 'fermé';
}
export interface LoanFormProps {
  members?:   MemberOption[];
  onSubmit?:  (data: LoanFormData) => Promise<void>;
  onCancel?:  () => void;
  isLoading?: boolean;
}

// ─── Config affichage ─────────────────────────────────────────────────────────
const LOAN_TYPE_CFG: Record<LoanType, { icon: React.ElementType; label: string; desc: string }> = {
  commerce:    { icon: Package,        label: 'Commerce',      desc: 'Fonds de roulement, stock'      },
  logement:    { icon: Home,           label: 'Logement',      desc: 'Construction ou réparation'      },
  agriculture: { icon: Leaf,           label: 'Agriculture',   desc: 'Plantation, intrants'            },
  elevage:     { icon: Zap,            label: 'Élevage',       desc: 'Bétail, équipement animal'       },
  equipement:  { icon: Wrench,         label: 'Équipement',    desc: 'Outils, machines'                },
  scolaire:    { icon: GraduationCap,  label: 'Scolaire',      desc: 'Frais de scolarité'              },
  personnel:   { icon: User,           label: 'Personnel',     desc: 'Urgence, dépenses courantes'     },
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
  epargne_bloquee:  'Épargne bloquée',
  caution_solidaire:'Caution solidaire',
  betail:           'Bétail',
  terrain:          'Terrain',
  materiel:         'Matériel',
  aucune:           'Aucune garantie',
};

const FREQ_LABELS: Record<RepaymentFrequency, string> = {
  mensuel:     'Mensuel',
  hebdomadaire:'Hebdomadaire',
  saisonnier:  'Saisonnier',
};

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  epargne: { label: 'Épargne',  bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]'  },
  cheques: { label: 'Chèques', bg: 'bg-blue-50',    text: 'text-[#355C7D]'  },
  terme:   { label: 'Terme',   bg: 'bg-yellow-50',  text: 'text-yellow-700' },
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
    { id: 'acc-001', account_number: 'ACC1001', typeCompte: 'epargne', soldeActuel: 45000, statutCompte: 'actif' }, 
    { id: 'acc-002', account_number: 'ACC1002', typeCompte: 'terme',   soldeActuel: 12000, statutCompte: 'actif' },                                                                                
  ],
  a1b2c3d4: [
    { id: 'acc-003', account_number: 'ACC1003', typeCompte: 'epargne', soldeActuel: 78000, statutCompte: 'actif'    },
  ],
  b3c4d5e6: [
    { id: 'acc-004', account_number: 'ACC1004', typeCompte: 'epargne', soldeActuel: 15000, statutCompte: 'actif'    },
    { id: 'acc-005', account_number: 'ACC1005', typeCompte: 'terme',   soldeActuel: 60000, statutCompte: 'suspendu' },
  ],
};

function getMockAccounts(memberId: string): AccountOption[] {
  return MOCK_ACCOUNTS[memberId] ?? [
    { id: `acc-${memberId}-1`, account_number: `ACC${Math.floor(Math.random() * 9000) + 1000}`, typeCompte: 'epargne', soldeActuel: Math.floor(Math.random() * 50000) + 5000, statutCompte: 'actif' },
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

// ─── Composants internes ──────────────────────────────────────────────────────
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

// ─── Composant principal ──────────────────────────────────────────────────────
export default function LoanForm({ members: propMembers, onSubmit, onCancel, isLoading }: LoanFormProps) {
  const members = propMembers ?? MOCK_MEMBERS;

  // ── State membre ──
  const [memberSearch,  setMemberSearch]  = useState('');
  const [memberOpen,    setMemberOpen]    = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);

  // ── State compte ──
  const [accounts,        setAccounts]        = useState<AccountOption[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);

  // ── State formulaire ──
  const [form, setForm] = useState<LoanFormData>({
    dateDemande:            today(),
    tauxInteret:            18,
    frequenceRemboursement: 'mensuel',
  });
  const [errors,     setErrors]     = useState<LoanFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  // ── Filtrage membres ──
  const filteredMembers = useMemo(() =>
    memberSearch.trim().length === 0
      ? members
      : members.filter(m =>
          m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
          m.id_number.includes(memberSearch)
        ),
    [members, memberSearch]
  );

  // ── Sélection membre ──
  const handleSelectMember = (m: MemberOption) => {
    setSelectedMember(m);
    setMemberOpen(false);
    setMemberSearch('');
    setSelectedAccount(null);
    setForm(f => ({ ...f, id_member: m.id }));
    // Charger les comptes
    setAccountsLoading(true);
    setTimeout(() => {
      setAccounts(getMockAccounts(m.id));
      setAccountsLoading(false);
    }, 400);
  };
//   const handleSelectMember = async (m: MemberOption) => {
//   // ...
//   setAccountsLoading(true);
  
//   try {
//     const apiAccounts = await fetchMemberAccounts(m.id); 
//     // apiAccounts en format anglais : { account_type, balance, account_status }
    
//     // Mapping vers le format français local
//     const mapped: AccountOption[] = apiAccounts.map(acc => ({
//       id: acc.id,
//       account_number: acc.account_number,
//       typeCompte: mapAccountType(acc.account_type),       // 'savings' → 'epargne'
//       soldeActuel: typeof acc.balance === 'string' ? parseFloat(acc.balance) : acc.balance ?? 0,
//       statutCompte: acc.account_status ? 'actif' : 'ferme',
//     }));
    
//     setAccounts(mapped);
//   } finally {
//     setAccountsLoading(false);
//   }
// };

function mapAccountType(apiType: string): AccountOption['typeCompte'] {
  switch (apiType) {
    case 'savings':  return 'epargne';
    case 'checking': return 'cheques';
    case 'term':     return 'terme';
    default:         return 'epargne';
  }
}

  const clearMember = () => {
    setSelectedMember(null);
    setSelectedAccount(null);
    setAccounts([]);
    setForm(f => ({ ...f, id_member: undefined }));
  };

  // ── Calculs financiers ──
  const monthly = useMemo(() => {
    if (!form.montantDemande || !form.tauxInteret || !form.dureeMois) return 0;
    return calculateMonthlyPayment(form.montantDemande, form.tauxInteret, form.dureeMois);
  }, [form.montantDemande, form.tauxInteret, form.dureeMois]);

  const totalInterest = useMemo(() => {
    if (!form.dureeMois) return 0;
    return calculateTotalInterest(monthly, form.dureeMois, form.montantDemande ?? 0);
  }, [monthly, form.dureeMois, form.montantDemande]);

  const effectiveRate = useMemo(() => {
    if (!form.tauxInteret || !form.montantDemande) return form.tauxInteret ?? 0;
    return calculateEffectiveRate(form.tauxInteret, form.frais ?? 0, form.montantDemande);
  }, [form.tauxInteret, form.frais, form.montantDemande]);

  const dateFin = useMemo(() => {
    if (!form.dateDebut || !form.dureeMois) return '';
    return addMonths(form.dateDebut, form.dureeMois);
  }, [form.dateDebut, form.dureeMois]);

  // ── Submit ──
  const handleSubmit = async () => {
    const business = validateLoanForm(form);
    const zod      = validateLoanWithZod(form);
    const combined = { ...zod.errors, ...business.errors };
    if (!business.isValid || !zod.isValid) {
      setErrors(combined);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit?.({ ...form, dateDebut: form.dateDebut, dateFin: dateFin || undefined });
      setSubmitted(true);
    } catch {
      setErrors({ commentaire: 'Erreur lors de la soumission. Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Succès ──
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

      {/* ── 1. MEMBRE ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={User} label="Membre" />

        {!selectedMember ? (
          <div className="relative">
            <Label>Rechercher un membre</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={memberSearch}
                onChange={e => { setMemberSearch(e.target.value); setMemberOpen(true); }}
                onFocus={() => setMemberOpen(true)}
                placeholder="Nom ou numéro de membre…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
              />
            </div>
            {memberOpen && filteredMembers.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                {filteredMembers.map(m => (
                  <button key={m.id} onMouseDown={() => handleSelectMember(m)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9F9F6] text-left border-b border-gray-50 last:border-0 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{m.full_name}</p>
                      <p className="text-xs text-gray-400">#{m.id_number}</p>
                    </div>
                    {m.phone_number && <p className="text-xs text-gray-400 shrink-0">{m.phone_number}</p>}
                  </button>
                ))}
              </div>
            )}
            <FieldError msg={errors.id_member} />
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-[#DDEAD5]/40 rounded-xl border border-[#DDEAD5]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{selectedMember.full_name}</p>
                <p className="text-xs text-gray-500">#{selectedMember.id_number}
                  {selectedMember.phone_number && ` · ${selectedMember.phone_number}`}
                </p>
              </div>
            </div>
            <button onClick={clearMember} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Compte associé */}
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
                  const badge = TYPE_BADGE[acc.typeCompte];
                  const isInactive = acc.statutCompte !== 'actif';
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
                          <p className="text-xs text-gray-500">{formatHTG(acc.soldeActuel)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        {isInactive && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{acc.statutCompte}</span>}
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

      {/* ── 2. TYPE DE PRÊT ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Landmark} label="Type de prêt" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(Object.entries(LOAN_TYPE_CFG) as [LoanType, typeof LOAN_TYPE_CFG[LoanType]][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const selected = form.typePret === key;
            return (
              <button key={key}
                onClick={() => setForm(f => ({ ...f, typePret: key }))}
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
        <FieldError msg={errors.typePret} />
      </div>

      {/* ── 3. MONTANT & DURÉE ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Banknote} label="Montant & conditions" color="#355C7D" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Montant */}
          <div>
            <Label>Montant demandé (HTG)</Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#355C7D]" />
              <input type="number" min={0}
                value={form.montantDemande ?? ''}
                onChange={e => setForm(f => ({ ...f, montantDemande: parseFloat(e.target.value) || undefined }))}
                placeholder="0"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm font-semibold text-[#355C7D] focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D]"
              />
            </div>
            <FieldError msg={errors.montantDemande} />
          </div>

          {/* Durée */}
          <div>
            <Label>Durée (mois)</Label>
            <input type="number" min={1} max={360}
              value={form.dureeMois ?? ''}
              onChange={e => setForm(f => ({ ...f, dureeMois: parseInt(e.target.value) || undefined }))}
              placeholder="12"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
            />
            <FieldError msg={errors.dureeMois} />
          </div>

          {/* Taux */}
          <div>
            <Label>Taux d'intérêt annuel (%)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" min={0} max={100} step={0.5}
                value={form.tauxInteret ?? ''}
                onChange={e => setForm(f => ({ ...f, tauxInteret: parseFloat(e.target.value) || undefined }))}
                placeholder="18"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
              />
            </div>
            <FieldError msg={errors.tauxInteret} />
          </div>

          {/* Frais */}
          <div>
            <Label>Frais de dossier (HTG) <span className="text-gray-400 normal-case font-normal">optionnel</span></Label>
            <input type="number" min={0}
              value={form.frais ?? ''}
              onChange={e => setForm(f => ({ ...f, frais: parseFloat(e.target.value) || undefined }))}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
            />
          </div>

          {/* Fréquence remboursement */}
          <div className="md:col-span-2">
            <Label>Fréquence de remboursement</Label>
            <div className="flex gap-2">
              {(['mensuel', 'hebdomadaire', 'saisonnier'] as RepaymentFrequency[]).map(freq => (
                <button key={freq}
                  onClick={() => setForm(f => ({ ...f, frequenceRemboursement: freq }))}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.frequenceRemboursement === freq
                      ? 'border-[#2E7D32] bg-[#DDEAD5]/40 text-[#1B5E20] font-semibold'
                      : 'border-gray-200 bg-[#F9F9F6] text-gray-600 hover:border-[#81C784]'
                  }`}>
                  {FREQ_LABELS[freq]}
                </button>
              ))}
            </div>
            <FieldError msg={errors.frequenceRemboursement} />
          </div>
        </div>

        {/* Simulation financière */}
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

      {/* ── 4. DATES ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={Calendar} label="Dates" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Date de demande</Label>
            <input type="date"
              value={form.dateDemande ?? ''}
              onChange={e => setForm(f => ({ ...f, dateDemande: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
            />
            <FieldError msg={errors.dateDemande} />
          </div>
          <div>
            <Label>Date de début </Label>
            <input type="date"
              value={form.dateDebut ?? ''}
              onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
            />
          </div>
          <div>
            <Label>Date de fin estimée</Label>
            <div className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500">
              {dateFin || <span className="text-gray-300">Calculée automatiquement</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. BUT & GARANTIE ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={FileText} label="But & garantie" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* But */}
          <div>
            <Label>But du prêt</Label>
            <div className="relative">
              <select
                value={form.but ?? ''}
                onChange={e => setForm(f => ({ ...f, but: e.target.value as LoanPurpose }))}
                className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]">
                <option value="">— Sélectionner —</option>
                {Object.entries(PURPOSE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <FieldError msg={errors.but} />
          </div>

          {/* Garantie */}
          <div>
            <Label>Garantie</Label>
            <div className="relative">
              <select
                value={form.garantie ?? ''}
                onChange={e => setForm(f => ({ ...f, garantie: e.target.value as CollateralType }))}
                className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]">
                <option value="">— Sélectionner —</option>
                {Object.entries(COLLATERAL_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <FieldError msg={errors.garantie} />
          </div>
        </div>

        {/* Commentaire */}
        <div className="mt-4">
          <Label>Commentaire <span className="text-gray-400 normal-case font-normal">optionnel</span></Label>
          <textarea
            value={form.commentaire ?? ''}
            onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))}
            rows={3}
            maxLength={500}
            placeholder="Observations, contexte, informations complémentaires…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
          />
          <div className="flex justify-between mt-1">
            <FieldError msg={errors.commentaire} />
            <p className="text-xs text-gray-400 ml-auto">{(form.commentaire ?? '').length}/500</p>
          </div>
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 pb-2">
        {onCancel && (
          <button onClick={onCancel} disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <ArrowLeft className="w-4 h-4" /> Annuler
          </button>
        )}
        <button onClick={handleSubmit} disabled={submitting || isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 ml-auto">
          {submitting || isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
            : <><Landmark className="w-4 h-4" /> Soumettre la demande</>
          }
        </button>
      </div>

    </div>
  );
}