'use client';

import React, { useMemo, useState } from 'react';
import {
  X, AlertTriangle, Pencil, Trash2,
  Loader2, CheckCheck, Download,
} from 'lucide-react';
import { Post } from '../PostTable';
import { PostBulkAction } from '../PostBulkActionDropdown';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PostBulkActionModalProps {
  action:    PostBulkAction | null;
  posts:     Post[];
  onClose:   () => void;
  onConfirm: (action: PostBulkAction, eligibleIds: string[]) => Promise<void>;
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

const ACTION_CONFIG: Record<PostBulkAction, ActionConfig> = {
  edit_permissions: {
    title:        (n) => `Modifier les permissions de ${n} poste${n > 1 ? 's' : ''}`,
    description:  (n) => `Les permissions de ${n} poste${n > 1 ? 's' : ''} seront mises à jour.`,
    icon:         <Pencil className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: (n) => `Modifier ${n} poste${n > 1 ? 's' : ''}`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
  export: {
    title:        (n) => `Exporter ${n} poste${n > 1 ? 's' : ''}`,
    description:  (n) => `Les données de ${n} poste${n > 1 ? 's' : ''} seront exportées en fichier CSV.`,
    icon:         <Download className="w-5 h-5 text-[#2E7D32]" />,
    confirmLabel: () => `Exporter en CSV`,
    danger:       false,
    color:        'bg-[#DDEAD5]',
  },
  delete: {
    title:        (n) => `Supprimer ${n} poste${n > 1 ? 's' : ''}`,
    description:  (n) => `Ces ${n} poste${n > 1 ? 's' : ''} seront supprimé${n > 1 ? 's' : ''} définitivement.`,
    icon:         <Trash2 className="w-5 h-5 text-red-500" />,
    confirmLabel: (n) => `Supprimer ${n} poste${n > 1 ? 's' : ''}`,
    danger:       true,
    color:        'bg-red-50',
  },
};

// ─── Règles métier ─────────────────────────────────────────────────────────────

interface EligibilityResult {
  eligible: Post[];
  refused:  { post: Post; reasons: string[] }[];
}

function checkPostEligibility(
  action: PostBulkAction,
  posts:  Post[],
): EligibilityResult {
  const eligible: Post[] = [];
  const refused:  { post: Post; reasons: string[] }[] = [];

  for (const p of posts) {
    const reasons: string[] = [];

    // ── Modifier permissions ───────────────────────────────────────────────
    // Pas de restriction pour l'instant

    // ── Supprimer ─────────────────────────────────────────────────────────
    if (action === 'delete') {
      const permCount = [p.deposit, p.withdrawal, p.transfer].filter(Boolean).length;
      if (permCount > 0) {
        reasons.push(`Poste avec ${permCount} permission${permCount > 1 ? 's' : ''} active${permCount > 1 ? 's' : ''} — retirez les permissions d'abord`);
      }
    }

    // ── Export ─────────────────────────────────────────────────────────────
    // Pas de règle : tout est exportable

    if (reasons.length > 0) refused.push({ post: p, reasons });
    else eligible.push(p);
  }

  return { eligible, refused };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const PostBulkActionModal: React.FC<PostBulkActionModalProps> = ({
  action, posts, onClose, onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const cfg = action ? ACTION_CONFIG[action] : null;

  const { eligible, refused } = useMemo(
    () => action ? checkPostEligibility(action, posts) : { eligible: [], refused: [] },
    [action, posts],
  );

  if (!action || !cfg) return null;

  const canConfirm = eligible.length > 0;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(action, eligible.map((p) => p.id));
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
        <div className={`flex items-start justify-between p-5 border-b ${cfg.danger ? 'border-red-100 bg-red-50' : 'border-gray-100 ' + cfg.color}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.danger ? 'bg-red-100' : 'bg-white/60'}`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{cfg.title(posts.length)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {posts.length} poste{posts.length > 1 ? 's' : ''} sélectionné{posts.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          <p className="text-sm text-gray-600">{cfg.description(posts.length)}</p>

          {/* ── Postes admissibles ── */}
          {eligible.length > 0 && (
            <div className="rounded-xl border border-[#2E7D32]/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DDEAD5]/60">
                <CheckCheck className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-semibold text-[#1B5E20]">
                  {eligible.length} poste{eligible.length > 1 ? 's' : ''} admissible{eligible.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {eligible.slice(0, 5).map((p) => {
                  const permCount = [p.deposit, p.withdrawal, p.transfer].filter(Boolean).length;
                  return (
                    <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">
                          {permCount} permission{permCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {eligible.length > 5 && (
                  <div className="px-4 py-2 text-xs text-gray-400 italic">
                    +{eligible.length - 5} autres postes admissibles
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Postes refusés ── */}
          {refused.length > 0 && (
            <div className="rounded-xl border border-red-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-700">
                  {refused.length} poste{refused.length > 1 ? 's' : ''} refusé{refused.length > 1 ? 's' : ''}
                  {eligible.length > 0 && ' — sera ignoré'}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {refused.map(({ post, reasons }) => (
                  <div key={post.id} className="px-4 py-2.5">
                    <p className="text-xs font-semibold text-gray-700 truncate mb-1">{post.name}</p>
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
                Aucun poste ne remplit les conditions requises pour cette action.
              </p>
            </div>
          )}

          {/* ── Warning suppression ── */}
          {action === 'delete' && eligible.length > 0 && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                La suppression est irréversible. Les employés assignés à ces postes devront être réassignés.
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

export default PostBulkActionModal;