'use client';

import React, { useState, useMemo } from 'react';
import {
  Banknote, FileCheck, ArrowLeftRight, MoreHorizontal,
  Hash, FileText, User, AlertTriangle, CheckCircle2,
  Loader2, ArrowRight, Pencil,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { DepositData } from './DepositTable';
import { depositUpdateSchema, type DepositUpdateValidated } from '../validation/deposit';

// ─── Helpers ─────────────────────────────────────────────────────

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── Config ──────────────────────────────────────────────────────

const SUBTYPE_CFG = {
  cash:     { icon: Banknote,       label: 'Espèces',  desc: 'Dépôt en liquide'         },
  check:    { icon: FileCheck,      label: 'Chèque',   desc: 'Compensation 1–5 jours'   },
  transfer: { icon: ArrowLeftRight, label: 'Virement', desc: 'Virement interne/externe' },
  other:    { icon: MoreHorizontal, label: 'Autre',    desc: 'Autre mode de dépôt'      },
} as const;

type DepositSubtype = keyof typeof SUBTYPE_CFG;

// ─── Field ───────────────────────────────────────────────────────

function Field({ label, error, hint, children }: {
  label:    string;
  error?:   string;
  hint?:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function Input({ hasError, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      {...props}
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

// ─── Aperçu Avant / Après ────────────────────────────────────────

function DiffRow({ label, before, after }: {
  label:  string;
  before: string;
  after:  string;
}) {
  const changed = before !== after;
  if (!changed) return null;
  return (
    <div className={`flex items-start gap-3 px-3 py-2 rounded-xl text-xs ${
      changed ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
    }`}>
      <span className="text-gray-400 font-semibold uppercase tracking-wider min-w-[80px] pt-0.5">{label}</span>
      <span className="text-red-400 line-through flex-1">{before}</span>
      <ArrowRight className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
      <span className="text-[#2E7D32] font-semibold flex-1">{after}</span>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────

interface Props {
  deposit:   DepositData;
  onClose:   () => void;
  onSuccess: (updated: DepositData) => void;
}

// ─── Main ────────────────────────────────────────────────────────

export default function EditDepositModal({ deposit, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    montantTransaction: String(deposit.montantTransaction),
    depositSubtype:     deposit.depositSubtype as DepositSubtype,
    source:             deposit.source,
    description:        deposit.description ?? '',
    raison:             '',
  });

  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Calcul des différences ────────────────────────────────────

  const newAmount = parseFloat(form.montantTransaction) || 0;

  const diffs = useMemo(() => ({
    montant:    { before: formatHTG(deposit.montantTransaction),       after: formatHTG(newAmount)        },
    subtype:    { before: SUBTYPE_CFG[deposit.depositSubtype]?.label,  after: SUBTYPE_CFG[form.depositSubtype]?.label },
    source:     { before: deposit.source,                              after: form.source                 },
    description:{ before: deposit.description ?? '—',                  after: form.description || '—'     },
  }), [form, deposit, newAmount]);

  const hasChanges = Object.values(diffs).some(d => d.before !== d.after);

  // ── Validation ────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.raison.trim() || form.raison.trim().length < 5)
      e.raison = 'La raison doit contenir au moins 5 caractères';

    if (!hasChanges)
      e.global = 'Aucune modification détectée';

    if (newAmount <= 0)
      e.montant = 'Le montant doit être supérieur à 0';

    if (!form.source.trim())
      e.source = 'La source est requise';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Soumission ────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload: DepositUpdateValidated = {
        montantTransaction:     newAmount,
        // depositSubtype:         form.depositSubtype,
        source:                 form.source,
        description:            form.description || null,
        raison_de_modification: form.raison.trim(),
      };

      // Validation Zod
      const result = depositUpdateSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          const key = String(err.path[0]);
          if (!fieldErrors[key]) fieldErrors[key] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      // TODO API : PATCH /api/deposits/{deposit.id}/
      // const { data } = await AxiosInstance.patch(`/api/deposits/${deposit.id}/`, result.data);
      // onSuccess(data);

      // Mock — simule la réponse API
      await new Promise(res => setTimeout(res, 800));
      const updated: DepositData = {
        ...deposit,
        montantTransaction: newAmount,
        depositSubtype:     form.depositSubtype,
        source:             form.source,
        description:        form.description || undefined,
      };

      setDone(true);
      setTimeout(() => {
        onSuccess(updated);
        onClose();
      }, 1200);

    } catch {
      setErrors({ global: 'Erreur lors de la modification. Réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Pencil className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Modifier le dépôt</p>
            <p className="text-xs text-gray-400">
              {deposit.member_name} · {deposit.idCompte}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col max-h-[75vh]">

        {/* ── Succès ── */}
        {done ? (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <p className="text-base font-bold text-gray-900">Dépôt modifié</p>
            <p className="text-xs text-gray-400">La modification a été enregistrée avec audit complet.</p>
          </div>
        ) : (
          <>
            {/* ── Corps scrollable ── */}
            <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5 bg-[#F9F9F6]">

              {/* Erreur globale */}
              {errors.global && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errors.global}
                </div>
              )}

              {/* Champs non modifiables */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Informations non modifiables
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { icon: User,    label: 'Membre',   value: deposit.member_name      },
                    { icon: Hash,    label: 'Compte',   value: deposit.idCompte         },
                    { icon: Hash,    label: 'Session',  value: deposit.session_id       },
                    { icon: Hash,    label: 'Auth',     value: deposit.codeAutorisation },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                      <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-400">{label}</p>
                        <p className="font-semibold text-gray-700 truncate font-mono">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Champs modifiables */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Champs modifiables
                </p>

                {/* Montant */}
                <Field label="Montant (HTG)" error={errors.montant}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">
                      HTG
                    </span>
                    <Input
                      type="number"
                      min={1}
                      hasError={!!errors.montant}
                      className="pl-12 text-right font-mono text-base font-bold"
                      value={form.montantTransaction}
                      onChange={set('montantTransaction')}
                    />
                  </div>
                  {newAmount > 0 && (
                    <p className="text-xs text-[#2E7D32] font-semibold text-right">{formatHTG(newAmount)}</p>
                  )}
                </Field>

                {/* Mode de dépôt */}
                <Field label="Mode de dépôt">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(SUBTYPE_CFG) as DepositSubtype[]).map(sub => {
                      const cfg    = SUBTYPE_CFG[sub];
                      const Icon   = cfg.icon;
                      const active = form.depositSubtype === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, depositSubtype: sub }))}
                          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-center transition-all ${
                            active
                              ? 'border-[#2E7D32] bg-[#DDEAD5]/40 text-[#1B5E20]'
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${active ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
                          <span className="text-xs font-semibold">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Source */}
                <Field label="Source" error={errors.source}>
                  <Input
                    placeholder="Ex: Salaire, Remboursement…"
                    hasError={!!errors.source}
                    value={form.source}
                    onChange={set('source')}
                  />
                </Field>

                {/* Description */}
                <Field label="Description (optionnel)">
                  <Input
                    placeholder="Notes optionnelles…"
                    value={form.description}
                    onChange={set('description')}
                  />
                </Field>
              </div>

              {/* Aperçu Avant / Après */}
              {hasChanges && (
                <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-1">
                    Aperçu des modifications
                  </p>
                  <DiffRow label="Montant"     before={diffs.montant.before}     after={diffs.montant.after}     />
                  <DiffRow label="Type"        before={diffs.subtype.before}     after={diffs.subtype.after}     />
                  <DiffRow label="Source"      before={diffs.source.before}      after={diffs.source.after}      />
                  <DiffRow label="Description" before={diffs.description.before} after={diffs.description.after} />
                </div>
              )}

              {/* Raison obligatoire */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <Field
                  label="Raison de modification *"
                  error={errors.raison}
                  hint="Minimum 5 caractères — enregistrée dans le journal d'audit"
                >
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <textarea
                      rows={3}
                      value={form.raison}
                      onChange={set('raison')}
                      placeholder="Ex: Erreur de saisie sur le montant, correction demandée par le superviseur…"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none resize-none transition-all
                        focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
                        ${errors.raison
                          ? 'border-red-300 bg-red-50/30'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    />
                  </div>
                </Field>

                {/* Avertissement audit */}
                <div className="flex items-start gap-2 mt-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-600">
                    Toute modification est enregistrée automatiquement dans le journal d'audit avec votre identifiant, l'IP et l'horodatage.
                  </p>
                </div>
              </div>

            </div>

            {/* ── Footer fixe ── */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || !hasChanges}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Modification…</>
                  : <><Pencil className="w-4 h-4" />Enregistrer la modification</>
                }
              </button>
            </div>
          </>
        )}

      </div>
    </Modal>
  );
}