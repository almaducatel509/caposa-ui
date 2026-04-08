'use client';

import React, { useMemo, useState } from 'react';
import {
  X, AlertTriangle, CheckCircle2, XCircle, Archive, Loader2, CheckCheck,
} from 'lucide-react';
import { MemberData } from '@/app/components/members/validations';
import { MemberBulkAction } from '../MemberBulkActionDropdown';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MemberBulkActionModalProps {
  action:    MemberBulkAction | null;
  members:   MemberData[];
  onClose:   () => void;
  onConfirm: (action: MemberBulkAction, eligibleIds: string[]) => Promise<void>;
}

// ─── Config par action ─────────────────────────────────────────────────────────

type ActionConfig = {
  title:        (n: number) => string;
  description:  (n: number) => string;
  icon:         React.ReactNode;
  confirmLabel: (n: number) => string;
  danger:       boolean;
  color:        string;
};

const ACTION_CONFIG: Record<MemberBulkAction, ActionConfig> = {
  activate: {
    title:        (n) => `Activer ${n} membre${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} membre${n > 1 ? 's' : ''} seront marques comme Actifs.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Activer ${n} membre${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
  deactivate: {
    title:        (n) => `Desactiver ${n} membre${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} membre${n > 1 ? 's' : ''} seront marques comme Inactifs.`,
    icon:         <XCircle className="w-5 h-5 text-yellow-500" />,
    confirmLabel: (n) => `Desactiver ${n} membre${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-yellow-50',
  },
  archive: {
    title:        (n) => `Archiver ${n} membre${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} membre${n > 1 ? 's' : ''} seront deplaces vers l'archive.`,
    icon:         <Archive className="w-5 h-5 text-red-500" />,
    confirmLabel: (n) => `Archiver les ${n} membre${n > 1 ? 's' : ''} admissibles`,
    danger:       true,
    color:        'bg-red-50',
  },
  export: {
    title:        (n) => `Exporter ${n} membre${n > 1 ? 's' : ''}`,
    description:  (n) => `Les donnees de ${n} membre${n > 1 ? 's' : ''} seront exportees en CSV.`,
    icon:         <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (_n) => `Exporter en CSV`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
};

// ─── Normalisation du statut ───────────────────────────────────────────────────

function normalizeMemberStatus(raw: string | undefined): 'actif' | 'inactif' | 'suspendu' | string {
  switch ((raw ?? '').toLowerCase().trim()) {
    case 'actif':
    case 'active':
    case 'actif(ve)':
      return 'actif';
    case 'inactif':
    case 'inactive':
      return 'inactif';
    case 'suspendu':
    case 'suspended':
    case 'archive':
    case 'archived':
      return 'suspendu';
    default:
      return (raw ?? '').toLowerCase().trim();
  }
}

// ─── Règles métier ─────────────────────────────────────────────────────────────

interface EligibilityResult {
  eligible: MemberData[];
  refused:  { member: MemberData; reasons: string[] }[];
}

function checkMemberEligibility(
  action:  MemberBulkAction,
  members: MemberData[],
): EligibilityResult {
  const eligible: MemberData[]                                  = [];
  const refused:  { member: MemberData; reasons: string[] }[]  = [];

  for (const m of members) {
    const reasons: string[] = [];
    const status = normalizeMemberStatus(m.status);

    // ── Activation ────────────────────────────────────────────────────────────
    if (action === 'activate') {
      if (status === 'actif')
        reasons.push('Membre deja actif');
      if (status === 'suspendu')
        reasons.push('Membre suspendu — necessite une approbation pour reactivation');
    }

    // ── Desactivation ─────────────────────────────────────────────────────────
    if (action === 'deactivate') {
      if (status === 'inactif')
        reasons.push('Membre deja inactif');
      if (status === 'suspendu')
        reasons.push('Membre suspendu — desactivation non applicable');
    }

    // ── Archivage ─────────────────────────────────────────────────────────────
    if (action === 'archive') {
      if (status === 'suspendu')
        reasons.push('Membre deja archive/suspendu');
      const hasBalance = m.accounts?.some((acc) => {
        const b = typeof acc.balance === 'string'
          ? parseFloat(acc.balance)
          : (acc.balance ?? 0);
        return b !== 0;
      });
      if (hasBalance)
        reasons.push('Solde non nul sur un ou plusieurs comptes');
    }

    if (reasons.length > 0) refused.push({ member: m, reasons });
    else eligible.push(m);
  }

  return { eligible, refused };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const MemberBulkActionModal: React.FC<MemberBulkActionModalProps> = ({
  action, members, onClose, onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const cfg = action ? ACTION_CONFIG[action] : null;

  const { eligible, refused } = useMemo(
    () => action ? checkMemberEligibility(action, members) : { eligible: [], refused: [] },
    [action, members],
  );

  if (!action || !cfg) return null;

  const canConfirm = eligible.length > 0;

  const handleConfirm = async () => {
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
              <p className="text-sm font-semibold text-gray-900">{cfg.title(members.length)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{members.length} membre{members.length > 1 ? 's' : ''} selectionne{members.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          <p className="text-sm text-gray-600">{cfg.description(members.length)}</p>

          {/* ── Membres admissibles ── */}
          {eligible.length > 0 && (
            <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DDEAD5]/60">
                <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-semibold text-[#1B5E20]">
                  {eligible.length} membre{eligible.length > 1 ? 's' : ''} admissible{eligible.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {eligible.slice(0, 5).map((m) => (
                  <div key={m.id as string} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {m.first_name} {m.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{m.member_number ?? '—'}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#DDEAD5] text-[#1B5E20] font-medium capitalize">
                      {m.status}
                    </span>
                  </div>
                ))}
                {eligible.length > 5 && (
                  <div className="px-4 py-2 text-xs text-gray-400">
                    +{eligible.length - 5} autres membres admissibles
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Membres refusés ── */}
          {refused.length > 0 && (
            <div className="rounded-xl border border-red-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-700">
                  {refused.length} membre{refused.length > 1 ? 's' : ''} refuse{refused.length > 1 ? 's' : ''}
                  {eligible.length > 0 && ' — sera ignore'}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {refused.map(({ member, reasons }) => (
                  <div key={member.id as string} className="px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{member.member_number ?? '—'}</p>
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
                Aucun membre ne remplit les conditions requises pour cette action.
              </p>
            </div>
          )}

          {/* ── Warning archivage ── */}
          {action === 'archive' && eligible.length > 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Les membres archives n'auront plus acces a leurs comptes. Une reactivation necessite une approbation manuelle.
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

export default MemberBulkActionModal;