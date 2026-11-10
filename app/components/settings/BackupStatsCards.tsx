'use client';

import React from 'react';
import { Database, ShieldCheck, Clock, HardDrive, CalendarCheck, AlertTriangle } from 'lucide-react';
import { BackupStats } from '@/app/lib/api/backups';

interface BackupStatsCardsProps {
  stats: BackupStats | null;
  isLoading: boolean;
  onOpenSchedule: () => void;
}

export default function BackupStatsCards({ stats, isLoading, onOpenSchedule }: BackupStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 animate-pulse" />
        ))}
      </div>
    );
  }

  const { active_count, formatted_total_size, last_backup, schedule, trash_count } = stats;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Aucune";
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFrequencyLabel = () => {
    if (!schedule.is_active) return "Désactivée";
    switch (schedule.frequency) {
      case 'daily':
        return `Tous les jours à ${schedule.time.slice(0, 5)}`;
      case 'weekly':
        return `Hebdomadaire à ${schedule.time.slice(0, 5)}`;
      case 'monthly':
        return `Mensuelle à ${schedule.time.slice(0, 5)}`;
      case 'custom':
        return `Cron (${schedule.cron_expression})`;
      default:
        return `À ${schedule.time.slice(0, 5)}`;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ── 1. Sauvegarde automatique ── */}
      <div
        onClick={onOpenSchedule}
        className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xs hover:border-[#2E7D32]/40 dark:hover:border-[#2E7D32]/40 transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Sauvegarde Auto
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            schedule.is_active ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${schedule.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <p className="text-base font-bold text-gray-900 dark:text-zinc-100">
              {schedule.is_active ? "Automatique Active" : "Désactivée"}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium">
            {getFrequencyLabel()}
          </p>
        </div>
      </div>

      {/* ── 2. Dernière sauvegarde ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Dernier Backup
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-zinc-100">
            {formatDate(last_backup?.created_at)}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            {last_backup ? `${last_backup.formatted_size} • ${last_backup.backup_type === 'auto' ? 'Auto' : 'Instantané'}` : 'Aucun backup réalisé'}
          </p>
        </div>
      </div>

      {/* ── 3. Stockage utilisé ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Espace Serveur
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-zinc-100">
            {formatted_total_size}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            {active_count} archive{active_count > 1 ? 's' : ''} active{active_count > 1 ? 's' : ''} {trash_count > 0 ? `(${trash_count} en corbeille)` : ''}
          </p>
        </div>
      </div>

      {/* ── 4. Chiffrement de sécurité ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Chiffrement DB
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span>AES-256</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
              Actif
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Fichiers chiffrés sur le serveur
          </p>
        </div>
      </div>
    </div>
  );
}
