'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Settings,
  Database,
  Lock,
  Server,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { RoleGate } from '@/app/components/core/RoleGate';
import BackupStatsCards from '@/app/components/settings/BackupStatsCards';
import BackupsTable from '@/app/components/settings/BackupsTable';
import BackupScheduleModal from '@/app/components/settings/BackupScheduleModal';
import DeleteBackupModal from '@/app/components/settings/DeleteBackupModal';
import {
  DatabaseBackup,
  BackupStats,
  BackupSchedule,
  fetchBackups,
  fetchBackupStats,
  fetchBackupSchedule,
} from '@/app/lib/api/backups';

export default function SettingsPage() {
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetBackup, setTargetBackup] = useState<DatabaseBackup | null>(null);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'hard'>('soft');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [backupsData, statsData, scheduleData] = await Promise.all([
        fetchBackups(true), // inclure la corbeille
        fetchBackupStats(),
        fetchBackupSchedule(),
      ]);

      setBackups(backupsData);
      setStats(statsData);
      setSchedule(scheduleData);
    } catch (err: any) {
      console.error('Erreur chargement données paramètres:', err);
      setError(
        err?.response?.data?.error ||
        err?.message ||
        'Impossible de charger les données de sauvegarde.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDelete = (backup: DatabaseBackup, mode: 'soft' | 'hard') => {
    setTargetBackup(backup);
    setDeleteMode(mode);
    setIsDeleteOpen(true);
  };

  const handleScheduleSuccess = (updated: BackupSchedule) => {
    setSchedule(updated);
    loadData();
  };

  const handleDeleteSuccess = () => {
    loadData();
  };

  return (
    <RoleGate
      roles={['administrateur', 'admin']}
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Accès réservé aux administrateurs
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md">
            Cette section contient des opérations sensibles de sauvegarde et de restauration de la base de données système.
            Seuls les administrateurs ont l&apos;autorisation d&apos;y accéder.
          </p>
        </div>
      }
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* En-tête de la page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>Paramètres & Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Sauvegardes de la Base de Données
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
              Système de chiffrement <span className="font-semibold text-emerald-600 dark:text-emerald-400">AES-256</span>, archivage sécurisé sur le serveur, planification automatique via <span className="font-semibold">Celery / Cron</span> et instantanée.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Chiffrement Actif
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 text-xs font-semibold">
              <Server className="w-3.5 h-3.5" />
              Stockage Serveur
            </span>
          </div>
        </div>

        {/* Message d'erreur si échec API */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Erreur de chargement</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-200 rounded-lg text-xs font-semibold transition"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* KPI & Stats Cards */}
        <BackupStatsCards
          stats={stats}
          isLoading={isLoading}
          onOpenSchedule={() => setIsScheduleOpen(true)}
        />

        {/* Tableau des Sauvegardes & Actions */}
        <BackupsTable
          backups={backups}
          isLoading={isLoading}
          onRefresh={loadData}
          onOpenSchedule={() => setIsScheduleOpen(true)}
          onOpenDelete={handleOpenDelete}
        />

        {/* Modal de Planification Automatique */}
        <BackupScheduleModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          schedule={schedule}
          onSuccess={handleScheduleSuccess}
        />

        {/* Modal de Suppression (Soft vs Hard) */}
        <DeleteBackupModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          backup={targetBackup}
          mode={deleteMode}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </RoleGate>
  );
}
