'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Clock, Settings2, Check, Pause, Play } from 'lucide-react';
import {
  DashboardRefreshConfig,
  REFRESH_INTERVAL_OPTIONS,
} from '@/app/lib/dashboard-refresh';
import Link from 'next/link';

interface DashboardRefreshControlProps {
  isRefreshing: boolean;
  secondsLeft: number;
  lastRefreshed: Date;
  config: DashboardRefreshConfig;
  onRefreshNow: () => void;
  onUpdateConfig: (newConfig: Partial<DashboardRefreshConfig>) => void;
  showSettingsLink?: boolean;
}

export default function DashboardRefreshControl({
  isRefreshing,
  secondsLeft,
  lastRefreshed,
  config,
  onRefreshNow,
  onUpdateConfig,
  showSettingsLink = true,
}: DashboardRefreshControlProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fermeture du popover au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const formattedTime = lastRefreshed.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={popoverRef}>
      {/* ── Badge info / Compte à rebours ── */}
      <div
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-600 dark:text-zinc-300 shadow-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
        onClick={() => setOpen((prev) => !prev)}
        title="Cliquez pour configurer le délai d'actualisation"
      >
        <Clock className="w-3.5 h-3.5 text-[#2E7D32] dark:text-[#4CAF50]" />
        {config.enabled ? (
          <span className="font-medium">
            Auto : <strong className="text-gray-900 dark:text-white font-semibold">{secondsLeft}s</strong>
          </span>
        ) : (
          <span className="text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1">
            <Pause className="w-3 h-3" /> Pause
          </span>
        )}
      </div>

      {/* ── Bouton Rafraîchir Manuel ── */}
      <button
        type="button"
        onClick={onRefreshNow}
        disabled={isRefreshing}
        className="p-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        title={`Actualiser maintenant (dernière à ${formattedTime})`}
        aria-label="Actualiser les données"
      >
        <RefreshCw
          className={`w-4 h-4 text-[#2E7D32] dark:text-[#4CAF50] ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        />
      </button>

      {/* ── Bouton Configuration Rapide ── */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`p-2.5 bg-white dark:bg-zinc-800 border rounded-xl transition-all shadow-xs cursor-pointer ${
          open
            ? 'border-[#2E7D32] dark:border-[#4CAF50] text-[#2E7D32] dark:text-[#4CAF50] bg-[#DDEAD5]/20 dark:bg-[#1B5E20]/20'
            : 'border-gray-200 dark:border-zinc-700 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700'
        }`}
        title="Configurer l'actualisation automatique"
        aria-label="Paramètres de rafraîchissement"
      >
        <Settings2 className="w-4 h-4" />
      </button>

      {/* ── Popover de configuration ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Actualisation
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Dernière : {formattedTime}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateConfig({ enabled: !config.enabled })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                config.enabled
                  ? 'bg-[#DDEAD5] dark:bg-[#1B5E20]/40 text-[#1B5E20] dark:text-[#81C784]'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
              }`}
            >
              {config.enabled ? (
                <>
                  <Play className="w-3 h-3 fill-current" /> Activé
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3" /> Désactivé
                </>
              )}
            </button>
          </div>

          {/* Choix de l'intervalle */}
          <div className="pt-3 space-y-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
              Fréquence de rafraîchissement
            </span>
            {REFRESH_INTERVAL_OPTIONS.map((opt) => {
              const isSelected = config.interval === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onUpdateConfig({ interval: opt.value, enabled: true });
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#DDEAD5]/60 dark:bg-[#1B5E20]/30 text-[#1B5E20] dark:text-[#81C784] font-semibold'
                      : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2E7D32] dark:text-[#4CAF50]" />}
                </button>
              );
            })}
          </div>

          {showSettingsLink && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="text-[11px] text-[#2E7D32] dark:text-[#4CAF50] font-semibold hover:underline flex items-center gap-1"
              >
                Configuration avancée →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
