'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  X, AlertTriangle, CheckCircle2, XCircle,
  MapPin, Briefcase, Archive, Loader2, CheckCheck,
} from 'lucide-react';
import { EmployeeData, PostData, BranchData } from '@/app/components/employees/validations';
import { EmployeeBulkAction } from '../BulkActionDropdown';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface BulkActionModalProps {
  action:    EmployeeBulkAction | null;
  employees: EmployeeData[];
  branches:  BranchData[];
  posts: PostData[];
  onClose:   () => void;
  onConfirm: (action: EmployeeBulkAction,eligibleIds: string[], payload?: string, ) => Promise<void>;
}

// ─── Config par action ─────────────────────────────────────────────────────────

type ActionConfig = {
  title:        (n: number) => string;
  description:  (n: number) => string;
  icon:         React.ReactNode;
  confirmLabel: (n: number) => string;
  danger:       boolean;
  color:        string;
  needsSelect:  boolean;
};

const ACTION_CONFIG: Record<EmployeeBulkAction, ActionConfig> = {
  activate: {
    title:        (n) => `Activer ${n} employe${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} employe${n > 1 ? 's' : ''} seront marques comme Actifs et pourront operer des transactions.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Activer ${n} employe${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
    needsSelect:  false,
  },
  deactivate: {
    title:        (n) => `Desactiver ${n} employe${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} employe${n > 1 ? 's' : ''} seront marques comme Inactifs. Ils ne pourront plus ouvrir de caisse.`,
    icon:         <XCircle className="w-5 h-5 text-yellow-500" />,
    confirmLabel: (n) => `Desactiver ${n} employe${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-yellow-50',
    needsSelect:  false,
  },
  change_branch: {
    title:        (n) => `Transferer ${n} employe${n > 1 ? 's' : ''}`,
    description:  (n) => `Choisissez la succursale cible pour ces ${n} employe${n > 1 ? 's' : ''}.`,
    icon:         <MapPin className="w-5 h-5 text-blue-500" />,
    confirmLabel: (n) => `Transferer ${n} employe${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-blue-50',
    needsSelect:  true,
  },
  change_post: {
    title:        (n) => `Assigner un poste a ${n} employe${n > 1 ? 's' : ''}`,
    description:  (n) => `Le poste selectionne remplacera le poste principal de ces ${n} employe${n > 1 ? 's' : ''}.`,
    icon:         <Briefcase className="w-5 h-5 text-purple-500" />,
    confirmLabel: (n) => `Assigner a ${n} employe${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-purple-50',
    needsSelect:  true,
  },
  archive: {
    title:        (n) => `Archiver ${n} employe${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} employe${n > 1 ? 's' : ''} seront deplaces vers l'archive.`,
    icon:         <Archive className="w-5 h-5 text-red-500" />,
    confirmLabel: (n) => `Archiver les ${n} employe${n > 1 ? 's' : ''} admissibles`,
    danger:       true,
    color:        'bg-red-50',
    needsSelect:  false,
  },
  export: {
    title: (n) => `Exporter ${n} membre${n > 1 ? 's' : ''}`,
    description: (n) => `Les donnees de ${n} membre${n > 1 ? 's' : ''} seront exportees en CSV.`,
    icon: <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (_n) => `Exporter en CSV`,
    danger: false,
    color: 'bg-[#DDEAD5]',
    needsSelect: false
  },
};

// ─── Normalisation du statut ───────────────────────────────────────────────────

function normalizeEmpStatus(raw: string | undefined): 'active' | 'inactive' | 'archived' | string {
  switch ((raw ?? '').toLowerCase().trim()) {
    case 'active':
    case 'actif':
    case 'actif(ve)':
      return 'active';
    case 'inactive':
    case 'inactif':
      return 'inactive';
    case 'archived':
    case 'archive':
    case 'suspendu':
    case 'suspended':
      return 'archived';
    default:
      return (raw ?? '').toLowerCase().trim();
  }
}

// ─── Règles métier ─────────────────────────────────────────────────────────────

interface EligibilityResult {
  eligible: EmployeeData[];
  refused:  { employee: EmployeeData; reasons: string[] }[];
}

function checkEmployeeEligibility(
  action:    EmployeeBulkAction,
  employees: EmployeeData[],
): EligibilityResult {
  const eligible: EmployeeData[]                                   = [];
  const refused:  { employee: EmployeeData; reasons: string[] }[] = [];

  for (const emp of employees) {
    const reasons: string[] = [];
    const status = normalizeEmpStatus(emp.statutEmploye);

    // ── Activation ────────────────────────────────────────────────────────────
    if (action === 'activate') {
      if (status === 'active')
        reasons.push('Employe deja actif');
      if (status === 'archived')
        reasons.push('Employe archive — reactivation manuelle requise');
    }

    // ── Desactivation ─────────────────────────────────────────────────────────
    if (action === 'deactivate') {
      if (status === 'inactive')
        reasons.push('Employe deja inactif');
      if (status === 'archived')
        reasons.push('Employe archive — desactivation non applicable');
    }

    // ── Transfert de branche ──────────────────────────────────────────────────
    if (action === 'change_branch') {
      if (status === 'archived')
        reasons.push('Employe archive — transfert impossible');
    }

    // ── Changement de poste ───────────────────────────────────────────────────
    if (action === 'change_post') {
      if (status === 'archived')
        reasons.push('Employe archive — changement de poste impossible');
    }

    // ── Archivage ─────────────────────────────────────────────────────────────
    if (action === 'archive') {
      if (status === 'archived')
        reasons.push('Employe deja archive');
      // Optionnel — decommenter si la caisse l'exige :
      // if (status === 'active' && emp.has_open_session)
      //   reasons.push("Session de caisse ouverte — fermez la caisse avant d'archiver");
    }

    if (reasons.length > 0) refused.push({ employee: emp, reasons });
    else eligible.push(emp);
  }

  return { eligible, refused };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const BulkActionModal: React.FC<BulkActionModalProps> = ({
  action, employees, branches, posts, onClose, onConfirm,
}) => {
  const [selectedValue, setSelectedValue] = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  useEffect(() => {
    setSelectedValue('');
    setError(null);
    setIsLoading(false);
  }, [action]);

  const cfg = action ? ACTION_CONFIG[action] : null;

  const { eligible, refused } = useMemo(
    () => action ? checkEmployeeEligibility(action, employees) : { eligible: [], refused: [] },
    [action, employees],
  );

  if (!action || !cfg) return null;

  const canConfirm = cfg.needsSelect
    ? eligible.length > 0 && selectedValue !== ''
    : eligible.length > 0;

  const handleConfirm = async () => {
    if (cfg.needsSelect && !selectedValue) {
      setError('Veuillez faire une selection.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(action, eligible.map((m) => m.id as string));
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className={`flex items-start justify-between p-5 border-b ${cfg.danger ? 'border-red-100 bg-red-50' : 'border-gray-100 ' + cfg.color}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.danger ? 'bg-red-100' : 'bg-white/60'}`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title(employees.length)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{employees.length} employe{employees.length > 1 ? 's' : ''} selectionne{employees.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          <p className="text-sm text-gray-600">{cfg.description(employees.length)}</p>

          {/* ── Select succursale / poste ── */}
          {cfg.needsSelect && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {action === 'change_branch' ? 'Succursale cible' : 'Poste a assigner'}
              </label>
              <select
                value={selectedValue}
                onChange={(e) => { setSelectedValue(e.target.value); setError(null); }}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 ${
                  error ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">
                  {action === 'change_branch' ? '— Choisir une succursale —' : '— Choisir un poste —'}
                </option>
                {action === 'change_branch'
                  ? branches.map((b) => (
                      <option key={String(b.id)} value={String(b.id)}>{b.branch_name}</option>
                    ))
                  : posts.map((p) => (
                      <option key={String(p.id)} value={String(p.id)}>{p.name || p.post_name}</option>
                    ))
                }
              </select>
            </div>
          )}

          {/* ── Employes admissibles ── */}
          {eligible.length > 0 && (
            <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DDEAD5]/60">
                <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-semibold text-[#1B5E20]">
                  {eligible.length} employe{eligible.length > 1 ? 's' : ''} admissible{eligible.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {eligible.slice(0, 5).map((emp) => (
                  <div key={String(emp.id)} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(emp as any).employee_number ?? (emp as any).posts_details?.[0]?.name ?? '—'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#DDEAD5] text-[#1B5E20] font-medium capitalize">
                      {emp.statutEmploye ?? 'active'}
                    </span>
                  </div>
                ))}
                {eligible.length > 5 && (
                  <div className="px-4 py-2 text-xs text-gray-400">
                    +{eligible.length - 5} autres employes admissibles
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Employes refusés ── */}
          {refused.length > 0 && (
            <div className="rounded-xl border border-red-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-700">
                  {refused.length} employe{refused.length > 1 ? 's' : ''} refuse{refused.length > 1 ? 's' : ''}
                  {eligible.length > 0 && ' — sera ignore'}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {refused.map(({ employee, reasons }) => (
                  <div key={String(employee.id)} className="px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(employee as any).employee_number ?? '—'}
                      </p>
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
                Aucun employe ne remplit les conditions requises pour cette action.
              </p>
            </div>
          )}

          {/* ── Warning archivage ── */}
          {action === 'archive' && eligible.length > 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Cette action est definitive. Les employes archives n'auront plus acces au systeme. Une reactivation necessite une approbation manuelle.
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
                : 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md'
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

export default BulkActionModal;