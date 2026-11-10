'use client';

import React, { useState } from 'react';
import {
  Database,
  Lock,
  Download,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Zap,
  Calendar,
  Search,
  RefreshCw,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  DatabaseBackup,
  restoreBackup,
  downloadBackup,
  createInstantBackup,
} from '@/app/lib/api/backups';

interface BackupsTableProps {
  backups: DatabaseBackup[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenSchedule: () => void;
  onOpenDelete: (backup: DatabaseBackup, mode: 'soft' | 'hard') => void;
}

export default function BackupsTable({
  backups,
  isLoading,
  onRefresh,
  onOpenSchedule,
  onOpenDelete,
}: BackupsTableProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'auto' | 'instant'>('all');
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [instantSuccessMsg, setInstantSuccessMsg] = useState<string | null>(null);
  const [instantErrorMsg, setInstantErrorMsg] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Séparation Actifs vs Corbeille
  const activeBackups = backups.filter((b) => !b.is_deleted);
  const trashBackups = backups.filter((b) => b.is_deleted);

  // Filtrage
  const currentList = activeTab === 'active' ? activeBackups : trashBackups;
  const filteredBackups = currentList.filter((b) => {
    const matchesSearch =
      b.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.created_at.includes(searchQuery);
    const matchesType =
      filterType === 'all' ? true : b.backup_type === filterType;
    return matchesSearch && matchesType;
  });

  // Déclencher un backup instantané
  const handleInstantBackup = async () => {
    setIsInstantLoading(true);
    setInstantSuccessMsg(null);
    setInstantErrorMsg(null);

    try {
      const res = await createInstantBackup();
      setInstantSuccessMsg(res.message || 'Sauvegarde instantanée générée et chiffrée avec succès !');
      onRefresh();
      setTimeout(() => setInstantSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Erreur backup instantané:', err);
      setInstantErrorMsg(
        err?.response?.data?.error ||
        err?.message ||
        'Échec lors de la création de la sauvegarde instantanée.'
      );
      setTimeout(() => setInstantErrorMsg(null), 6000);
    } finally {
      setIsInstantLoading(false);
    }
  };

  // Restaurer depuis la corbeille
  const handleRestore = async (backup: DatabaseBackup) => {
    setRestoringId(backup.id);
    try {
      await restoreBackup(backup.id);
      onRefresh();
    } catch (err) {
      console.error('Erreur restauration backup:', err);
    } finally {
      setRestoringId(null);
    }
  };

  // Télécharger le fichier chiffré
  const handleDownload = async (backup: DatabaseBackup) => {
    setDownloadingId(backup.id);
    try {
      await downloadBackup(backup.id, backup.filename);
    } catch (err) {
      console.error('Erreur téléchargement backup:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      {/* Messages d'alerte */}
      {instantSuccessMsg && (
        <div className="m-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{instantSuccessMsg}</span>
        </div>
      )}
      {instantErrorMsg && (
        <div className="m-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300 text-sm flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{instantErrorMsg}</span>
        </div>
      )}

      {/* Barre d'outils supérieure */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Onglets Actifs vs Corbeille */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-zinc-800/70 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sauvegardes actives</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                activeTab === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'
              }`}
            >
              {activeBackups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'trash'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Corbeille</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                activeTab === 'trash'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'
              }`}
            >
              {trashBackups.length}
            </span>
          </button>
        </div>

        {/* Boutons d'action : Instantané & Planification Auto */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            title="Actualiser la liste"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenSchedule}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition flex items-center gap-2 shadow-sm"
          >
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Planification (Auto)</span>
          </button>

          <button
            onClick={handleInstantBackup}
            disabled={isInstantLoading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-2 shadow-sm shadow-emerald-600/20 disabled:opacity-50"
          >
            {isInstantLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Création du backup...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Sauvegarde Instantanée</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Barre de filtre et recherche */}
      <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/40 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher par nom ou date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-zinc-400">Type :</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">Tous les types</option>
            <option value="auto">Automatique (Cron / Celery)</option>
            <option value="instant">Instantané (Manuel)</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-zinc-400 uppercase text-[11px] tracking-wider border-b border-gray-100 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Fichier & Sécurité</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Taille</th>
              <th className="py-3 px-4 font-semibold">Date & Heure</th>
              <th className="py-3 px-4 font-semibold">Statut</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span>Chargement des sauvegardes...</span>
                  </div>
                </td>
              </tr>
            ) : filteredBackups.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center gap-2">
                    <Database className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
                    <p className="font-medium text-sm text-gray-700 dark:text-zinc-300">
                      {activeTab === 'active'
                        ? 'Aucune sauvegarde active trouvée'
                        : 'La corbeille est vide'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-sm">
                      {activeTab === 'active'
                        ? 'Cliquez sur "Sauvegarde Instantanée" pour créer un backup maintenant ou configurez une tâche automatique.'
                        : 'Les sauvegardes mises à la corbeille apparaîtront ici avec possibilité de restauration ou suppression définitive.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBackups.map((backup) => (
                <tr
                  key={backup.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition"
                >
                  {/* Fichier & Chiffrement */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-gray-900 dark:text-white truncate max-w-[240px] sm:max-w-[320px]">
                            {backup.filename}
                          </span>
                          {backup.is_encrypted && (
                            <span
                              title={`Chiffré avec ${backup.encryption_algorithm}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              AES-256
                            </span>
                          )}
                        </div>
                        {backup.checksum && (
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                            SHA256: {backup.checksum.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {backup.backup_type === 'auto' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                        <Clock className="w-3 h-3" />
                        Automatique
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                        <Zap className="w-3 h-3" />
                        Instantané
                      </span>
                    )}
                  </td>

                  {/* Taille */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-gray-800 dark:text-zinc-200">
                    {backup.formatted_size || 'N/A'}
                  </td>

                  {/* Date & Heure */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 dark:text-zinc-400">
                    {formatDate(backup.created_at)}
                  </td>

                  {/* Statut */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {backup.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Succès
                      </span>
                    ) : backup.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        En cours
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Échec
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {activeTab === 'active' ? (
                        <>
                          <button
                            onClick={() => handleDownload(backup)}
                            disabled={downloadingId === backup.id}
                            title="Télécharger le fichier chiffré"
                            className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                          >
                            {downloadingId === backup.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => onOpenDelete(backup, 'soft')}
                            title="Mettre à la corbeille (Soft delete)"
                            className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(backup)}
                            disabled={restoringId === backup.id}
                            title="Restaurer la sauvegarde"
                            className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                          >
                            {restoringId === backup.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => onOpenDelete(backup, 'hard')}
                            title="Supprimer définitivement du serveur"
                            className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
