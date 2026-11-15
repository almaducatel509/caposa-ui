'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, Check, Loader2, Terminal, AlertTriangle } from 'lucide-react';
import {
  CaisseScheduleConfig,
  fetchCaisseScheduleConfig,
  updateCaisseScheduleConfig,
} from '@/app/lib/api/caisse';

interface CaisseScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: CaisseScheduleConfig) => void;
}

export default function CaisseScheduleModal({
  isOpen,
  onClose,
  onSuccess,
}: CaisseScheduleModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(true);
  const [time, setTime] = useState('22:00');
  const [cronExpression, setCronExpression] = useState('0 22 * * *');
  const [frequency, setFrequency] = useState<'daily' | 'workdays' | 'custom'>('daily');
  const [maxDuration, setMaxDuration] = useState<number | ''>(24);
  const [idleTimeout, setIdleTimeout] = useState<number | ''>(2);
  const [forceCloseAtEod, setForceCloseAtEod] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const config = await fetchCaisseScheduleConfig();
        setAutoCloseEnabled(config.auto_close_enabled ?? (config as any).is_active ?? true);
        const expr = config.cron_expression || '0 22 * * *';
        setCronExpression(expr);

        const loadedMaxDuration = config.max_session_duration_hours ?? (config as any).max_duration_hours;
        if (loadedMaxDuration !== undefined && loadedMaxDuration !== null) {
          setMaxDuration(Number(loadedMaxDuration) || 24);
        }

        const loadedIdleTimeout = config.idle_timeout_hours ?? (config as any).inactivity_threshold_hours;
        if (loadedIdleTimeout !== undefined && loadedIdleTimeout !== null) {
          setIdleTimeout(Number(loadedIdleTimeout) || 2);
        }

        setForceCloseAtEod(config.force_close_at_eod ?? (config as any).auto_interrupt ?? true);

        // Déduit l'heure depuis l'expression cron
        const parts = expr.trim().split(/\s+/);
        if (parts.length >= 2) {
          const m = parts[0].padStart(2, '0');
          const h = parts[1].padStart(2, '0');
          if (!isNaN(Number(h)) && !isNaN(Number(m))) {
            setTime(`${h}:${m}`);
          }
        }

        // Déduit la fréquence
        if (parts.length === 5) {
          if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
            setFrequency('daily');
          } else if (parts[2] === '*' && parts[3] === '*' && (parts[4] === '1-5' || parts[4] === 'MON-FRI')) {
            setFrequency('workdays');
          } else {
            setFrequency('custom');
          }
        } else {
          setFrequency('custom');
        }

        if (config.updated_at) {
          setLastUpdated(
            `Mis à jour le ${new Date(config.updated_at).toLocaleString('fr-FR')} par ${config.updated_by || 'Admin'}`
          );
        }
      } catch (err: any) {
        console.error('Erreur chargement planification caisse:', err);
        setError(err.message || 'Impossible de charger la configuration');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (!newTime || !newTime.includes(':')) return;
    const [h, m] = newTime.split(':');
    if (h === '' || m === '') return;
    const hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    if (isNaN(hour) || isNaN(minute)) return;

    if (frequency === 'daily') {
      setCronExpression(`${minute} ${hour} * * *`);
    } else if (frequency === 'workdays') {
      setCronExpression(`${minute} ${hour} * * 1-5`);
    }
  };

  const handleFrequencyChange = (newFreq: 'daily' | 'workdays' | 'custom') => {
    setFrequency(newFreq);
    if (newFreq === 'custom') return;
    const [h, m] = (time || '22:00').split(':');
    const hour = parseInt(h || '22', 10);
    const minute = parseInt(m || '0', 10);

    if (newFreq === 'daily') {
      setCronExpression(`${minute} ${hour} * * *`);
    } else if (newFreq === 'workdays') {
      setCronExpression(`${minute} ${hour} * * 1-5`);
    }
  };

  const handleCronChange = (newCron: string) => {
    setCronExpression(newCron);
    setFrequency('custom');
    const parts = newCron.trim().split(/\s+/);
    if (parts.length >= 2) {
      const m = parts[0];
      const h = parts[1];
      if (!isNaN(Number(h)) && !isNaN(Number(m)) && Number(h) >= 0 && Number(h) < 24 && Number(m) >= 0 && Number(m) < 60) {
        setTime(`${h.padStart(2, '0')}:${m.padStart(2, '0')}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const finalMaxDuration = typeof maxDuration === 'number' && maxDuration > 0 ? maxDuration : 24;
    const finalIdleTimeout = typeof idleTimeout === 'number' && idleTimeout > 0 ? idleTimeout : 2;
    const finalCron = cronExpression.trim() || '0 22 * * *';
    const finalTime = time || '22:00';

    try {
      const updated = await updateCaisseScheduleConfig({
        auto_close_enabled: autoCloseEnabled,
        cron_expression: finalCron,
        max_session_duration_hours: finalMaxDuration,
        idle_timeout_hours: finalIdleTimeout,
        force_close_at_eod: forceCloseAtEod,
        // Compatibilité avec les champs backend Django
        is_active: autoCloseEnabled,
        auto_interrupt: forceCloseAtEod,
        max_duration_hours: finalMaxDuration,
        inactivity_threshold_hours: finalIdleTimeout,
        closing_time: finalTime.length === 5 ? `${finalTime}:00` : finalTime,
      } as any);

      if (onSuccess) onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 dark:bg-[#4CAF50]/15 text-[#2E7D32] dark:text-[#4CAF50] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Planification Cron — Sessions de Caisse
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Audit automatique et clôture forcée des sessions caisse
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

        {/* Corps */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#2E7D32]" />
            <p className="text-xs text-gray-500">Chargement de la configuration...</p>
          </div>
        ) : (
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
                  <label htmlFor="auto-close-toggle" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                    Activer la clôture automatique (Cron)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    Vérifie et clôture automatiquement les caisses restées ouvertes hors horaires
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="auto-close-toggle"
                    type="checkbox"
                    checked={autoCloseEnabled}
                    onChange={(e) => setAutoCloseEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E7D32]"></div>
                </label>
              </div>

              {/* Périodicité */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                  Fréquence d'exécution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'daily', label: 'Tous les jours' },
                    { id: 'workdays', label: 'Jours ouvrés (Lun-Ven)' },
                    { id: 'custom', label: 'Cron personnalisé' },
                  ].map((f) => {
                    const isSelected = frequency === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleFrequencyChange(f.id as any)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
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

              {/* Heure d'exécution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="caisse-time-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
                    Heure d'audit EOD
                  </label>
                  <input
                    id="caisse-time-input"
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    onBlur={() => {
                      if (!time) {
                        setTime('22:00');
                        if (frequency === 'daily') {
                          setCronExpression('0 22 * * *');
                        } else if (frequency === 'workdays') {
                          setCronExpression('0 22 * * 1-5');
                        }
                      }
                    }}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                  />
                  <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 block">Heure de clôture quotidienne</span>
                </div>

                <div>
                  <label htmlFor="idle-timeout-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
                    Inactivité max hors horaires
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="idle-timeout-input"
                      type="number"
                      min={1}
                      max={24}
                      value={idleTimeout}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setIdleTimeout('');
                        } else {
                          const parsed = parseInt(val, 10);
                          setIdleTimeout(isNaN(parsed) ? '' : parsed);
                        }
                      }}
                      onBlur={() => {
                        if (idleTimeout === '' || Number(idleTimeout) < 1) {
                          setIdleTimeout(2);
                        }
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                    />
                    <span className="text-sm font-medium text-gray-500">heures</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 block">Clôture après fermeture succursale</span>
                </div>
              </div>

              {/* Durée max autorisée */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="max-duration-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
                    Durée maximale absolue
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="max-duration-input"
                      type="number"
                      min={1}
                      max={72}
                      value={maxDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setMaxDuration('');
                        } else {
                          const parsed = parseInt(val, 10);
                          setMaxDuration(isNaN(parsed) ? '' : parsed);
                        }
                      }}
                      onBlur={() => {
                        if (maxDuration === '' || Number(maxDuration) < 1) {
                          setMaxDuration(24);
                        }
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                    />
                    <span className="text-sm font-medium text-gray-500">heures</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 block">Forcé même sans inactivité (défaut: 24h)</span>
                </div>

                <div className="flex flex-col justify-center pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceCloseAtEod}
                      onChange={(e) => setForceCloseAtEod(e.target.checked)}
                      className="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
                    />
                    <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                      Forcer la fermeture en fin de journée (EOD)
                    </span>
                  </label>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 pl-6">
                    Même si le caissier n'a pas fermé manuellement
                  </span>
                </div>
              </div>

              {/* Expression Cron */}
              <div>
                <label htmlFor="caisse-cron-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
                  Expression Cron système
                </label>
                <div className="relative">
                  <Terminal className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="caisse-cron-input"
                    type="text"
                    value={cronExpression}
                    onChange={(e) => handleCronChange(e.target.value)}
                    onBlur={() => {
                      if (!cronExpression.trim()) {
                        setCronExpression('0 22 * * *');
                        setFrequency('daily');
                      }
                    }}
                    placeholder="0 22 * * *"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                  Commande exécutée : <code className="font-mono text-gray-600 dark:text-zinc-300">python manage.py check_sessions</code>
                </p>
              </div>

              {/* Info & Sécurité */}
              <div className="flex items-start gap-2.5 p-3.5 bg-[#DDEAD5]/40 dark:bg-[#1B5E20]/20 border border-[#2E7D32]/20 rounded-xl text-xs text-[#1B5E20] dark:text-[#81C784] font-medium leading-relaxed">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#2E7D32] dark:text-[#4CAF50] mt-0.5" />
                <span>
                  Lorsqu'une session est clôturée par le cron, le montant théorique calculé depuis les dépôts et retraits réels est enregistré avec le statut <strong>fermée</strong> et le motif <code>FERMETURE_AUTO_CRON</code>.
                </span>
              </div>

              {lastUpdated && (
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 text-center">
                  {lastUpdated}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
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
        )}
      </div>
    </div>
  );
}
