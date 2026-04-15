'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight, AlertTriangle, CheckCircle2,
  Loader2, FileText, User, Hash, ArrowRight,
  Clock, CheckCheck, XCircle, Hourglass,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { TransferData } from './TransferTable';

// ─── Types ───────────────────────────────────────────────────────

export type TransferStatus =
  | 'en_attente'
  | 'en_cours'
  | 'decaisse'
  | 'echoue'
  | 'annule';

interface Props {
  transfer:  TransferData;
  onClose:   () => void;
  onSuccess: (updated: TransferData) => void;
}

// ─── Config statuts ───────────────────────────────────────────────

const STATUS_CFG: Record<TransferStatus, {
  label: string;
  icon:  React.ElementType;
  color: string;
  bg:    string;
  dot:   string;
}> = {
  en_attente: { label: 'En attente', icon: Hourglass,  color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' },
  en_cours:   { label: 'En cours',   icon: Clock,      color: '#1E40AF', bg: '#DBEAFE', dot: '#3B82F6' },
  decaisse:   { label: 'Complété',   icon: CheckCheck, color: '#1B5E20', bg: '#DDEAD5', dot: '#2E7D32' },
  echoue:     { label: 'Échoué',     icon: XCircle,    color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
  annule:     { label: 'Annulé',     icon: XCircle,    color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' },
};

const ALLOWED_TRANSITIONS: Record<TransferStatus, TransferStatus[]> = {
  en_attente: ['en_cours', 'decaisse', 'echoue'],
  en_cours:   ['decaisse', 'echoue'],
  decaisse:   [], // terminal
  echoue:     [], // terminal
  annule:     [], // terminal
};

// ─── Helpers ─────────────────────────────────────────────────────

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT').format(n) + ' HTG';
}

// ─── Sub-components ───────────────────────────────────────────────

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

function StatusBadge({ status }: { status: TransferStatus }) {
  const cfg  = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
      <Icon className="w-3 h-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

// ─── Main ────────────────────────────────────────────────────────

export default function EditTransferModal({ transfer, onClose, onSuccess }: Props) {

  const allowedNext = ALLOWED_TRANSITIONS[transfer.status as TransferStatus] ?? [];
  const isTerminal  = allowedNext.length === 0;

  const [form, setForm] = useState({
    status:      transfer.status as TransferStatus,
    notes:       (transfer as any).notes ?? '',
    assigned_to: (transfer as any).assigned_to ?? '',
    raison:      '',
  });

  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const hasChanges = useMemo(() => (
    form.status      !== transfer.status                   ||
    form.notes       !== ((transfer as any).notes ?? '')   ||
    form.assigned_to !== ((transfer as any).assigned_to ?? '')
  ), [form, transfer]);

  const statusChanged = form.status !== transfer.status;

  // ── Validation ────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!hasChanges)
      e.global = 'Aucune modification détectée';
    if (!form.raison.trim() || form.raison.trim().length < 5)
      e.raison = 'La raison doit contenir au moins 5 caractères';
    if (form.status === 'echoue' && !form.notes.trim())
      e.notes = "Le motif d'échec est obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Soumission ────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();

      // TODO API : PATCH /api/transfers/{transfer.id}/

      await new Promise(res => setTimeout(res, 800));

      const updated: TransferData = {
        ...transfer,
        status: form.status,
        ...(form.notes       ? { notes:        form.notes       } : {}),
        ...(form.assigned_to ? { assigned_to:  form.assigned_to } : {}),
        ...(statusChanged && ['decaisse', 'echoue'].includes(form.status)
          ? { processed_at: now }
          : {}),
      } as TransferData;

      setDone(true);
      setTimeout(() => { onSuccess(updated); onClose(); }, 1200);
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
          <div className="w-8 h-8 rounded-xl bg-[#EBF2F8] flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-4 h-4 text-[#355C7D]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Modifier le virement</p>
            <p className="text-xs text-gray-400">
              {transfer.memberName} · {transfer.reference}
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
            <p className="text-base font-bold text-gray-900">Virement mis à jour</p>
            <p className="text-xs text-gray-400">La modification a été enregistrée avec audit complet.</p>
          </div>

        ) : isTerminal ? (

          /* ── Statut terminal ── */
          <div className="flex flex-col items-center justify-center py-14 gap-4 px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-900 text-center">
              Ce virement ne peut plus être modifié
            </p>
            <p className="text-xs text-gray-400 text-center max-w-xs">
              Le statut <strong>{STATUS_CFG[transfer.status as TransferStatus]?.label}</strong> est
              terminal et irréversible. Un virement complété, échoué ou annulé est définitif.
            </p>
            <StatusBadge status={transfer.status as TransferStatus} />
            {(transfer as any).processed_at && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                <span>
                  Traité le{' '}
                  <span className="font-semibold text-gray-700">
                    {new Date((transfer as any).processed_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>
            )}
          </div>

        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5 bg-[#F9F9F6]">

              {errors.global && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{errors.global}
                </div>
              )}

              {/* ── Champs NON modifiables ── */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Informations non modifiables
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { icon: User, label: 'Membre',    value: transfer.memberName   },
                    { icon: Hash, label: 'Référence', value: transfer.reference    },
                    { icon: Hash, label: 'Session',   value: transfer.session_id   },
                    { icon: Hash, label: 'Caisse',    value: transfer.caisse_numero },
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

                {/* Comptes + montant verrouillés */}
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <ArrowLeftRight className="w-4 h-4 text-[#355C7D] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Comptes</p>
                        <p className="text-xs font-semibold text-gray-700 font-mono truncate">
                          {transfer.compteSource} → {transfer.compteDestination}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg border border-gray-200 shrink-0">
                      Verrouillé
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-[#355C7D] shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Montant</p>
                        <p className="text-sm font-bold text-[#355C7D]">{formatHTG(transfer.montant)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg border border-gray-200">
                      Verrouillé
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Champs modifiables ── */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Champs modifiables
                </p>

                <Field label="Statut">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">Actuel :</span>
                    <StatusBadge status={transfer.status as TransferStatus} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allowedNext.map(next => {
                      const cfg    = STATUS_CFG[next];
                      const Icon   = cfg.icon;
                      const active = form.status === next;
                      return (
                        <button
                          key={next}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, status: next }))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                            active
                              ? 'border-transparent text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                          style={active ? { backgroundColor: cfg.dot, borderColor: cfg.dot } : {}}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  {statusChanged && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs">
                      <StatusBadge status={transfer.status as TransferStatus} />
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <StatusBadge status={form.status} />
                    </div>
                  )}
                </Field>

                <Field
                  label={form.status === 'echoue' ? "Motif d'échec *" : 'Notes / Commentaires'}
                  error={errors.notes}
                  hint={form.status !== 'echoue' ? 'Justification, anomalie détectée…' : undefined}
                >
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={set('notes')}
                      placeholder={
                        form.status === 'echoue'
                          ? 'Ex: Compte destination invalide, provision insuffisante…'
                          : 'Ex: Virement en attente de validation bancaire…'
                      }
                      className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none resize-none transition-all
                        focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
                        ${errors.notes ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    />
                  </div>
                </Field>

                <Field label="Assigné à (optionnel)" hint="Réassigner à un autre agent si nécessaire">
                  <input
                    type="text"
                    value={form.assigned_to}
                    onChange={set('assigned_to')}
                    placeholder="Nom ou identifiant de l'agent…"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white outline-none transition-all hover:border-gray-300 focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]"
                  />
                </Field>
              </div>

              {/* ── Raison obligatoire ── */}
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
                      placeholder="Ex: Statut mis à jour après confirmation bancaire, correction demandée par le superviseur…"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none resize-none transition-all
                        focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]
                        ${errors.raison ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    />
                  </div>
                </Field>
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#355C7D] hover:bg-[#2a4a65] text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</>
                  : <><ArrowLeftRight className="w-4 h-4" />Enregistrer</>
                }
              </button>
            </div>
          </>
        )}

      </div>
    </Modal>
  );
}