'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert, Archive } from 'lucide-react';
import { DatabaseBackup, softDeleteBackup, permanentDeleteBackup } from '@/app/lib/api/backups';

interface DeleteBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  backup: DatabaseBackup | null;
  mode: 'soft' | 'hard';
  onSuccess: (deletedId: string, mode: 'soft' | 'hard') => void;
}

export default function DeleteBackupModal({
  isOpen,
  onClose,
  backup,
  mode,
  onSuccess,
}: DeleteBackupModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !backup) return null;

  const isHard = mode === 'hard';

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      if (isHard) {
        await permanentDeleteBackup(backup.id);
      } else {
        await softDeleteBackup(backup.id);
      }
      onSuccess(backup.id, mode);
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du backup:', err);
      setError(
        err?.response?.data?.error ||
        err?.message ||
        'Une erreur est survenue lors de la suppression de la sauvegarde.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isHard
                  ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
              }`}
            >
              {isHard ? <ShieldAlert className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {isHard ? 'Suppression définitive' : 'Mettre à la corbeille'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                {isHard ? 'Destruction du fichier serveur' : 'Soft delete de la sauvegarde'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {isHard ? (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-400 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-red-800 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Action irréversible</span>
              </div>
              <p>
                Le fichier chiffré <span className="font-mono font-medium">({backup.filename})</span> sera{' '}
                <strong className="underline">physiquement effacé</strong> du disque du serveur. Cette action ne peut pas être annulée.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
              Voulez-vous déplacer cette sauvegarde dans la corbeille ? Elle sera masquée de la liste active mais le fichier
              chiffré restera conservé en sécurité sur le serveur et pourra être restauré à tout moment.
            </p>
          )}

          {/* Backup Details Box */}
          <div className="p-3.5 rounded-xl bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-500 dark:text-zinc-400">
              <span>Nom du fichier :</span>
              <span className="font-mono font-medium text-gray-900 dark:text-zinc-100 truncate max-w-[220px]">
                {backup.filename}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-500 dark:text-zinc-400">
              <span>Taille :</span>
              <span className="font-medium text-gray-900 dark:text-zinc-100">
                {backup.formatted_size || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-500 dark:text-zinc-400">
              <span>Créée le :</span>
              <span className="font-medium text-gray-900 dark:text-zinc-100">
                {new Date(backup.created_at).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer (Annuler à gauche, Action à droite) */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 ${
              isHard
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{isHard ? 'Supprimer définitivement' : 'Mettre à la corbeille'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
