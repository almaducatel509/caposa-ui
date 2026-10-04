'use client';

import React, { useMemo, useState } from 'react';
import {
  X, AlertTriangle, CheckCircle2, XCircle, Archive, Clock,
  Loader2, CheckCheck, Download, Settings2,
} from 'lucide-react';
import { BranchData } from '../validations';
import { BranchBulkAction } from '../BranchBulkActionDropdown';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Horaire par défaut envoyé au backend lors d'une activation automatique.
 * Le backend crée l'enregistrement OpeningHour + active la branche en une transaction.
 */
export interface DefaultSchedule {
  /** Jours ouverts, format ISO weekday : 1=lundi … 7=dimanche */
  open_days:    number[];
  /** HH:MM */
  opening_time: string;
  /** HH:MM */
  closing_time: string;
}

interface BranchBulkActionModalProps {
  action:    BranchBulkAction | null;
  branches:  BranchData[];
  onClose:   () => void;
  /**
   * Pour l'action 'activate', options.default_schedule est toujours fourni.
   * Pour les autres actions, options est undefined.
   */
  onConfirm: (
    action:      BranchBulkAction,
    eligibleIds: string[],
    options?:    { default_schedule?: DefaultSchedule },
  ) => Promise<void>;
}

// ─── Horaire par défaut ────────────────────────────────────────────────────────

const DEFAULT_SCHEDULE: DefaultSchedule = {
  open_days:    [1, 2, 3, 4, 5],   // Lun–Ven
  opening_time: '08:00',
  closing_time: '17:00',
};

const DAY_LABELS: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam', 7: 'Dim',
};

// ─── Config par action ─────────────────────────────────────────────────────────

type ActionConfig = {
  title:        (n: number) => string;
  description:  (n: number) => string;
  icon:         React.ReactNode;
  confirmLabel: (n: number) => string;
  danger:       boolean;
  color:        string;
};

const ACTION_CONFIG: Record<BranchBulkAction, ActionConfig> = {
  activate: {
    title:        (n) => `Configurer & activer ${n} branche${n > 1 ? 's' : ''}`,
    description:  (n) =>
      `Un horaire par défaut sera assigné et ${n > 1 ? 'ces' : 'cette'} `+
      `${n} branche${n > 1 ? 's' : ''} passeront en Actives automatiquement.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Configurer & activer ${n} branche${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
  deactivate: {
    title:        (n) => `Désactiver ${n} branche${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} branche${n > 1 ? 's' : ''} seront marquée${n > 1 ? 's' : ''} comme Inactives.`,
    icon:         <XCircle className="w-5 h-5 text-yellow-500" />,
    confirmLabel: (n) => `Désactiver ${n} branche${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-yellow-50',
  },
  assign_schedule: {
    title:        (n) => `Modifier l'horaire de ${n} branche${n > 1 ? 's' : ''}`,
    description:  (n) => `L'horaire hebdomadaire de ${n > 1 ? 'ces' : 'cette'} ${n} branche${n > 1 ? 's' : ''} sera mis à jour.`,
    icon:         <Clock className="w-5 h-5 text-amber-500" />,
    confirmLabel: (n) => `Modifier l'horaire (${n})`,
    danger:       false,
    color:        'bg-amber-50',
  },
  archive: {
    title:        (n) => `Archiver ${n} branche${n > 1 ? 's' : ''}`,
    description:  (n) =>
      `Ces ${n} branche${n > 1 ? 's' : ''} seront déplacée${n > 1 ? 's' : ''} vers l'archive. `+
      `Les sessions et comptes liés resteront lisibles mais aucune nouvelle opération ne sera possible.`,
    icon:         <Archive className="w-5 h-5 text-red-500" />,
    confirmLabel: (n) => `Archiver ${n} branche${n > 1 ? 's' : ''}`,
    danger:       true,
    color:        'bg-red-50',
  },
  export: {
    title:        (n) => `Exporter ${n} branche${n > 1 ? 's' : ''}`,
    description:  (n) => `Les données de ${n} branche${n > 1 ? 's' : ''} seront exportées en fichier CSV (compatible Excel).`,
    icon:         <Download className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: () => `Exporter en CSV`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
};

// ─── Normalisation du statut ───────────────────────────────────────────────────

function normalizeStatus(raw: string | undefined): 'active' | 'inactive' | 'archived' | string {
  switch ((raw ?? '').toLowerCase().trim()) {
    case 'active': case 'actif': case 'actif(ve)': return 'active';
    case 'inactive': case 'inactif':               return 'inactive';
    case 'archived': case 'archive':
    case 'suspendu': case 'suspended':             return 'archived';
    default: return (raw ?? '').toLowerCase().trim();
  }
}

// ─── Règles métier ─────────────────────────────────────────────────────────────

interface EligibilityResult {
  eligible: BranchData[];
  refused:  { branch: BranchData; reasons: string[] }[];
}

function checkBranchEligibility(action: BranchBulkAction, branches: BranchData[]): EligibilityResult {
  const eligible: BranchData[] = [];
  const refused:  { branch: BranchData; reasons: string[] }[] = [];

  for (const b of branches) {
    const reasons: string[] = [];
    const status = normalizeStatus(b.statusBranche);

    if (action === 'activate') {
      // Éligible uniquement si inactive ET sans horaire
      if (status === 'active') {
        reasons.push('Branche déjà active');
      } else if (status === 'archived') {
        reasons.push('Branche archivée — désarchivez d\'abord');
      } else if (b.opening_hour) {
        // Inactive mais a déjà un horaire : utiliser "Modifier horaire" puis activer manuellement
        reasons.push('Horaire déjà assigné — utilisez "Modifier horaire" à la place');
      }
    }

    if (action === 'deactivate') {
      if (status !== 'active') reasons.push('Branche déjà inactive');
    }

    if (action === 'assign_schedule') {
      // "Modifier horaire" cible les branches qui ont déjà un horaire
      if (!b.opening_hour) {
        reasons.push('Aucun horaire assigné — utilisez "Activer (config auto)" à la place');
      }
    }

    if (action === 'archive') {
      const total =
        (b.number_of_tellers ?? 0) +
        (b.number_of_clerks ?? 0) +
        (b.number_of_credit_officers ?? 0);
      if (status === 'archived') {
        reasons.push('Branche déjà archivée');
      } else if (total > 0 && status === 'active') {
        reasons.push(`Branche active avec ${total} employé${total > 1 ? 's' : ''} — désactivez d'abord`);
      }
    }

    // Export : tout est exportable, pas de règle

    if (reasons.length > 0) refused.push({ branch: b, reasons });
    else eligible.push(b);
  }

  return { eligible, refused };
}

// ─── Sous-composant : configurateur d'horaire par défaut ──────────────────────

interface ScheduleConfigProps {
  schedule:  DefaultSchedule;
  onChange:  (s: DefaultSchedule) => void;
}

const ScheduleConfig: React.FC<ScheduleConfigProps> = ({ schedule, onChange }) => {
  const toggleDay = (day: number) => {
    const days = schedule.open_days.includes(day)
      ? schedule.open_days.filter(d => d !== day)
      : [...schedule.open_days, day].sort();
    onChange({ ...schedule, open_days: days });
  };

  return (
    <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DDEAD5]/60">
        <Settings2 className="w-4 h-4 text-[#2E7D32]" />
        <span className="text-xs font-semibold text-[#1B5E20]">
          Horaire automatique appliqué
        </span>
        <span className="ml-auto text-[10px] text-[#2E7D32]/70 font-medium">modifiable</span>
      </div>

      <div className="px-4 py-3 space-y-3 bg-white">
        {/* Jours */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Jours ouverts
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7].map(day => {
              const active = schedule.open_days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    active
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-[#2E7D32]/40'
                  }`}
                >
                  {DAY_LABELS[day]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Heures */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Ouverture
            </p>
            <input
              type="time"
              value={schedule.opening_time}
              onChange={e => onChange({ ...schedule, opening_time: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2E7D32]/60"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Fermeture
            </p>
            <input
              type="time"
              value={schedule.closing_time}
              onChange={e => onChange({ ...schedule, closing_time: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2E7D32]/60"
            />
          </div>
        </div>

        {/* Résumé lisible */}
        <p className="text-xs text-gray-500 italic">
          {schedule.open_days.length > 0
            ? `${schedule.open_days.map(d => DAY_LABELS[d]).join(', ')} · ${schedule.opening_time} – ${schedule.closing_time}`
            : 'Sélectionnez au moins un jour'}
        </p>
      </div>
    </div>
  );
};

// ─── Component principal ───────────────────────────────────────────────────────

const BranchBulkActionModal: React.FC<BranchBulkActionModalProps> = ({
  action, branches, onClose, onConfirm,
}) => {
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [defaultSchedule, setDefaultSchedule] = useState<DefaultSchedule>(DEFAULT_SCHEDULE);

  const cfg = action ? ACTION_CONFIG[action] : null;

  const { eligible, refused } = useMemo(
    () => action ? checkBranchEligibility(action, branches) : { eligible: [], refused: [] },
    [action, branches],
  );

  if (!action || !cfg) return null;

  const canConfirm =
    eligible.length > 0 &&
    // Pour activate, exiger au moins 1 jour sélectionné
    (action !== 'activate' || defaultSchedule.open_days.length > 0);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(
        action,
        eligible.map(b => b.id),
        action === 'activate' ? { default_schedule: defaultSchedule } : undefined,
      );
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className={`flex items-start justify-between p-5 border-b ${
          cfg.danger ? 'border-red-100 bg-red-50' : `border-gray-100 ${cfg.color}`
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              cfg.danger ? 'bg-red-100' : 'bg-white/60'
            }`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title(branches.length)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {branches.length} branche{branches.length > 1 ? 's' : ''} sélectionnée{branches.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">

          <p className="text-sm text-gray-600">{cfg.description(branches.length)}</p>

          {/* ── Configurateur d'horaire (activate seulement) ── */}
          {action === 'activate' && eligible.length > 0 && (
            <ScheduleConfig
              schedule={defaultSchedule}
              onChange={setDefaultSchedule}
            />
          )}

          {/* ── Branches admissibles ── */}
          {eligible.length > 0 && (
            <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DDEAD5]/60">
                <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-semibold text-[#1B5E20]">
                  {eligible.length} branche{eligible.length > 1 ? 's' : ''} admissible{eligible.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {eligible.slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{b.branch_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{b.branch_code ?? '—'}</p>
                    </div>
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0
                      ${b.statusBranche === 'active'   ? 'bg-[#DDEAD5] text-[#1B5E20]' :
                        b.statusBranche === 'inactive' ? 'bg-[#FFE4E6] text-[#B91C1C]' :
                                                         'bg-[#E5E7EB] text-[#374151]'}
                    `}>
                      {b.statusBranche === 'active'   ? 'Active' :
                       b.statusBranche === 'inactive' ? 'Inactif' : 'Archivé'}
                    </span>
                  </div>
                ))}
                {eligible.length > 5 && (
                  <div className="px-4 py-2 text-xs text-gray-400 italic">
                    +{eligible.length - 5} autres branches admissibles
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Branches refusées ── */}
          {refused.length > 0 && (
            <div className="rounded-xl border border-red-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-700">
                  {refused.length} branche{refused.length > 1 ? 's' : ''} refusée{refused.length > 1 ? 's' : ''}
                  {eligible.length > 0 && ' — sera ignorée'}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {refused.map(({ branch, reasons }) => (
                  <div key={branch.id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700 truncate">{branch.branch_name}</p>
                      <p className="text-xs text-gray-400 font-mono shrink-0 ml-2">{branch.branch_code ?? '—'}</p>
                    </div>
                    {reasons.map((r, ri) => (
                      <p key={ri} className="text-xs text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                        {r}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Aucun admissible ── */}
          {eligible.length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">
                Aucune branche ne remplit les conditions requises pour cette action.
              </p>
            </div>
          )}

          {/* ── Warning archivage ── */}
          {action === 'archive' && eligible.length > 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Les branches archivées ne pourront plus effectuer de nouvelles opérations.
                Les données historiques restent consultables pour audit.
              </p>
            </div>
          )}

          {/* ── Avertissement si 0 jours sélectionnés pour activate ── */}
          {action === 'activate' && eligible.length > 0 && defaultSchedule.open_days.length === 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Sélectionnez au moins un jour ouvrable pour continuer.
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !canConfirm}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              cfg.danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {cfg.confirmLabel(eligible.length)}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BranchBulkActionModal;