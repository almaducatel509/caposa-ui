'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Check, Sparkles, RotateCcw, ShieldCheck } from 'lucide-react';
import {
  getDashboardRefreshConfig,
  saveDashboardRefreshConfig,
  DEFAULT_REFRESH_INTERVAL,
  REFRESH_INTERVAL_OPTIONS,
  DashboardRefreshConfig,
} from '@/app/lib/dashboard-refresh';

export default function DashboardRefreshSettingsCard() {
  const [enabled, setEnabled] = useState(true);
  const [interval, setIntervalVal] = useState<number | ''>(DEFAULT_REFRESH_INTERVAL);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const cfg = getDashboardRefreshConfig();
    setEnabled(cfg.enabled);
    setIntervalVal(cfg.interval);
  }, []);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    const finalInterval = typeof interval === 'number' && interval >= 5 ? interval : DEFAULT_REFRESH_INTERVAL;
    saveDashboardRefreshConfig({ enabled: checked, interval: finalInterval });
    notifySaved();
  };

  const handleSelectOption = (val: number) => {
    setIntervalVal(val);
    saveDashboardRefreshConfig({ enabled, interval: val });
    notifySaved();
  };

  const handleCustomIntervalChange = (valStr: string) => {
    if (valStr === '') {
      setIntervalVal('');
    } else {
      const parsed = parseInt(valStr, 10);
      setIntervalVal(isNaN(parsed) ? '' : parsed);
    }
  };

  const handleCustomIntervalBlur = () => {
    let finalVal = typeof interval === 'number' && interval >= 5 ? interval : DEFAULT_REFRESH_INTERVAL;
    if (finalVal > 3600) finalVal = 3600; // max 1 heure
    setIntervalVal(finalVal);
    saveDashboardRefreshConfig({ enabled, interval: finalVal });
    notifySaved();
  };

  const handleResetDefault = () => {
    setEnabled(true);
    setIntervalVal(DEFAULT_REFRESH_INTERVAL);
    saveDashboardRefreshConfig({ enabled: true, interval: DEFAULT_REFRESH_INTERVAL });
    notifySaved();
  };

  const notifySaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 transition-all">
      <div className="flex items-start justify-between flex-wrap gap-4 pb-5 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#2E7D32]/10 dark:bg-[#4CAF50]/15 text-[#2E7D32] dark:text-[#4CAF50] flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Actualisation Automatique du Dashboard</span>
              {savedSuccess && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/50 dark:text-[#81C784] animate-in fade-in duration-200">
                  <Check className="w-3 h-3" /> Enregistré
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Cadence de mise à jour en temps réel des transactions, soldes et indicateurs clés (30s par défaut)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefault}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          title="Réinitialiser à 30 secondes"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Rétablir 30s</span>
        </button>
      </div>

      <div className="pt-5 space-y-6">
        {/* Toggle On / Off */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
          <div>
            <label htmlFor="dashboard-refresh-toggle" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
              Activer le rafraîchissement périodique
            </label>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Interroge automatiquement le serveur sans recharger la page
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="dashboard-refresh-toggle"
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E7D32]"></div>
          </label>
        </div>

        {/* Sélection d'intervalle rapide */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2.5">
            Fréquences recommandées
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {REFRESH_INTERVAL_OPTIONS.map((opt) => {
              const isSelected = interval === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#DDEAD5] border-[#2E7D32]/50 text-[#1B5E20] dark:bg-[#1B5E20]/40 dark:text-[#81C784] shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-sm font-bold">{opt.value}s</span>
                  <span className="text-[11px] font-normal text-gray-500 dark:text-zinc-400">
                    {opt.value === 30 ? 'Par défaut' : opt.label.replace(` (${opt.value}s)`, '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Intervalle personnalisé */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div>
            <label htmlFor="custom-refresh-input" className="text-sm font-semibold text-gray-900 dark:text-white">
              Délai personnalisé (secondes)
            </label>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Valeur comprise entre 5 secondes et 3600 secondes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="custom-refresh-input"
              type="number"
              min={5}
              max={3600}
              value={interval}
              onChange={(e) => handleCustomIntervalChange(e.target.value)}
              onBlur={handleCustomIntervalBlur}
              className="w-28 h-10 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all text-center"
            />
            <span className="text-sm font-medium text-gray-500">secondes</span>
          </div>
        </div>

        {/* Info éco d'énergie & sécurité */}
        <div className="flex items-start gap-2.5 p-3.5 bg-[#DDEAD5]/30 dark:bg-[#1B5E20]/20 border border-[#2E7D32]/20 rounded-xl text-xs text-[#1B5E20] dark:text-[#81C784] font-medium leading-relaxed">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#2E7D32] dark:text-[#4CAF50] mt-0.5" />
          <span>
            <strong>Optimisation réseau :</strong> Lorsque vous changez d&apos;onglet ou réduisez votre navigateur, l&apos;actualisation automatique se met automatiquement en pause pour économiser les ressources réseau et serveur.
          </span>
        </div>
      </div>
    </div>
  );
}
