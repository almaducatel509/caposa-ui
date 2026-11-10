'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Database,
  Lock,
  Server,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '@/app/components/header';
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
      <div className="w-full space-y-6">
        {/* En-tête standard Caposa (identique à Comptes, Employés, Membres) */}
        <PageHeader
          title="Gestion des Sauvegardes"
          subtitle="Sauvegardes chiffrées AES-256, archivage serveur, planification Celery & instantanée"
          icon={
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 dark:bg-[#4CAF50]/15 flex items-center justify-center text-[#2E7D32] dark:text-[#4CAF50]">
              <Database className="w-5 h-5" />
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/40 dark:text-[#81C784] text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Chiffrement AES-256
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#355C7D] dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold">
                <Server className="w-3.5 h-3.5" />
                Stockage Serveur
              </span>
            </div>
          }
          className="mb-0"
        />

        {/* Message d'alerte si échec API */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm font-medium text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="font-semibold">Erreur de communication avec le serveur</p>
              <p className="text-xs mt-0.5">{error}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Astuce : Vérifiez que Gunicorn a bien été redémarré sur le VPS (ex: <code className="bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded font-mono">sudo systemctl restart caposa-backend</code>).
              </p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 text-red-800 dark:text-red-200 rounded-lg text-xs font-semibold transition cursor-pointer"
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

        {/* Tableau des Sauvegardes & Filtres (Design Caposa) */}
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
