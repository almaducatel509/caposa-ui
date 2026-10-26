'use client';

/**
 * LoanBulkActionModal.tsx — exécute une action sur un ou plusieurs prêts
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/components/loans/modals/LoanBulkActionModal.tsx
 * Remplace aussi LoanDecisionModal : un seul chemin pour approuver ou
 * rejeter, qu'il s'agisse d'un prêt (action en ligne) ou de vingt.
 *
 * - Reçoit directement des LoanData (fin de LoanForBulk).
 * - Éligibilité calculée sur les vrais statuts Django.
 * - Appelle l'API lui-même, en Promise.allSettled : un échec n'annule
 *   pas les autres ; l'écran final détaille réussites et échecs.
 * - Le parent recharge la liste via onDone().
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  X, AlertTriangle, CheckCircle2, XCircle, Loader2, CheckCheck, Download, Trash2, Clock,
} from 'lucide-react';
import { LoanBulkAction } from '../LoanBulkActionDropdown';
import { approveLoan, rejectLoan, deleteLoan } from '@/app/lib/api/loans';
import {
  LoanData, LoanStatus,
  LOAN_STATUS_LABELS, LOAN_TYPE_LABELS, PAYMENT_FREQUENCY_LABELS,
} from '../../transactions/validation/loanSchema';

// ─── Props ────────────────────────────────────────────────────────

interface Props {
  action:  LoanBulkAction | null;
  loans:   LoanData[];
  onClose: () => void;
  /** Appelé après exécution (succès total ou partiel) — le parent recharge. */
  onDone:  () => void;
}

// ─── Motifs de rejet ──────────────────────────────────────────────

const REJECT_REASONS = [
  'Revenus insuffisants',
  'Garantie insuffisante',
  'Documents incomplets',
  'Historique de crédit défavorable',
  'Prêt en cours non soldé',
  'Autre motif',
] as const;

// ─── Configuration par action ─────────────────────────────────────

type ActionConfig = {
  title:        (n: number) => string;
  description:  string;
  icon:         React.ReactNode;
  confirmLabel: (n: number) => string;
  danger:       boolean;
  headerBg:     string;
  warning?:     string;
  /** Message de succès, au participe passé. */
  done:         string;
};

const AVAILABLE: Partial<Record<LoanBulkAction, ActionConfig>> = {
  export: {
    title:        n => `Exporter ${n} prêt${n > 1 ? 's' : ''}`,
    description:  'Les prêts sélectionnés seront exportés dans un fichier CSV lisible par Excel.',
    icon:         <Download className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: () => 'Exporter en CSV',
    danger:       false,
    headerBg:     'bg-[#DDEAD5]',
    done:         'exporté',
  },
  approve: {
    title:        n => `Approuver ${n} demande${n > 1 ? 's' : ''}`,
    description:  'Les demandes passeront au statut « Approuvé » et seront prêtes pour le décaissement.',
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: n => `Approuver ${n} demande${n > 1 ? 's' : ''}`,
    danger:       false,
    headerBg:     'bg-[#DDEAD5]',
    done:         'approuvé',
  },
  reject: {
    title:        n => `Rejeter ${n} demande${n > 1 ? 's' : ''}`,
    description:  'Les demandes passeront au statut « Rejeté » et iront dans l\'archive.',
    icon:         <XCircle className="w-5 h-5 text-red-500" />,
    confirmLabel: n => `Rejeter ${n} demande${n > 1 ? 's' : ''}`,
    danger:       true,
    headerBg:     'bg-red-50',
    done:         'rejeté',
  },
  delete: {
    title:        n => `Supprimer ${n} prêt${n > 1 ? 's' : ''}`,
    description:  'Les prêts seront définitivement supprimés du système.',
    icon:         <Trash2 className="w-5 h-5 text-red-500" />,
    confirmLabel: n => `Supprimer ${n} prêt${n > 1 ? 's' : ''}`,
    danger:       true,
    headerBg:     'bg-red-50',
    warning:      'Action irréversible, réservée au directeur. Seules les demandes en attente ou rejetées peuvent être supprimées.',
    done:         'supprimé',
  },
};

// ─── Éligibilité (vrais statuts Django) ───────────────────────────

const ELIGIBLE: Partial<Record<LoanBulkAction, LoanStatus[]>> = {
  approve: ['pending'],
  reject:  ['pending', 'approved'],
  delete:  ['pending', 'rejected'],
};

function refusalReason(action: LoanBulkAction, status: LoanStatus): string {
  const label = LOAN_STATUS_LABELS[status];
  switch (action) {
    case 'approve':
      return status === 'approved' ? 'Déjà approuvé' : `Statut « ${label} » — seules les demandes en attente peuvent être approuvées`;
    case 'reject':
      return status === 'rejected' ? 'Déjà rejeté' : `Statut « ${label} » — un prêt décaissé ou remboursé ne peut plus être rejeté`;
    case 'delete':
      return `Statut « ${label} » — seules les demandes en attente ou rejetées peuvent être supprimées`;
    default:
      return 'Action non applicable';
  }
}

function checkEligibility(action: LoanBulkAction, loans: LoanData[]) {
  const allowed = ELIGIBLE[action];
  if (!allowed) return { eligible: loans, refused: [] as { loan: LoanData; reason: string }[] };   // export
  const eligible: LoanData[] = [];
  const refused: { loan: LoanData; reason: string }[] = [];
  for (const loan of loans) {
    if (allowed.includes(loan.status)) eligible.push(loan);
    else refused.push({ loan, reason: refusalReason(action, loan.status) });
  }
  return { eligible, refused };
}

// ─── Export CSV (BOM UTF-8 + protection contre l'injection de formules) ──

function csvCell(v: string | number | null | undefined): string {
  if (v == null) return '""';
  if (typeof v === 'number') return String(v);
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;   // empêche Excel d'exécuter une formule
  return `"${safe.replace(/"/g, '""')}"`;
}

const isoDay = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '');

function exportLoansCsv(loans: LoanData[]) {
  const headers = [
    'Référence', 'Membre', 'Compte', 'Type', 'Montant (HTG)', 'Taux (%)', 'Durée (mois)',
    'Fréquence', 'Statut', 'Demandé le', 'Approuvé le', 'Décaissé le', 'Solde restant (HTG)',
  ];
  const rows = loans.map(l => [
    csvCell(l.id.slice(0, 8).toUpperCase()),
    csvCell(l.member_name),
    csvCell(l.account_number),
    csvCell(LOAN_TYPE_LABELS[l.loan_type] ?? l.loan_type),
    csvCell(l.loan_amount),
    csvCell(l.interest_rate),
    csvCell(l.loan_duration),
    csvCell(PAYMENT_FREQUENCY_LABELS[l.payment_frequency] ?? l.payment_frequency),
    csvCell(LOAN_STATUS_LABELS[l.status]),
    csvCell(isoDay(l.request_date ?? l.created_at)),
    csvCell(isoDay(l.approval_date)),
    csvCell(isoDay(l.disbursement_date)),
    csvCell(l.remaining_balance ?? null),
  ].join(','));

  const csv  = '\uFEFF' + [headers.map(h => csvCell(h)).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `prets_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Helpers d'affichage ──────────────────────────────────────────

const STATUS_BADGE: Record<LoanStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  active:   'bg-[#DDEAD5] text-[#1B5E20]',
  paid:     'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

const formatHTG = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' HTG';

// ─── Composant ────────────────────────────────────────────────────

const LoanBulkActionModal: React.FC<Props> = ({ action, loans, onClose, onDone }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDetail, setRejectDetail] = useState('');
  const [running,      setRunning]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [result,       setResult]       = useState<{ ok: number; failures: { loan: LoanData; message: string }[] } | null>(null);
  const lock = useRef(false);

  const cfg = action ? AVAILABLE[action] : undefined;
  const { eligible, refused } = useMemo(
    () => (action ? checkEligibility(action, loans) : { eligible: [], refused: [] }),
    [action, loans],
  );

  if (!action) return null;

  // Action pas encore branchée côté backend (ne devrait pas arriver : le menu la désactive)
  if (!cfg) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col gap-4 text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-700">Cette action sera disponible quand le backend sera prêt.</p>
          <button onClick={onClose} className="py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700">Fermer</button>
        </div>
      </div>
    );
  }

  const isReject     = action === 'reject';
  const needsDetail  = isReject && rejectReason === 'Autre motif';
  const totalAmount  = eligible.reduce((s, l) => s + l.loan_amount, 0);
  const fullReason   = [rejectReason, rejectDetail.trim()].filter(Boolean).join(' — ');

  const canConfirm =
    eligible.length > 0 &&
    (!isReject || (rejectReason !== '' && (!needsDetail || rejectDetail.trim().length >= 5)));

  const handleConfirm = async () => {
    if (lock.current || !canConfirm) {
      if (isReject && !rejectReason) setError('Choisissez un motif de rejet.');
      else if (needsDetail)          setError('Précisez le motif (5 caractères minimum).');
      return;
    }
    lock.current = true;
    setRunning(true);
    setError(null);

    // Export : local, pas d'appel API
    if (action === 'export') {
      try {
        exportLoansCsv(eligible);
        setResult({ ok: eligible.length, failures: [] });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Échec de l\'export.');
      } finally {
        setRunning(false);
        lock.current = false;
      }
      return;
    }

    const call = (l: LoanData) =>
      action === 'approve' ? approveLoan(l.id)
      : action === 'reject' ? rejectLoan(l.id, fullReason)
      :                       deleteLoan(l.id);

    const settled  = await Promise.allSettled(eligible.map(call));
    const failures = settled.flatMap((r, i) =>
      r.status === 'rejected'
        ? [{ loan: eligible[i], message: r.reason instanceof Error ? r.reason.message : String(r.reason) }]
        : [],
    );

    setResult({ ok: settled.length - failures.length, failures });
    setRunning(false);
    lock.current = false;
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* En-tête */}
        <div className={`flex items-start justify-between p-5 border-b ${cfg.danger ? 'border-red-100' : 'border-gray-100'} ${cfg.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.danger ? 'bg-red-100' : 'bg-white/60'}`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title(eligible.length || loans.length)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {loans.length} sélectionné{loans.length > 1 ? 's' : ''}
                {eligible.length > 0 && ` · ${formatHTG(totalAmount)}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={running} aria-label="Fermer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Résultat ── */}
        {result ? (
          <div className="p-5 space-y-4">
            {result.ok > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#DDEAD5]/50 text-sm text-[#1B5E20]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {result.ok} prêt{result.ok > 1 ? 's' : ''} {cfg.done}{result.ok > 1 ? 's' : ''}.
              </div>
            )}
            {result.failures.length > 0 && (
              <div className="rounded-xl border border-red-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-700">
                    {result.failures.length} échec{result.failures.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                  {result.failures.map(f => (
                    <div key={f.loan.id} className="px-4 py-2.5">
                      <p className="text-xs font-semibold text-gray-700">{f.loan.member_name}</p>
                      <p className="text-xs text-red-500 mt-0.5">{f.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white">
              Fermer
            </button>
          </div>
        ) : (
          <>
            {/* ── Corps ── */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-600">{cfg.description}</p>

              {isReject && eligible.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Motif du rejet *</label>
                    <select value={rejectReason}
                      onChange={e => { setRejectReason(e.target.value); setError(null); }}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-200">
                      <option value="">— Choisir —</option>
                      {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {rejectReason && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Précisions {needsDetail ? '*' : <span className="font-normal text-gray-400">(facultatif)</span>}
                      </label>
                      <textarea value={rejectDetail} rows={2} maxLength={400}
                        onChange={e => { setRejectDetail(e.target.value); setError(null); }}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-red-200" />
                    </div>
                  )}
                </div>
              )}

              {/* Admissibles */}
              {eligible.length > 0 && (
                <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#DDEAD5]/60">
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
                      <span className="text-xs font-semibold text-[#1B5E20]">
                        {eligible.length} prêt{eligible.length > 1 ? 's' : ''} admissible{eligible.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#1B5E20]">{formatHTG(totalAmount)}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {eligible.slice(0, 5).map(l => (
                      <div key={l.id} className="flex items-center justify-between px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{l.member_name}</p>
                          <p className="text-xs text-gray-400 font-mono">{l.account_number || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-gray-700">{formatHTG(l.loan_amount)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[l.status]}`}>{LOAN_STATUS_LABELS[l.status]}</span>
                        </div>
                      </div>
                    ))}
                    {eligible.length > 5 && (
                      <div className="px-4 py-2 text-xs text-gray-400">+{eligible.length - 5} autres</div>
                    )}
                  </div>
                </div>
              )}

              {/* Refusés */}
              {refused.length > 0 && (
                <div className="rounded-xl border border-red-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-semibold text-red-700">
                      {refused.length} prêt{refused.length > 1 ? 's' : ''} non admissible{refused.length > 1 ? 's' : ''}
                      {eligible.length > 0 && ' — ignoré' + (refused.length > 1 ? 's' : '')}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                    {refused.map(({ loan, reason }) => (
                      <div key={loan.id} className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-gray-700 truncate">{loan.member_name}</p>
                        <p className="text-xs text-red-500 mt-0.5">{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {eligible.length === 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">Aucun prêt sélectionné ne remplit les conditions de cette action.</p>
                </div>
              )}

              {cfg.warning && eligible.length > 0 && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{cfg.warning}</p>
                </div>
              )}

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {/* Pied */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={onClose} disabled={running}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleConfirm} disabled={running || eligible.length === 0}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed ${
                  cfg.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md'
                }`}>
                {running && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {cfg.confirmLabel(eligible.length)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoanBulkActionModal;