'use client';

import React, { useState, useRef } from 'react';
import {
  ArrowLeftRight, ArrowLeft, CreditCard, Banknote,
  Hash, FileText, CheckCircle2, AlertTriangle, Loader2, Printer,
} from 'lucide-react';
import MemberPicker from '../../members/MemberPicker';
import { TransferFormErrors, TransferFormData, validateTransferWithZod } from '../validation/transfert';
import { MemberOption } from '../../members/validations';
import { AccountOption } from '../../accounts/validationsaccount';
import type { TransferApiResult } from '@/app/lib/api/caisse';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransferSubmitInput {
  sourceAccountId: string;   // UUID compte source
  destAccountId:   string;   // UUID compte destination
  amount:          number;
  description?:    string;
  idemKey:         string;
}

export interface TransferFormProps {
  /** Liste des membres — fournie par le parent via l'API. */
  members:             MemberOption[];
  /** Comptes d'un membre — fournis par le parent via l'API. */
  fetchMemberAccounts: (memberId: string) => Promise<AccountOption[]>;
  /** Envoie le transfert à l'API ; doit lever une erreur claire en cas d'échec. */
  onSubmit:            (input: TransferSubmitInput) => Promise<TransferApiResult>;
  /** Appelé après un transfert réussi (ex. recharger la liste). */
  onSuccess?:          (result: TransferApiResult) => void;
  onCancel?:           () => void;
}

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  epargne: { label: 'Épargne', bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]' },
  cheques: { label: 'Chèques', bg: 'bg-blue-50',   text: 'text-[#355C7D]' },
  terme:   { label: 'Terme',   bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

function newIdemKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

function ErrorLine({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
      <AlertTriangle className="w-3 h-3" /> {message}
    </p>
  );
}

/** Liste de comptes sélectionnables d'un membre. */
function AccountList({
  accounts, selected, disabledId, onSelect,
}: {
  accounts:    AccountOption[];
  selected:    AccountOption | null;
  disabledId?: string;               // compte source, à exclure côté destination
  onSelect:    (acc: AccountOption | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {accounts.map(acc => {
        const badge      = TYPE_BADGE[acc.typeCompte];
        const isInactive = acc.account_status !== 'actif';
        const isSource   = acc.id === disabledId;
        const isDisabled = isInactive || isSource;
        const isSelected = selected?.id === acc.id;

        return (
          <button
            key={acc.id}
            type="button"
            disabled={isDisabled}
            onClick={() => { if (!isDisabled) onSelect(isSelected ? null : acc); }}
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
                <p className="text-sm font-semibold text-gray-800">{acc.account_number}</p>
                <p className="text-xs text-gray-500">{formatHTG(acc.balance)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              )}
              {isSource && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Source</span>
              )}
              {isInactive && !isSource && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  {acc.account_status}
                </span>
              )}
              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TransferForm({
  members, fetchMemberAccounts, onSubmit, onSuccess, onCancel,
}: TransferFormProps) {

  const [step, setStep] = useState<'form' | 'success'>('form');

  // ── Source ──
  const [sourceMember,         setSourceMember]         = useState<MemberOption | null>(null);
  const [sourceMemberAccounts, setSourceMemberAccounts] = useState<AccountOption[]>([]);
  const [sourceAccount,        setSourceAccount]        = useState<AccountOption | null>(null);
  const [loadingSource,        setLoadingSource]        = useState(false);
  const [sourceError,          setSourceError]          = useState('');

  // ── Destination ──
  const [destMember,         setDestMember]         = useState<MemberOption | null>(null);
  const [destMemberAccounts, setDestMemberAccounts] = useState<AccountOption[]>([]);
  const [destAccount,        setDestAccount]        = useState<AccountOption | null>(null);
  const [loadingDest,        setLoadingDest]        = useState(false);
  const [destError,          setDestError]          = useState('');

  // ── Formulaire ──
  const [form, setForm] = useState({ montant: '', description: '' });
  const [errors, setErrors] = useState<TransferFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    sourceAccount: AccountOption;
    destAccount:   AccountOption;
    amount:        number;
    date:          string;
    reference:     string;
  } | null>(null);

  // Verrou synchrone contre les doubles clics + clé d'idempotence stable par transfert
  const submitLock = useRef(false);
  const idemKey    = useRef(newIdemKey());

  // ── Chargement des comptes (aucun fallback : erreur affichée) ──
  const loadAccounts = async (
    memberId: string,
    setList: (a: AccountOption[]) => void,
    setLoading: (b: boolean) => void,
    setError: (s: string) => void,
  ) => {
    setLoading(true);
    setError('');
    try {
      setList(await fetchMemberAccounts(memberId));
    } catch (err) {
      setList([]);
      setError(err instanceof Error ? err.message : 'Impossible de charger les comptes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSourceMember = (m: MemberOption | null) => {
    setSourceMember(m);
    setSourceAccount(null);
    setSourceMemberAccounts([]);
    if (m) loadAccounts(m.id, setSourceMemberAccounts, setLoadingSource, setSourceError);
  };

  const handleSelectDestMember = (m: MemberOption | null) => {
    setDestMember(m);
    setDestAccount(null);
    setDestMemberAccounts([]);
    if (m) loadAccounts(m.id, setDestMemberAccounts, setLoadingDest, setDestError);
  };

  // ── Derived ──
  const sameMember    = !!sourceMember && destMember?.id === sourceMember.id;
  const amount        = Number(form.montant || 0);
  const insufficient  = !!sourceAccount && amount > sourceAccount.balance;

  // ── Validation ──
  const validate = (): boolean => {
    const payload: TransferFormData = {
      id_member:           sourceMember?.id ?? '',
      account_source:      sourceAccount?.account_number ?? '',
      account_destination: destAccount?.account_number ?? '',
      typeTransfert:       sameMember ? 'interne' : 'externe',
      montant:             amount,
      description:         form.description.trim() || undefined,
    };
    const result = validateTransferWithZod(payload);
    const all: TransferFormErrors = { ...result.errors };
    if (!destMember)  (all as any).id_member_destination = 'Membre destination requis.';
    if (insufficient) all.montant = 'Solde insuffisant sur le compte source.';
    setErrors(all);
    return Object.keys(all).length === 0;
  };

  // ── Soumission → API ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLock.current) return;
    if (!validate() || !sourceAccount || !destAccount) return;

    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await onSubmit({
        sourceAccountId: sourceAccount.id,
        destAccountId:   destAccount.id,
        amount,
        description:     form.description.trim() || undefined,
        idemKey:         idemKey.current,
      });

      setSubmittedData({
        sourceAccount,
        destAccount,
        amount:    Number(result.amount ?? amount),
        date:      result.created_at ?? new Date().toISOString(),
        reference: result.reference_number ?? result.reference ?? String(result.id),
      });
      idemKey.current = newIdemKey();
      setStep('success');
      onSuccess?.(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Le transfert a échoué.');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  // ── Écran succès / reçu ──
  if (step === 'success' && submittedData) {
    return (
      <div>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #transfer-receipt, #transfer-receipt * { visibility: visible; }
            #transfer-receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="flex flex-col items-center justify-center py-12 px-6 gap-5">
          <div className="no-print w-20 h-20 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#2E7D32]" />
          </div>

          <div className="no-print text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Transfert effectué avec succès</h2>
          </div>

          <div id="transfer-receipt" className="w-full bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5 mt-2">
            <div className="hidden print:block text-center pb-4 mb-4 border-b border-gray-300">
              <h1 className="text-2xl font-bold tracking-wide text-gray-900" style={{ fontFamily: 'serif' }}>CAPOSA</h1>
              <p className="text-base font-bold text-gray-800 mt-3" style={{ fontFamily: 'serif' }}>Confirmation de virement</p>
            </div>

            <ReceiptRow label="Référence" value={<span className="font-mono font-bold">{submittedData.reference}</span>} />
            <ReceiptRow printOnly label="Date" value={new Date(submittedData.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <ReceiptRow printOnly label="Heure" value={new Date(submittedData.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} />
            <ReceiptRow label="Montant" value={<span className="font-bold text-[#2E7D32]">{formatHTG(submittedData.amount)}</span>} />
            <ReceiptRow label="Compte source" value={submittedData.sourceAccount.account_number} />
            <ReceiptRow label="Compte destination" value={submittedData.destAccount.account_number} />
            {destMember && <ReceiptRow printOnly label="Destinataire" value={destMember.member_name} />}
            {form.description && <ReceiptRow printOnly label="Message" value={form.description} />}
            <ReceiptRow printOnly label="Statut" value={<span className="font-bold text-[#2E7D32]">Envoyé</span>} />

            <div className="hidden print:block mt-6 pt-4 border-t border-gray-300 text-center">
              <p className="text-xs text-gray-500">Veuillez conserver cette confirmation pour vos dossiers.</p>
              <p className="text-xs text-gray-400 mt-1">Pour toute question, veuillez contacter notre service à la clientèle.</p>
            </div>
          </div>

          <div className="no-print flex w-full mt-4">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-shadow"
            >
              <Printer className="w-4 h-4" /> Imprimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulaire ──
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* ─── 1. Compte à débiter ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={1} title="Compte à débiter" icon={CreditCard} />

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
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement des comptes…
              </div>
            ) : sourceError ? (
              <ErrorLine message={sourceError} />
            ) : sourceMemberAccounts.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Ce membre n&apos;a aucun compte.</p>
            ) : (
              <AccountList
                accounts={sourceMemberAccounts}
                selected={sourceAccount}
                onSelect={acc => {
                  setSourceAccount(acc);
                  // si la destination devient identique à la source, on la libère
                  if (acc && destAccount?.id === acc.id) setDestAccount(null);
                }}
              />
            )}
          </div>
        )}
        <ErrorLine message={errors.account_source} />
      </div>

      {/* ─── 2. Compte à créditer ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={2} title="Compte à créditer" icon={CreditCard} />

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
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement des comptes…
              </div>
            ) : destError ? (
              <ErrorLine message={destError} />
            ) : destMemberAccounts.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Ce membre n&apos;a aucun compte.</p>
            ) : (
              <AccountList
                accounts={destMemberAccounts}
                selected={destAccount}
                disabledId={sourceAccount?.id}
                onSelect={setDestAccount}
              />
            )}
          </div>
        )}
        <ErrorLine message={errors.account_destination} />
      </div>

      {/* ─── 3. Montant et détails ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader step={3} title="Montant et détails" icon={Banknote} />

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
              Générée par le système à la soumission
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
              <p className="text-sm font-bold text-[#2E7D32]">{formatHTG(sourceAccount.balance)}</p>
            </div>
            <div className={`rounded-xl px-4 py-3 border ${insufficient ? 'bg-red-50 border-red-100' : 'bg-[#F9F9F6] border-gray-100'}`}>
              <p className="text-xs text-gray-400 mb-1">Après transfert</p>
              <p className={`text-sm font-bold ${insufficient ? 'text-red-600' : 'text-gray-700'}`}>
                {insufficient ? '— HTG (solde insuffisant)' : formatHTG(sourceAccount.balance - amount)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Erreur API */}
      {submitError && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

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
          {isSubmitting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</>
            : <><ArrowLeftRight className="w-4 h-4" /> Soumettre</>}
        </button>
      </div>
    </form>
  );
}

function ReceiptRow({ label, value, printOnly }: { label: string; value: React.ReactNode; printOnly?: boolean }) {
  return (
    <div className={`${printOnly ? 'hidden print:flex' : 'flex'} items-center justify-between py-2 border-b border-gray-100 last:border-b-0`}>
      <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}