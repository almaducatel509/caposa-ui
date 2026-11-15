'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Database,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '@/app/components/header';
import { RoleGate } from '@/app/components/core/RoleGate';
import BackupsTable from '@/app/components/settings/BackupsTable';
import BackupScheduleModal from '@/app/components/settings/BackupScheduleModal';
import DeleteBackupModal from '@/app/components/settings/DeleteBackupModal';
import CaisseScheduleModal from '@/app/components/sessions/modals/CaisseScheduleModal';
import DashboardRefreshSettingsCard from '@/app/components/settings/DashboardRefreshSettingsCard';
import CaisseScheduleSettingsCard from '@/app/components/settings/CaisseScheduleSettingsCard';
import {
  DatabaseBackup,
  BackupSchedule,
  fetchBackups,
  fetchBackupSchedule,
} from '@/app/lib/api/backups';

type SettingsTab = 'refresh' | 'backup' | 'caisse_cron';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('refresh');
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isCaisseScheduleOpen, setIsCaisseScheduleOpen] = useState(false);
  const [targetBackup, setTargetBackup] = useState<DatabaseBackup | null>(null);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'hard'>('soft');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Synchronisation avec l'URL (si paramètre tab= dans le hash ou search)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as SettingsTab;
      if (tabParam && ['refresh', 'backup', 'caisse_cron'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

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
            Cette section contient des opérations sensibles de configuration, de sauvegarde et de surveillance système.
            Seuls les administrateurs ont l&apos;autorisation d&apos;y accéder.
          </p>
        </div>
      }
    >
      <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-3 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* En-tête standard Caposa dynamique selon l'onglet actif */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <PageHeader
            title={
              activeTab === 'refresh'
                ? 'Paramètres — Rafraîchissement Dashboard'
                : activeTab === 'backup'
                ? 'Paramètres — Sauvegardes & Restauration'
                : 'Paramètres — Cron Sessions de Caisse'
            }
            subtitle={
              activeTab === 'refresh'
                ? "Configuration de l'intervalle d'actualisation automatique des indicateurs du tableau de bord"
                : activeTab === 'backup'
                ? 'Gestion des sauvegardes manuelles et automatisées de la base de données PostgreSQL'
                : 'Planification automatique et clôture forcée des sessions de caisse restées ouvertes'
            }
            icon={
              activeTab === 'refresh' ? (
                <RefreshCw className="w-6 h-6 text-[#2E7D32]" />
              ) : activeTab === 'backup' ? (
                <Database className="w-6 h-6 text-[#2E7D32]" />
              ) : (
                <Clock className="w-6 h-6 text-[#2E7D32]" />
              )
            }
            className="mb-0"
          />
        </div>

        {/* ── Barre d'onglets (Navigation par onglets) ── */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100/90 dark:bg-zinc-800/90 rounded-2xl border border-gray-200/80 dark:border-zinc-700/80 w-full sm:w-fit overflow-x-auto shadow-xs">
          {/* Onglet 1 : Rafraîchissement */}
          <button
            type="button"
            onClick={() => setActiveTab('refresh')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'refresh'
                ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700/60'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rafraîchissement</span>
          </button>

          {/* Onglet 2 : Backup */}
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Sauvegardes (Backup)</span>
            {backups.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTab === 'backup'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300'
                }`}
              >
                {backups.filter((b) => !b.is_deleted).length}
              </span>
            )}
          </button>

          {/* Onglet 3 : Cron session */}
          <button
            type="button"
            onClick={() => setActiveTab('caisse_cron')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'caisse_cron'
                ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Cron Sessions de Caisse</span>
          </button>
        </div>

        {/* ── Contenu selon l'onglet actif ── */}

        {/* 1. Onglet Rafraîchissement */}
        {activeTab === 'refresh' && (
          <div className="animate-in fade-in duration-200">
            <DashboardRefreshSettingsCard />
          </div>
        )}

        {/* 2. Onglet Sauvegardes (Backup) */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-in fade-in duration-200">
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

            <BackupsTable
              backups={backups}
              isLoading={isLoading}
              onRefresh={loadData}
              onOpenSchedule={() => setIsScheduleOpen(true)}
              onOpenDelete={handleOpenDelete}
            />

            {/* Modaux pour Backup */}
            <BackupScheduleModal
              isOpen={isScheduleOpen}
              onClose={() => setIsScheduleOpen(false)}
              schedule={schedule}
              onSuccess={handleScheduleSuccess}
            />

            <DeleteBackupModal
              isOpen={isDeleteOpen}
              onClose={() => setIsDeleteOpen(false)}
              backup={targetBackup}
              mode={deleteMode}
              onSuccess={handleDeleteSuccess}
            />
          </div>
        )}

        {/* 3. Onglet Cron Sessions de Caisse */}
        {activeTab === 'caisse_cron' && (
          <div className="animate-in fade-in duration-200">
            <CaisseScheduleSettingsCard />
          </div>
        )}

        {/* Modal de Planification Cron Caisse (gardé pour les déclencheurs annexes) */}
        <CaisseScheduleModal
          isOpen={isCaisseScheduleOpen}
          onClose={() => setIsCaisseScheduleOpen(false)}
        />
      </div>
    </RoleGate>
  );
}
