'use client';

import React, { useState, useMemo } from 'react';
import {
  X, Wallet, Loader2, Search, ChevronDown, User, Hash,
  CheckCircle2, AlertTriangle, Copy, Check, CreditCard,
} from 'lucide-react';
import {
  type AccountData,
  type AccountType,
} from '../validationsaccount';
import { createAccount, checkMemberEligibility } from '@/app/lib/api/accounts';
import { BANK_RULES } from '@/app/lib/bankRules';
import { MemberOption } from '../../members/validations';

// ─── Mock members (même source que WithdrawalForm) ──────────────────────────
//   À remplacer par fetch /members/ quand l'endpoint sera dispo.


// ─── Props ──────────────────────────────────────────────────────────────────
interface CreateAccountModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: (account: AccountData) => void;
  members:        MemberOption[];
  membersLoading?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── Sub-components (identiques à WithdrawalForm) ───────────────────────────
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

// ─── Composant ──────────────────────────────────────────────────────────────
const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen, onClose, onSuccess, members, membersLoading = false,

}) => {
  // ── Membre (pattern WithdrawalForm) ──────────────────────────────────────
  const [memberSearch,   setMemberSearch]   = useState('');
  const [memberOpen,     setMemberOpen]     = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);

  // ── Éligibilité ──────────────────────────────────────────────────────────
  const [eligibilityChecking, setEligibilityChecking] = useState(false);
  const [eligibleOK,          setEligibleOK]          = useState(false);
  const [memberError,         setMemberError]         = useState('');

  // ── Type de compte ───────────────────────────────────────────────────────
  const [accountType, setAccountType] = useState<AccountType | ''>('');

  // ── Submit / Success ─────────────────────────────────────────────────────
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [apiError,      setApiError]      = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<AccountData | null>(null);
  const [copied,        setCopied]        = useState(false);

  // ── Filtre membres ───────────────────────────────────────────────────────
  const filteredMembers = useMemo(() =>
    members.filter(m =>
      m.member_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.id_number.includes(memberSearch)
    ), [members, memberSearch]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetAll = () => {
    setSelectedMember(null);
    setMemberSearch('');
    setMemberOpen(false);
    setEligibleOK(false);
    setMemberError('');
    setAccountType('');
    setApiError(null);
    setCreatedAccount(null);
    setCopied(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetAll();
    onClose();
  };

  // ── Sélection membre + vérification éligibilité ──────────────────────────
  const handleMemberSelect = async (m: MemberOption) => {
    setSelectedMember(m);
    setMemberOpen(false);
    setMemberSearch('');
    setEligibleOK(false);
    setMemberError('');
    setAccountType('');

    setEligibilityChecking(true);
    try {
      const { eligible, reasons } = await checkMemberEligibility(m.id);
      if (eligible) {
        setEligibleOK(true);
      } else {
        setMemberError(reasons.join('. ') || 'Membre non éligible.');
      }
    } catch (e: any) {
      setMemberError(e?.message || "Vérification d'éligibilité échouée.");
    } finally {
      setEligibilityChecking(false);
    }
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setEligibleOK(false);
    setMemberError('');
    setAccountType('');
  };

  // ── Soumission ───────────────────────────────────────────────────────────
  const canSubmit = !!selectedMember && eligibleOK && !!accountType && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedMember || !accountType) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      // createAccount() valide en interne via Zod et appelle mapFormDataToCreatePayload.
      // Le numéro de compte est généré côté front par generateTempAccountNumber()
      // tant que FRONTEND_GENERATES_ACCOUNT_NUMBER = true.
      const created = await createAccount({
        id_membre:  selectedMember.id,
        typeCompte: accountType,
      });
      setCreatedAccount(created);
      onSuccess(created);
    } catch (e: any) {
      setApiError(e?.message ?? 'Erreur lors de la création du compte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Copy account number ──────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!createdAccount?.account_number) return;
    try {
      await navigator.clipboard.writeText(createdAccount.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // navigator.clipboard peut être indispo (http non sécurisé) — silencieux
    }
  };

  if (!isOpen) return null;

  // ════════════════════════════════════════════════════════════════════════
  // ÉCRAN DE SUCCÈS
  // ════════════════════════════════════════════════════════════════════════
  if (createdAccount) {
    const rules = accountType ? BANK_RULES[accountType as AccountType] : null;
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] px-6 py-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Compte créé avec succès</h2>
            <p className="text-sm text-[#DDEAD5] mt-1">
              {rules?.icon} {rules?.title} pour {selectedMember?.member_name}
            </p>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <Field label="Numéro de compte attribué">
              <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-[#2E7D32]/30 bg-[#DDEAD5]/30">
                <Hash className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <code className="flex-1 font-mono text-base font-bold text-gray-800 tracking-wider">
                  {createdAccount.account_number}
                </code>
                
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9F9F6] rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Solde initial</p>
                <p className="text-sm font-bold text-[#2E7D32]">{formatHTG(createdAccount.soldeActuel ?? 0)}</p>
              </div>
              <div className="bg-[#F9F9F6] rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Statut</p>
                <p className="text-sm font-bold text-gray-700 capitalize">{createdAccount.account_status}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // FORMULAIRE
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Ouvrir un compte</h2>
              <p className="text-xs text-gray-400">Sélectionner un membre puis un type de compte</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

          {/* ── 1. Membre ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <SectionHeader step={1} title="Sélection du membre" icon={User} />

            <Field
              label="Membre"
              required
              error={memberError}
              hint={!selectedMember ? "Recherche par nom ou n° d'identification" : undefined}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMemberOpen(o => !o)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all
                    ${selectedMember ? 'border-[#2E7D32] bg-[#DDEAD5]/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className={`flex-1 truncate ${selectedMember ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                    {selectedMember?.member_name ?? 'Rechercher un membre…'}
                  </span>
                  {selectedMember
                    ? <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleClearMember(); }}
                        className="p-0.5 rounded-md hover:bg-[#c8e0bc] text-gray-500"
                      >
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
                        <input
                          autoFocus
                          type="text"
                          value={memberSearch}
                          onChange={e => setMemberSearch(e.target.value)}
                          placeholder="Nom ou N° identification…"
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#DDEAD5]"
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                      {membersLoading
                        ? <div className="flex items-center justify-center gap-2 py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            <p className="text-xs text-gray-400">Chargement des membres…</p>
                          </div>
                        : filteredMembers.length === 0
                        ? <p className="text-xs text-gray-400 text-center py-4">Aucun membre trouvé</p>
                        : filteredMembers.map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleMemberSelect(m)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#DDEAD5]/30 transition-colors text-left"
                            >
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

              {/* Récap membre + status éligibilité */}
              {selectedMember && (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 bg-[#F9F9F6] rounded-xl border border-gray-100 text-xs text-gray-500 mt-1">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>ID : <span className="font-mono font-semibold text-gray-700">{selectedMember.id_number}</span></span>
                    {selectedMember.phone_number && <span className="ml-auto">{selectedMember.phone_number}</span>}
                  </div>

                  {eligibilityChecking && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl mt-1">
                      <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
                      <p className="text-xs text-blue-700 font-medium">Vérification de l'éligibilité…</p>
                    </div>
                  )}

                  {!eligibilityChecking && eligibleOK && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                      <p className="text-xs text-[#1B5E20] font-medium">Membre éligible — vous pouvez choisir un type de compte.</p>
                    </div>
                  )}
                </>
              )}
            </Field>
          </div>

          {/* ── 2. Type de compte (cartes BANK_RULES) ── */}
          <div className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm transition-opacity ${!eligibleOK ? 'opacity-50 pointer-events-none' : ''}`}>
            <SectionHeader step={2} title="Type de compte" icon={CreditCard} />

            {!eligibleOK && (
              <p className="text-xs text-gray-400 mb-4">Sélectionnez d'abord un membre éligible pour activer cette étape.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(BANK_RULES) as AccountType[]).map(type => {
                const rules    = BANK_RULES[type];
                const selected = accountType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={!eligibleOK}
                    onClick={() => setAccountType(type)}
                    className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all
                      ${selected
                        ? 'border-[#2E7D32] bg-[#DDEAD5]/40 shadow-md ring-2 ring-[#DDEAD5]'
                        : 'border-gray-100 bg-white hover:border-[#2E7D32]/40 hover:bg-[#DDEAD5]/10'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl">{rules.icon}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{rules.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{rules.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Dépôt min.</span>
                        <span className="font-mono font-semibold text-gray-700">{formatHTG(rules.minDeposit)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Intérêt</span>
                        <span className="font-mono font-semibold text-gray-700">
                          {rules.interestRate > 0 ? `${rules.interestRate}%` : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Frais/mois</span>
                        <span className="font-mono font-semibold text-gray-700">
                          {rules.monthlyFees > 0 ? formatHTG(rules.monthlyFees) : 'Gratuit'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Note éducative du type sélectionné */}
            {accountType && BANK_RULES[accountType].educationalNote && (
              <div className="flex items-start gap-2 mt-4 px-3 py-2.5 bg-[#EBF2F8] border border-[#355C7D]/20 rounded-xl">
                <p className="text-xs text-[#355C7D] font-medium leading-snug">
                  {BANK_RULES[accountType].educationalNote}
                </p>
              </div>
            )}
          </div>

          {/* ── Erreur API ── */}
          {apiError && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium">{apiError}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Création…</>
              : <><Wallet className="w-4 h-4" /> Créer le compte</>
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateAccountModal;