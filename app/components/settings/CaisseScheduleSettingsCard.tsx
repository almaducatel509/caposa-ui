'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  Check,
  Loader2,
  Terminal,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Calendar,
  Hourglass,
} from 'lucide-react';
import {
  CaisseScheduleConfig,
  fetchCaisseScheduleConfig,
  updateCaisseScheduleConfig,
} from '@/app/lib/api/caisse';

export default function CaisseScheduleSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(true);
  const [time, setTime] = useState('22:00');
  const [cronExpression, setCronExpression] = useState('0 22 * * *');
  const [frequency, setFrequency] = useState<'daily' | 'workdays' | 'custom'>('daily');
  const [maxDuration, setMaxDuration] = useState<number | ''>(24);
  const [idleTimeout, setIdleTimeout] = useState<number | ''>(2);
  const [forceCloseAtEod, setForceCloseAtEod] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await fetchCaisseScheduleConfig();
      setAutoCloseEnabled(config.auto_close_enabled ?? (config as any).is_active ?? true);
      const expr = config.cron_expression || '0 22 * * *';
      setCronExpression(expr);

      const loadedMaxDuration =
        config.max_session_duration_hours ?? (config as any).max_duration_hours;
      if (loadedMaxDuration !== undefined && loadedMaxDuration !== null) {
        setMaxDuration(Number(loadedMaxDuration) || 24);
      }

      const loadedIdleTimeout =
        config.idle_timeout_hours ?? (config as any).inactivity_threshold_hours;
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
        } else if (
          parts[2] === '*' &&
          parts[3] === '*' &&
          (parts[4] === '1-5' || parts[4] === 'MON-FRI')
        ) {
          setFrequency('workdays');
        } else {
          setFrequency('custom');
        }
      } else {
        setFrequency('custom');
      }

      if (config.updated_at) {
        setLastUpdated(
          `Mis à jour le ${new Date(config.updated_at).toLocaleString('fr-FR')} par ${
            config.updated_by || 'Admin'
          }`
        );
      }
    } catch (err: any) {
      console.error('Erreur chargement planification caisse:', err);
      setError(err.message || 'Impossible de charger la configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const notifySaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (!newTime) return;
    const [h, m] = newTime.split(':');
    const minNum = parseInt(m, 10);
    const hourNum = parseInt(h, 10);
    if (isNaN(minNum) || isNaN(hourNum)) return;

    if (frequency === 'daily') {
      setCronExpression(`${minNum} ${hourNum} * * *`);
    } else if (frequency === 'workdays') {
      setCronExpression(`${minNum} ${hourNum} * * 1-5`);
    }
  };

  const handleFrequencyChange = (freq: 'daily' | 'workdays' | 'custom') => {
    setFrequency(freq);
    const [h, m] = (time || '22:00').split(':');
    const minNum = isNaN(parseInt(m, 10)) ? 0 : parseInt(m, 10);
    const hourNum = isNaN(parseInt(h, 10)) ? 22 : parseInt(h, 10);

    if (freq === 'daily') {
      setCronExpression(`${minNum} ${hourNum} * * *`);
    } else if (freq === 'workdays') {
      setCronExpression(`${minNum} ${hourNum} * * 1-5`);
    }
  };

  const handleCronChange = (expr: string) => {
    setCronExpression(expr);
    setFrequency('custom');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: Partial<CaisseScheduleConfig> = {
        auto_close_enabled: autoCloseEnabled,
        cron_expression: cronExpression.trim() || '0 22 * * *',
        max_session_duration_hours:
          maxDuration === '' || Number(maxDuration) < 1 ? 24 : Number(maxDuration),
        idle_timeout_hours:
          idleTimeout === '' || Number(idleTimeout) < 1 ? 2 : Number(idleTimeout),
        force_close_at_eod: forceCloseAtEod,
      };

      const updated = await updateCaisseScheduleConfig(payload);
      if (updated.updated_at) {
        setLastUpdated(
          `Mis à jour le ${new Date(updated.updated_at).toLocaleString('fr-FR')} par ${
            updated.updated_by || 'Admin'
          }`
        );
      }
      notifySaved();
    } catch (err: any) {
      console.error('Erreur sauvegarde cron caisse:', err);
      setError(err.message || 'Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
          Chargement de la planification des sessions de caisse...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
      {/* ── En-tête ── */}
      <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between flex-wrap gap-4 bg-gradient-to-r from-white via-white to-[#DDEAD5]/10 dark:from-zinc-900 dark:to-zinc-900">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DDEAD5] dark:bg-[#1B5E20]/40 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-6 h-6 text-[#2E7D32] dark:text-[#81C784]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Cron & Clôture Automatique des Sessions de Caisse
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  autoCloseEnabled
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    autoCloseEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                  }`}
                />
                {autoCloseEnabled ? 'Cron Activé' : 'Cron Inactif'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Surveillance automatique des caisses, clôture forcée en fin de journée et détection d&apos;inactivité
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Modifications enregistrées</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Activation globale du Cron ── */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
            <div>
              <label
                htmlFor="auto-close-toggle"
                className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer block"
              >
                Activer le Cron d&apos;audit automatique
              </label>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
                Lorsque ce service est actif, le script d&apos;arrière-plan vérifie les heures de fermeture des succursales
                et clôture automatiquement les caisses restées ouvertes hors horaires.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                id="auto-close-toggle"
                type="checkbox"
                checked={autoCloseEnabled}
                onChange={(e) => setAutoCloseEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-[#2E7D32]"></div>
            </label>
          </div>

          {/* ── Fréquence d'exécution ── */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2.5">
              Fréquence d&apos;exécution du cron
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'daily', label: 'Tous les jours', desc: 'Audit quotidien à heure fixe' },
                { id: 'workdays', label: 'Jours ouvrés', desc: 'Du lundi au vendredi uniquement' },
                { id: 'custom', label: 'Expression cron libre', desc: 'Format standard crontab unix' },
              ].map((f) => {
                const isSelected = frequency === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFrequencyChange(f.id as any)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DDEAD5] border-[#2E7D32]/50 text-[#1B5E20] dark:bg-[#1B5E20]/40 dark:text-[#81C784] shadow-xs'
                        : 'bg-white dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{f.label}</p>
                    <p className="text-[11px] opacity-75 mt-0.5">{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Heures & Délais ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Heure EOD */}
            <div className="p-5 rounded-2xl bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[#2E7D32]">
                  <Clock className="w-4 h-4" />
                  <label
                    htmlFor="caisse-time-input"
                    className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-200"
                  >
                    Heure d&apos;audit EOD
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                  Heure quotidienne où le cron force la clôture des caisses restées ouvertes.
                </p>
              </div>
              <div>
                <input
                  id="caisse-time-input"
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  onBlur={() => {
                    if (!time) {
                      setTime('22:00');
                      if (frequency === 'daily') setCronExpression('0 22 * * *');
                      else if (frequency === 'workdays') setCronExpression('0 22 * * 1-5');
                    }
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                />
              </div>
            </div>

            {/* Inactivité max */}
            <div className="p-5 rounded-2xl bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[#2E7D32]">
                  <Hourglass className="w-4 h-4" />
                  <label
                    htmlFor="idle-timeout-input"
                    className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-200"
                  >
                    Inactivité max hors horaires
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                  Ferme une caisse sans transaction après la fermeture de la succursale.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="idle-timeout-input"
                  type="number"
                  min={1}
                  max={24}
                  value={idleTimeout}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setIdleTimeout('');
                    else {
                      const parsed = parseInt(val, 10);
                      setIdleTimeout(isNaN(parsed) ? '' : parsed);
                    }
                  }}
                  onBlur={() => {
                    if (idleTimeout === '' || Number(idleTimeout) < 1) setIdleTimeout(2);
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                />
                <span className="text-xs font-bold text-gray-500 shrink-0">heures</span>
              </div>
            </div>

            {/* Durée maximale absolue */}
            <div className="p-5 rounded-2xl bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[#2E7D32]">
                  <Calendar className="w-4 h-4" />
                  <label
                    htmlFor="max-duration-input"
                    className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-200"
                  >
                    Durée maximale absolue
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                  Plafond absolu forçant la clôture d&apos;une session (même si active).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="max-duration-input"
                  type="number"
                  min={1}
                  max={72}
                  value={maxDuration}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setMaxDuration('');
                    else {
                      const parsed = parseInt(val, 10);
                      setMaxDuration(isNaN(parsed) ? '' : parsed);
                    }
                  }}
                  onBlur={() => {
                    if (maxDuration === '' || Number(maxDuration) < 1) setMaxDuration(24);
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
                />
                <span className="text-xs font-bold text-gray-500 shrink-0">heures</span>
              </div>
            </div>
          </div>

          {/* Option case à cocher : Forcer fermeture EOD */}
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40">
            <input
              id="force-close-eod"
              type="checkbox"
              checked={forceCloseAtEod}
              onChange={(e) => setForceCloseAtEod(e.target.checked)}
              className="w-5 h-5 text-[#2E7D32] rounded-lg focus:ring-[#2E7D32] border-gray-300 dark:border-zinc-700 cursor-pointer"
            />
            <label htmlFor="force-close-eod" className="cursor-pointer">
              <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200 block">
                Forcer la clôture de toutes les sessions ouvertes en fin de journée (EOD)
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500 block mt-0.5">
                Même si le caissier a oublié de fermer physiquement sa caisse avant de quitter l&apos;agence.
              </span>
            </label>
          </div>

          {/* ── Expression Cron Système ── */}
          <div>
            <label
              htmlFor="caisse-cron-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2"
            >
              Expression Cron Crontab
            </label>
            <div className="relative">
              <Terminal className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
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
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5 flex items-center gap-1.5">
              <span>Commande exécutée en arrière-plan :</span>
              <code className="px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-gray-700 dark:text-zinc-300">
                python manage.py check_sessions
              </code>
            </p>
          </div>

          {/* ── Règle métier & Sécurité ── */}
          <div className="flex items-start gap-3 p-4 bg-[#DDEAD5]/50 dark:bg-[#1B5E20]/20 border border-[#2E7D32]/30 rounded-2xl text-xs sm:text-sm text-[#1B5E20] dark:text-[#81C784] font-medium leading-relaxed">
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#2E7D32] dark:text-[#4CAF50] mt-0.5" />
            <div>
              <p className="font-bold">Garantie d&apos;intégrité financière CAPOSA</p>
              <p className="mt-0.5 text-xs text-[#1B5E20]/80 dark:text-[#81C784]/80">
                Lorsqu&apos;une session est clôturée par le cron, le montant théorique calculé depuis les dépôts et retraits réels
                est enregistré avec le statut <strong>fermée</strong> et le motif d&apos;audit <code>FERMETURE_AUTO_CRON</code>.
              </p>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-xs text-gray-400 dark:text-zinc-500 text-right">
              {lastUpdated}
            </p>
          )}
        </div>

        {/* ── Actions / Sauvegarde ── */}
        <div className="p-6 sm:p-8 bg-gray-50/60 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-4">
          <button
            type="button"
            onClick={loadConfig}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-gray-400" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}
