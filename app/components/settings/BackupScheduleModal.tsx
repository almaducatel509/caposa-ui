'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, ShieldCheck, Check, Loader2, Terminal, Info } from 'lucide-react';
import { BackupSchedule, updateBackupSchedule } from '@/app/lib/api/backups';

interface BackupScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: BackupSchedule | null;
  onSuccess: (updated: BackupSchedule) => void;
}

export default function BackupScheduleModal({ isOpen, onClose, schedule, onSuccess }: BackupScheduleModalProps) {
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [time, setTime] = useState('02:00');
  const [cronExpression, setCronExpression] = useState('0 2 * * *');
  const [retentionDays, setRetentionDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schedule) {
      setIsActive(schedule.is_active);
      setFrequency(schedule.frequency);
      setTime(schedule.time ? schedule.time.slice(0, 5) : '02:00');
      setCronExpression(schedule.cron_expression || '0 2 * * *');
      setRetentionDays(schedule.retention_days || 30);
    }
  }, [schedule, isOpen]);

  // Synchronise automatiquement l'expression cron en fonction de l'heure et de la fréquence
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    const [h, m] = newTime.split(':');
    const hour = parseInt(h || '2', 10);
    const minute = parseInt(m || '0', 10);

    if (frequency === 'daily') {
      setCronExpression(`${minute} ${hour} * * *`);
    } else if (frequency === 'weekly') {
      setCronExpression(`${minute} ${hour} * * 1`);
    } else if (frequency === 'monthly') {
      setCronExpression(`${minute} ${hour} 1 * *`);
    }
  };

  const handleFrequencyChange = (newFreq: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    setFrequency(newFreq);
    const [h, m] = time.split(':');
    const hour = parseInt(h || '2', 10);
    const minute = parseInt(m || '0', 10);

    if (newFreq === 'daily') {
      setCronExpression(`${minute} ${hour} * * *`);
    } else if (newFreq === 'weekly') {
      setCronExpression(`${minute} ${hour} * * 1`);
    } else if (newFreq === 'monthly') {
      setCronExpression(`${minute} ${hour} 1 * *`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await updateBackupSchedule({
        is_active: isActive,
        frequency,
        time: `${time}:00`,
        cron_expression: cronExpression,
        retention_days: retentionDays,
      });
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la planification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {/* ── En-tête ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] dark:text-[#4CAF50] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                Planification Automatique (Option 1)
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Sauvegardes programmées avec Celery Beat & Cron job système
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Toggle Activer / Désactiver */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
            <div>
              <label htmlFor="active-toggle" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 cursor-pointer">
                Activer les sauvegardes automatiques
              </label>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Exécution planifiée en arrière-plan sans intervention humaine
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="active-toggle"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E7D32]"></div>
            </label>
          </div>

          {/* Fréquence */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-2">
              Périodicité
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'daily', label: 'Quotidienne' },
                { id: 'weekly', label: 'Hebdo' },
                { id: 'monthly', label: 'Mensuelle' },
                { id: 'custom', label: 'Cron custom' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFrequencyChange(f.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    frequency === f.id
                      ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32] dark:text-[#81C784]'
                      : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heure d'exécution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="time-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Heure d'exécution
              </label>
              <input
                id="time-input"
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-[#2E7D32]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Heure locale du serveur</span>
            </div>

            <div>
              <label htmlFor="retention-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Rétention (jours)
              </label>
              <input
                id="retention-input"
                type="number"
                min={1}
                max={365}
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-[#2E7D32]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Nettoyage automatique</span>
            </div>
          </div>

          {/* Expression Cron */}
          <div>
            <label htmlFor="cron-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
              Expression Cron
            </label>
            <div className="relative">
              <Terminal className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="cron-input"
                type="text"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="0 2 * * *"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono text-gray-900 dark:text-zinc-100 outline-none focus:border-[#2E7D32]"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Commande cron serveur : <code className="text-gray-600 dark:text-zinc-300">python manage.py run_db_backup --type auto</code>
            </p>
          </div>

          {/* Note de sécurité */}
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#2E7D32] dark:text-[#4CAF50] mt-0.5" />
            <span>
              Toutes les sauvegardes créées sont immédiatement chiffrées en <strong>AES-256</strong> avant d'être écrites sur le disque serveur avec des permissions restreintes (0600).
            </span>
          </div>

          {/* ── Boutons d'action ── */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-sm font-semibold text-white shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement…</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistrer la planification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
