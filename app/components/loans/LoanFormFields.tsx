"use client";
import React, { useState, useMemo } from "react";
import {
  LoanType, CollateralType, RepaymentFrequency,
  LoanFormErrors,
  LoanFormData,
  validateLoanWithZod,
} from "../transactions/validation/loanSchema";
import {
  calculateMonthlyPayment,
} from "../transactions/validation/loanCalculations";

import {
  Landmark, ArrowLeft, User, Hash, FileText, ShieldCheck,
  CheckCircle2, AlertTriangle, Loader2,
  ChevronDown, Calendar, Percent, Banknote, Package,
  Leaf, Home, GraduationCap, Wrench, Zap,
  Printer,
} from 'lucide-react';
import MemberPicker from "../members/MemberPicker";
import { MemberOption } from "../members/validations";
import { AccountOption } from "../accounts/validationsaccount";

// ─── Local types ──────────────────────────────────────────────────────────────

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
  { id: 'dcb21971', member_name: 'Hudson Joseph',       id_number: '555555' },
  { id: 'a1b2c3d4', member_name: 'Marie Dupont',        id_number: '987654' },
  { id: 'b3c4d5e6', member_name: 'Jean-Pierre Antoine', id_number: '112233' },
  { id: 'c4d5e6f7', member_name: 'Roseline Pierre',     id_number: '334455' },
  { id: 'd5e6f7a8', member_name: 'Claudette Moreau',    id_number: '556677' },
  { id: 'e6f7a8b9', member_name: 'Réginald Beaumont',   id_number: '778899' },
  { id: 'f7a8b9c0', member_name: 'Nadège Thermidor',    id_number: '990011' },
  { id: 'a8b9c0d1', member_name: 'Wilgens Désir',       id_number: '223344' },
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
    { id: 'acc-004', account_number: 'ACC1004', typeCompte: 'epargne', balance: 15000, account_status: 'actif' },
    { id: 'acc-005', account_number: 'ACC1005', typeCompte: 'terme',   balance: 60000, account_status: 'gele'  },
  ],
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoanForm({ members: propMembers, onSubmit, onCancel, isLoading }: LoanFormProps) {

  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  // ── Member state ──
  const [members]                          = useState<MemberOption[]>(propMembers ?? MOCK_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);

  // ── Account state ──
  const [accounts,        setAccounts]        = useState<AccountOption[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);

  // ── Form state ──
  const [form, setForm] = useState<LoanFormData>({
    interest_rate: 1.5,
    repayment_frequency: 'mensuel',
  });
  const [errors,        setErrors]        = useState<LoanFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<null | any>(null);   
  const [submitting, setSubmitting] = useState(false);  // ── Member handler ──
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

  // ── Financial calculations ──
  const monthly = useMemo(() => {
    if (!form.amount || !form.interest_rate || !form.duration_months) return 0;
    return calculateMonthlyPayment(form.amount, form.interest_rate, form.duration_months);
  }, [form.amount, form.interest_rate, form.duration_months]);

  
  const endDate = useMemo(() => {
    if (!form.start_date || !form.duration_months) return '';
    return addMonths(form.start_date, form.duration_months);
  }, [form.start_date, form.duration_months]);

  const generateReference = () => `LOAN-${Date.now()}`;
 
    // ── Submit form → confirm ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors: zodErrors } = validateLoanWithZod(form);

    if (!isValid) {
      console.warn("⛔ Validation échouée :", zodErrors);
      setErrors(zodErrors);
      return;
    }
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 800));

    const reference = generateReference();

    const loanReceiptPayload = {
      date: new Date().toISOString(),
      member: selectedMember,
      account: selectedAccount,
      reference,
      loan_type: form.loan_type,
      amount: form.amount,
      duration_months: form.duration_months,
      interest_rate: form.interest_rate,
      repayment_frequency: form.repayment_frequency,
      collateral: form.collateral,
      comment: form.comment,
    };
    console.log("🚀 Loan SUBMITTED:", loanReceiptPayload);


    console.log("✅ Formulaire valide :", form);
    console.log("═══════════════════════════════════════");
    console.log("🟢 [1] handleSubmit DÉCLENCHÉ");
    console.log("═══════════════════════════════════════");

    const formWithDate = { ...form, created_at: new Date().toISOString() };
    console.log("📋 [2] Données du formulaire :", formWithDate);
    console.log("👤 [3] Membre sélectionné :", selectedMember);
    console.log("💳 [4] Compte sélectionné :", selectedAccount);

    setSubmittedData(loanReceiptPayload);
    setIsSubmitting(false);
    setStep('success'); //👈 bascule vers l'écran/modal de succès
  };
  // ── Confirm → success ──
   const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setStep('success');
  };
  // ── Écrans succès  ──
  if (step === 'success') {
    return (
      <>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #loan-receipt, #loan-receipt * { visibility: visible; }
            #loan-receipt {
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
              Demande de prêt enregistrée avec succès
            </h2>
          </div>

          {/* Récap / Fiche imprimable */}
          {submittedData && (
            <div
              id="loan-receipt"
              className="w-full bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5 mt-2"
            >
              {/* En-tête CAPOSA (visible uniquement à l'impression) */}
              <div className="hidden print:block text-center pb-4 mb-4 border-b border-gray-300">
                <h1 className="text-2xl font-bold tracking-wide text-gray-900" style={{ fontFamily: 'serif' }}>
                  CAPOSA
                </h1>
                <p className="text-base font-bold text-gray-800 mt-3" style={{ fontFamily: 'serif' }}>
                  Confirmation de demande de prêt
                </p>
              </div>

              {/* Référence */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Référence</span>
                <span className="text-sm font-mono font-bold text-gray-800">
                  {submittedData.reference}
                </span>
              </div>

              {/* Date + heure (uniquement à l'impression) */}
              <div className="hidden print:flex items-center justify-between py-2 border-b border-gray-100">
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

              {/* Membre */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Membre</span>
                <span className="text-sm font-semibold text-gray-800">
                  {submittedData.member?.member_name || submittedData.id_member}
                </span>
              </div>

              {/* Type */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Type de prêt</span>
                <span className="text-sm font-semibold text-gray-800">
                  {submittedData.loan_type ? LOAN_TYPE_CFG[submittedData.loan_type as LoanType].label : '—'}
                </span>
              </div>

              {/* Montant */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Montant</span>
                <span className="text-sm font-bold text-[#2E7D32]">
                  {formatHTG(submittedData.amount)}
                </span>
              </div>

              {/* Durée */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Durée</span>
                <span className="text-sm text-gray-800">{submittedData.duration_months} mois</span>
              </div>

              {/* Taux */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Taux d'intérêt</span>
                <span className="text-sm text-gray-800">{submittedData.interest_rate} %</span>
              </div>

              {/* Fréquence */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Remboursement</span>
                <span className="text-sm text-gray-800">
                  {submittedData.repayment_frequency ? FREQ_LABELS[submittedData.repayment_frequency as RepaymentFrequency] : '—'}
                </span>
              </div>

             

              {/* Garantie (print only) */}
              {submittedData.collateral && (
                <div className="hidden print:flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Garantie</span>
                  <span className="text-sm text-gray-800">
                    {COLLATERAL_LABELS[submittedData.collateral as CollateralType]}
                  </span>
                </div>
              )}

              {/* Commentaire (print only) */}
              {submittedData.comment && (
                <div className="hidden print:flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Commentaire</span>
                  <span className="text-sm text-gray-800">{submittedData.comment}</span>
                </div>
              )}

              {/* Statut (print only) */}
              <div className="hidden print:flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-500">Statut</span>
                <span className="text-sm font-bold text-[#2E7D32]">En attente</span>
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
              type="button"
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
            <p className="text-sm font-bold text-gray-900">Confirmer la demande de prêt</p>
          </div>
          <div className="divide-y divide-gray-50">
            {([
              ['Membre',         selectedMember?.member_name],
              ['Type de prêt',   form.loan_type ? LOAN_TYPE_CFG[form.loan_type].label : '—'],
              ['Montant',        form.amount ? formatHTG(Number(form.amount)) : '—'],
              ['Durée',          form.duration_months ? `${form.duration_months} mois` : '—'],
              ['Taux d\'intérêt', form.interest_rate ? `${form.interest_rate} %` : '—'],
              ['Fréquence',      form.repayment_frequency ? FREQ_LABELS[form.repayment_frequency] : '—'],
              ['Garantie',       form.collateral ? COLLATERAL_LABELS[form.collateral] : '—'],
              ['Mensualité',     formatHTG(Math.round(monthly))],
              ['Description',    form.comment || '—'],
            ] as [string, string | undefined][]).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-sm font-semibold ${label === 'Montant' || label === 'Mensualité' ? 'text-[#2E7D32]' : 'text-gray-800'}`}>
                  {value || '—'}
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
                  const badge = TYPE_BADGE[acc.typeCompte];
                  const isInactive = acc.account_status !== 'actif';
                  const isSelected = selectedAccount?.id === acc.id;
                  return (
                    <button key={acc.id}
                      type="button"
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
                type="button"
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

          

          {/* Repayment frequency */}
          <div className="md:col-span-2">
            <Label>Fréquence de remboursement</Label>
            <div className="flex gap-2">
              {(['mensuel', 'hebdomadaire', 'saisonnier'] as RepaymentFrequency[]).map(freq => (
                <button key={freq}
                  type="button"
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
              {endDate
                ? new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                : 'Calculée après décaissement'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Basée sur la durée ({form.duration_months ?? '—'} mois) + date de décaissement
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. COLLATERAL & COMMENT ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionTitle icon={ShieldCheck} label="Garantie" />
        
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
              <Landmark className="w-4 h-4" />
              Soumettre
            </>
          )}
        </button>
      </div>  

    </form>
  );
}