'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, Check, Loader2, Terminal, Info } from 'lucide-react';
import { BackupSchedule, updateBackupSchedule } from '@/app/lib/api/backups';

interface BackupScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: BackupSchedule | null;
  onSuccess: (updated: BackupSchedule) => void;
}

export default function BackupScheduleModal({
  isOpen,
  onClose,
  schedule,
  onSuccess,
}: BackupScheduleModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop flou */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* ── En-tête officiel Caposa ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 dark:bg-[#4CAF50]/15 text-[#2E7D32] dark:text-[#4CAF50] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Planification des Sauvegardes
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Sauvegardes programmées avec Celery Beat & Cron système
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Corps du Formulaire ── */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Toggle Activer / Désactiver */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
              <div>
                <label htmlFor="active-toggle" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                Périodicité
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'daily', label: 'Quotidienne' },
                  { id: 'weekly', label: 'Hebdo' },
                  { id: 'monthly', label: 'Mensuelle' },
                  { id: 'custom', label: 'Cron custom' },
                ].map((f) => {
                  const isSelected = frequency === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFrequencyChange(f.id as any)}
                      className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#DDEAD5] border-[#2E7D32]/40 text-[#1B5E20] dark:bg-[#1B5E20]/40 dark:text-[#81C784]'
                          : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heure d'exécution & Rétention */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="time-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
                  Heure d'exécution
                </label>
                <div className="relative">
                  <input
                    id="time-input"
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                  />
                </div>
                <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 block">Heure locale du serveur</span>
              </div>

              <div>
                <label htmlFor="retention-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
                  Rétention (jours)
                </label>
                <input
                  id="retention-input"
                  type="number"
                  min={1}
                  max={365}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value, 10) || 30)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                />
                <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 block">Nettoyage automatique</span>
              </div>
            </div>

            {/* Expression Cron */}
            <div>
              <label htmlFor="cron-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
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
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Commande cron serveur : <code className="font-mono text-gray-600 dark:text-zinc-300">python manage.py run_db_backup --type auto</code>
              </p>
            </div>

            {/* Note de sécurité & chiffrement */}
            <div className="flex items-start gap-2.5 p-3.5 bg-[#DDEAD5]/40 dark:bg-[#1B5E20]/20 border border-[#2E7D32]/20 rounded-xl text-xs text-[#1B5E20] dark:text-[#81C784] font-medium leading-relaxed">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#2E7D32] dark:text-[#4CAF50] mt-0.5" />
              <span>
                Toutes les sauvegardes créées sont immédiatement chiffrées en <strong>AES-256</strong> avant d'être écrites sur le disque serveur avec des permissions restreintes (0600).
              </span>
            </div>
          </div>

          {/* ── Footer standard Caposa (Annuler à gauche, Enregistrer en vert dégradé à droite) ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
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
