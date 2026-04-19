'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Landmark, Lock, AlertTriangle, Loader2,
  User, CheckCircle2, XCircle, Banknote, Clock, Archive,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type LoanStatus = 'en_attente' | 'approuve' | 'decaisse' | 'rembourse' | 'rejete' | 'annule';

export interface LoanForEdit {
  id:              number | string;
  member_name:     string;
  member_id:       string;
  amount:          number;
  status:          LoanStatus;
  // Champs verrouillés (affichés mais non modifiables)
  loan_type:       string;
  purpose?:        string;
  duration_months: number;
  interest_rate:   number;
  monthly_payment: number;
  created_at:      string;
  processed_by:    string;
  validated_by?:   string;
  // Champs modifiables actuels
  assigned_to?:    string;
  notes?:          string;
}

export interface EmployeeOption {
  id:   string;
  name: string;
}

interface EditLoanModalProps {
  isOpen:     boolean;
  loan:       LoanForEdit | null;
  employees:  EmployeeOption[];
  onClose:    () => void;
  onConfirm:  (loanId: string | number, changes: {
    status?:      LoanStatus;
    reason?:      string;
    assigned_to?: string;
    notes?:       string;
  }) => Promise<void>;
}

// ─── Règles de transition de statut ───────────────────────────────────────────
const STATUS_TRANSITIONS: Record<LoanStatus, LoanStatus[]> = {
  en_attente: ['approuve', 'rejete'],
  approuve:   ['decaisse', 'rejete'],
  decaisse:   ['rembourse'],   // en général auto quand solde = 0, mais manuel possible
  rembourse:  [],              // final
  rejete:     [],              // final
  annule:     [],              // final
};

const STATUS_META: Record<LoanStatus, { label: string; icon: React.ElementType; color: string; bg: string; text: string; dot: string }> = {
  en_attente: { label: 'En attente', icon: Clock,        color: '#F59E0B', bg: 'bg-[#FEF9EC]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  approuve:   { label: 'Approuvé',   icon: CheckCircle2, color: '#355C7D', bg: 'bg-[#EBF2F8]', text: 'text-[#355C7D]', dot: 'bg-[#355C7D]' },
  decaisse:   { label: 'Décaissé',   icon: Banknote,     color: '#2E7D32', bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]' },
  rembourse:  { label: 'Remboursé',  icon: CheckCircle2, color: '#22C55E', bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', dot: 'bg-[#22C55E]' },
  rejete:     { label: 'Rejeté',     icon: XCircle,      color: '#EF4444', bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  annule:     { label: 'Annulé',     icon: Archive,      color: '#9CA3AF', bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', dot: 'bg-[#9CA3AF]' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatHTG = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

// Motif requis uniquement pour rejeter/annuler
const REASON_REQUIRED: LoanStatus[] = ['rejete'];

// ─── Component ────────────────────────────────────────────────────────────────
const EditLoanModal: React.FC<EditLoanModalProps> = ({
  isOpen, loan, employees, onClose, onConfirm,
}) => {
  const [newStatus,   setNewStatus]   = useState<LoanStatus | ''>('');
  const [reason,      setReason]      = useState('');
  const [assignedTo,  setAssignedTo]  = useState('');
  const [notes,       setNotes]       = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Reset à chaque ouverture/changement de prêt
  useEffect(() => {
    if (loan) {
      setNewStatus('');  // vide = pas de changement
      setReason('');
      setAssignedTo(loan.assigned_to ?? '');
      setNotes(loan.notes ?? '');
    }
    setError(null);
    setIsLoading(false);
  }, [loan, isOpen]);

  const availableTransitions = useMemo(() => {
    if (!loan) return [];
    return STATUS_TRANSITIONS[loan.status] ?? [];
  }, [loan]);

  const isFinal       = loan && availableTransitions.length === 0;
  const statusChanged = newStatus !== '' && newStatus !== loan?.status;
  const reasonNeeded  = statusChanged && newStatus && REASON_REQUIRED.includes(newStatus as LoanStatus);
  const assignChanged = assignedTo !== (loan?.assigned_to ?? '');
  const notesChanged  = notes      !== (loan?.notes      ?? '');
  const hasChanges    = statusChanged || assignChanged || notesChanged;

  if (!isOpen || !loan) return null;

  const currentMeta = STATUS_META[loan.status];
  const StatusIcon  = currentMeta.icon;

  const handleSubmit = async () => {
    if (!hasChanges) {
      setError('Aucune modification détectée.');
      return;
    }
    if (reasonNeeded && !reason.trim()) {
      setError('Le motif est obligatoire pour cette action.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(loan.id, {
        status:      statusChanged ? (newStatus as LoanStatus) : undefined,
        reason:      statusChanged && reason.trim() ? reason.trim() : undefined,
        assigned_to: assignChanged ? assignedTo : undefined,
        notes:       notesChanged  ? notes      : undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className={`flex items-start justify-between p-5 border-b border-gray-100 ${currentMeta.bg}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" style={{ color: currentMeta.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Modifier le prêt #{loan.id}</p>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                {loan.member_name} · {loan.member_id}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* ── Section 1 : Informations verrouillées ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Informations verrouillées
              </h3>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Montant"        value={formatHTG(loan.amount)} />
              <Field label="Type de prêt"   value={loan.loan_type} />
              <Field label="Durée"          value={`${loan.duration_months} mois`} />
              <Field label="Taux d'intérêt" value={`${loan.interest_rate}% / an`} />
              <Field label="Mensualité"     value={formatHTG(Math.round(loan.monthly_payment))} />
              {loan.purpose && <Field label="But" value={loan.purpose} />}
              <Field label="Créé le"        value={formatDate(loan.created_at)} />
              <Field label="Traité par"     value={loan.processed_by} />
              {loan.validated_by && <Field label="Validé par" value={loan.validated_by} />}
            </div>
          </section>

          {/* ── Section 2 : Modifiables ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B5E20]">
                Informations modifiables
              </h3>
            </div>

            <div className="space-y-4">

              {/* Statut actuel + changement */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Statut
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-500">Actuel :</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${currentMeta.bg} ${currentMeta.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentMeta.dot}`} />
                    {currentMeta.label}
                  </span>
                </div>

                {isFinal ? (
                  <div className="flex items-start gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">
                      Ce prêt est dans un statut final. Aucune transition de statut n'est possible.
                    </p>
                  </div>
                ) : (
                  <select
                    value={newStatus}
                    onChange={e => { setNewStatus(e.target.value as LoanStatus); setError(null); }}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                  >
                    <option value="">— Aucun changement —</option>
                    {availableTransitions.map(s => (
                      <option key={s} value={s}>
                        Passer à « {STATUS_META[s].label} »
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Motif — affiché si changement de statut */}
              {statusChanged && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Motif / Justification
                    {reasonNeeded && <span className="text-red-500 ml-1">*</span>}
                    {!reasonNeeded && <span className="text-gray-400 font-normal ml-1">(optionnel)</span>}
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => { setReason(e.target.value); setError(null); }}
                    placeholder={
                      newStatus === 'rejete'    ? 'Ex : Revenus insuffisants, garanties non conformes…'
                      : newStatus === 'approuve' ? 'Ex : Dossier complet, capacité de remboursement validée…'
                      : newStatus === 'decaisse' ? 'Ex : Fonds transférés, contrat signé…'
                      : 'Expliquez la raison du changement…'
                    }
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] resize-none"
                  />
                </div>
              )}

              {/* Assigné à */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <User className="w-3 h-3 inline mr-1" />
                  Assigné à (agent de crédit)
                </label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]"
                >
                  <option value="">— Non assigné —</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Notes internes
                  <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Commentaires, historique de suivi, remarques d'analyse…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] resize-none"
                />
              </div>
            </div>
          </section>

          {/* Warning rejet */}
          {statusChanged && newStatus === 'rejete' && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Le rejet est <strong>définitif</strong>. Le prêt sera archivé et le membre devra
                refaire une demande s'il souhaite obtenir un financement.
              </p>
            </div>
          )}

          {/* Warning décaissement */}
          {statusChanged && newStatus === 'decaisse' && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Le décaissement déclenchera le <strong>calendrier d'amortissement</strong>.
                Assurez-vous que les fonds sont disponibles en caisse avant de confirmer.
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {hasChanges
              ? <span className="text-[#2E7D32] font-semibold">● Modifications non enregistrées</span>
              : 'Aucune modification'}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !hasChanges}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                newStatus === 'rejete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md'
              }`}>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-component ────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-700">{value}</p>
  </div>
);

export default EditLoanModal;