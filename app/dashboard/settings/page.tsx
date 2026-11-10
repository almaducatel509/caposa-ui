'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Database,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '@/app/components/header';
import { RoleGate } from '@/app/components/core/RoleGate';
import BackupsTable from '@/app/components/settings/BackupsTable';
import BackupScheduleModal from '@/app/components/settings/BackupScheduleModal';
import DeleteBackupModal from '@/app/components/settings/DeleteBackupModal';
import {
  DatabaseBackup,
  BackupSchedule,
  fetchBackups,
  fetchBackupSchedule,
} from '@/app/lib/api/backups';

export default function SettingsPage() {
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
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
      const [backupsData, scheduleData] = await Promise.all([
        fetchBackups(true), // inclure la corbeille
        fetchBackupSchedule().catch(() => null),
      ]);

      setBackups(backupsData);
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
      <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8 flex flex-col gap-6">
        {/* En-tête standard Caposa (100% identique à Gestion des Comptes) */}
        <PageHeader
          title="Gestion des Sauvegardes"
          subtitle="Consultez et gérez les sauvegardes de la base de données"
          icon={<Database className="w-6 h-6 text-[#2E7D32]" />}
          className="mb-0"
        />

        {/* Message d'alerte si échec API */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm font-medium text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="font-semibold">Erreur de communication avec le serveur</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Tableau des Sauvegardes & Filtres (Structure identique à AccountTable) */}
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
