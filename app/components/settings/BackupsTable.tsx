'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Database,
  Lock,
  Download,
  Trash2,
  RotateCcw,
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
  ChevronDown,
  X,
  Plus,
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
  const [filterType, setFilterType] = useState<'all' | 'auto' | 'manual'>('all');
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [instantSuccessMsg, setInstantSuccessMsg] = useState<string | null>(null);
  const [instantErrorMsg, setInstantErrorMsg] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Dropdown filter state
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    if (typeDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [typeDropdownOpen]);

  // Séparation Actifs vs Corbeille
  const activeBackups = backups.filter((b) => !b.is_deleted);
  const trashBackups = backups.filter((b) => b.is_deleted);

  // Filtrage
  const currentList = activeTab === 'active' ? activeBackups : trashBackups;
  const filteredBackups = currentList.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.filename.toLowerCase().includes(q) ||
      b.created_at.includes(q);
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'auto'
        ? b.backup_type === 'auto'
        : b.backup_type === 'manual';
    return matchesSearch && matchesType;
  });

  // Déclencher un backup instantané
  const handleInstantBackup = async () => {
    setIsInstantLoading(true);
    setInstantSuccessMsg(null);
    setInstantErrorMsg(null);

    try {
      const res = await createInstantBackup();
      setInstantSuccessMsg(res?.message || 'Sauvegarde instantanée générée et chiffrée avec succès !');
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

  const typeLabel =
    filterType === 'auto'
      ? 'Automatique'
      : filterType === 'manual'
      ? 'Instantané'
      : 'Tous les types';

  return (
    <div className="space-y-4">
      {/* Alertes de confirmation / erreur */}
      {instantSuccessMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-sm font-medium text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{instantSuccessMsg}</span>
        </div>
      )}
      {instantErrorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm font-medium text-red-700 dark:text-red-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{instantErrorMsg}</span>
        </div>
      )}

      {/* ── Ligne 1 : Recherche + Boutons d'action (Design Caposa) ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        {/* Champ de recherche */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nom de fichier, date..."
            className="w-full h-11 pl-10 pr-10 text-sm border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] placeholder:text-gray-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleInstantBackup}
            disabled={isInstantLoading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {isInstantLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Création...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Sauvegarde Instantanée</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSchedule}
            className="flex items-center gap-2 h-11 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs"
          >
            <Clock className="w-4 h-4 text-[#2E7D32]" />
            <span>Planification (Auto)</span>
          </button>

          <button
            onClick={onRefresh}
            title="Actualiser la liste"
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Ligne 2 : Filtres & Compteurs (Design Caposa) ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-zinc-400">Résultats</span>
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/40 dark:text-[#81C784]">
            {filteredBackups.length}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800" />

        {/* Dropdown Filtre Type */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all cursor-pointer ${
              filterType !== 'all'
                ? 'bg-[#DDEAD5] border-[#2E7D32]/30 text-[#1B5E20] font-medium dark:bg-[#1B5E20]/30 dark:text-[#81C784]'
                : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{typeLabel}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {typeDropdownOpen && (
            <div className="absolute left-0 mt-2 z-50 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 py-1 min-w-[190px] animate-in fade-in">
              <button
                onClick={() => { setFilterType('all'); setTypeDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Tous les types
              </button>
              <button
                onClick={() => { setFilterType('auto'); setTypeDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Automatique (Cron / Celery)
              </button>
              <button
                onClick={() => { setFilterType('manual'); setTypeDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Instantané (Manuel)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tableau Card (Design Caposa) ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Onglets en haut de tableau avec bordure inférieure active */}
        <div className="flex items-center gap-1 px-5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 cursor-pointer ${
              activeTab === 'active'
                ? 'border-[#2E7D32] text-[#1B5E20] dark:text-[#81C784] font-semibold'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>Sauvegardes actives</span>
            {activeBackups.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                  activeTab === 'active'
                    ? 'bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/40 dark:text-[#81C784]'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                }`}
              >
                {activeBackups.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 cursor-pointer ${
              activeTab === 'trash'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5 shrink-0" />
            <span>Corbeille</span>
            {trashBackups.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                  activeTab === 'trash'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                }`}
              >
                {trashBackups.length}
              </span>
            )}
          </button>
        </div>

        {/* Bannière Corbeille si on est dans l'onglet corbeille */}
        {activeTab === 'trash' && (
          <div className="flex items-start gap-3 px-5 py-3 bg-gray-50 dark:bg-zinc-800/40 border-b border-gray-200 dark:border-zinc-800">
            <Archive className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Corbeille des sauvegardes (Soft delete)
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Les fichiers restent sur le serveur et peuvent être restaurés ou supprimés définitivement du disque.
              </p>
            </div>
          </div>
        )}

        {/* En-tête des colonnes avec gradient Caposa & Scrollbar masquée (hover uniquement) */}
        <div className="overflow-x-auto table-scroll">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] dark:from-zinc-800 dark:to-zinc-800/80 border-b border-gray-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-300">
              <tr>
                <th className="py-3 px-5">Fichier & Sécurité</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Taille</th>
                <th className="py-3 px-5">Date & Heure</th>
                <th className="py-3 px-5">Statut</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-gray-500 dark:text-zinc-400">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2E7D32]" />
                      <span className="text-sm font-medium">Chargement des sauvegardes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBackups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-[#DDEAD5] dark:bg-zinc-800 text-[#2E7D32] dark:text-[#4CAF50]">
                        <Database className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {activeTab === 'active' ? 'Aucune sauvegarde active trouvée' : 'La corbeille est vide'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-sm">
                        {activeTab === 'active'
                          ? 'Cliquez sur "Sauvegarde Instantanée" pour créer un backup maintenant ou planifiez une tâche.'
                          : 'Les sauvegardes mises à la corbeille apparaîtront ici.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBackups.map((backup) => (
                  <tr
                    key={backup.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Fichier & Chiffrement */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#DDEAD5]/60 text-[#1B5E20] dark:bg-[#1B5E20]/30 dark:text-[#81C784]">
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
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/50 dark:text-[#81C784]"
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
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {backup.backup_type === 'auto' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-[#355C7D] dark:text-blue-300">
                          <Clock className="w-3 h-3" />
                          Automatique
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF9EC] dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                          <Zap className="w-3 h-3" />
                          Instantané
                        </span>
                      )}
                    </td>

                    {/* Taille */}
                    <td className="py-3.5 px-5 whitespace-nowrap font-medium text-gray-800 dark:text-zinc-200">
                      {backup.formatted_size || 'N/A'}
                    </td>

                    {/* Date & Heure */}
                    <td className="py-3.5 px-5 whitespace-nowrap text-gray-600 dark:text-zinc-400">
                      {formatDate(backup.created_at)}
                    </td>

                    {/* Statut */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {backup.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/40 dark:text-[#81C784]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                          Succès
                        </span>
                      ) : backup.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#355C7D]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          En cours
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Échec
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {activeTab === 'active' ? (
                          <>
                            <button
                              onClick={() => handleDownload(backup)}
                              disabled={downloadingId === backup.id}
                              title="Télécharger le fichier chiffré"
                              className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-[#2E7D32] hover:bg-[#DDEAD5]/50 transition-all cursor-pointer"
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
                              className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
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
                              className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-[#2E7D32] hover:bg-[#DDEAD5]/50 transition-all cursor-pointer"
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
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
