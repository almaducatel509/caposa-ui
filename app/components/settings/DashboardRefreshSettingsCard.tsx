'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Clock,
  Check,
  RotateCcw,
  ShieldCheck,
  User,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  DEFAULT_REFRESH_INTERVAL,
  REFRESH_INTERVAL_OPTIONS,
  saveDashboardRefreshConfig,
} from '@/app/lib/dashboard-refresh';
import {
  fetchDashboardRefreshSettings,
  updateDashboardRefreshSettings,
  DashboardRefreshSettingsResponse,
} from '@/app/lib/api/dashboard-refresh';

export default function DashboardRefreshSettingsCard() {
  const [data, setData] = useState<DashboardRefreshSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Vue sélectionnée : 'system' (si admin) ou 'user'
  const [activeScope, setActiveScope] = useState<'system' | 'user'>('user');

  // État local du formulaire selon le scope actif
  const [enabled, setEnabled] = useState(true);
  const [interval, setIntervalVal] = useState<number | ''>(DEFAULT_REFRESH_INTERVAL);
  const [useCustom, setUseCustom] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardRefreshSettings();
      setData(res);

      if (res.is_admin && activeScope === 'system') {
        setEnabled(res.system.enabled);
        setIntervalVal(res.system.interval);
      } else {
        setUseCustom(res.user.use_custom);
        setEnabled(res.user.use_custom ? res.user.custom_enabled : res.system.enabled);
        setIntervalVal(res.user.use_custom ? res.user.custom_interval : res.system.interval);
      }
    } catch (err: any) {
      console.error('Erreur chargement refresh settings:', err);
      setError(err?.response?.data?.error || err?.message || 'Erreur lors du chargement des paramètres.');
    } finally {
      setLoading(false);
    }
  }, [activeScope]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Met à jour les valeurs affichées lors du basculement d'onglet (Système vs Ma préférence)
  const handleScopeChange = (scope: 'system' | 'user') => {
    setActiveScope(scope);
    if (!data) return;

    if (scope === 'system') {
      setEnabled(data.system.enabled);
      setIntervalVal(data.system.interval);
    } else {
      setUseCustom(data.user.use_custom);
      setEnabled(data.user.use_custom ? data.user.custom_enabled : data.system.enabled);
      setIntervalVal(data.user.use_custom ? data.user.custom_interval : data.system.interval);
    }
  };

  const notifySaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Enregistrement immédiat en base de données
  const saveChanges = async (
    scope: 'system' | 'user',
    params: {
      enabled?: boolean;
      interval?: number;
      use_custom?: boolean;
    }
  ) => {
    setSaving(true);
    setError(null);
    try {
      const payload: any = { scope };

      if (scope === 'system') {
        if (params.enabled !== undefined) payload.enabled = params.enabled;
        if (params.interval !== undefined) payload.interval = params.interval;
      } else {
        if (params.use_custom !== undefined) payload.use_custom = params.use_custom;
        if (params.enabled !== undefined) payload.custom_enabled = params.enabled;
        if (params.interval !== undefined) payload.custom_interval = params.interval;
      }

      const updated = await updateDashboardRefreshSettings(payload);
      setData(updated);

      // Met à jour le cache local localStorage et notifie le dashboard
      saveDashboardRefreshConfig({
        enabled: updated.effective.enabled,
        interval: updated.effective.interval,
        source: updated.effective.source,
      });

      notifySaved();
    } catch (err: any) {
      console.error('Erreur enregistrement refresh settings:', err);
      setError(err?.response?.data?.error || err?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    const validInterval = typeof interval === 'number' && interval >= 5 ? interval : DEFAULT_REFRESH_INTERVAL;
    saveChanges(activeScope, { enabled: checked, interval: validInterval });
  };

  const handleSelectOption = (val: number) => {
    setIntervalVal(val);
    saveChanges(activeScope, { enabled, interval: val });
  };

  const handleCustomIntervalBlur = () => {
    let finalVal = typeof interval === 'number' && interval >= 5 ? interval : DEFAULT_REFRESH_INTERVAL;
    if (finalVal > 3600) finalVal = 3600;
    setIntervalVal(finalVal);
    saveChanges(activeScope, { enabled, interval: finalVal });
  };

  const handleToggleUseCustom = (custom: boolean) => {
    setUseCustom(custom);
    if (!custom && data) {
      // Revenir à la valeur système
      setEnabled(data.system.enabled);
      setIntervalVal(data.system.interval);
      saveChanges('user', { use_custom: false });
    } else {
      const validInterval = typeof interval === 'number' && interval >= 5 ? interval : DEFAULT_REFRESH_INTERVAL;
      saveChanges('user', { use_custom: true, enabled, interval: validInterval });
    }
  };

  const handleResetSystemDefault = () => {
    setEnabled(true);
    setIntervalVal(DEFAULT_REFRESH_INTERVAL);
    saveChanges('system', { enabled: true, interval: DEFAULT_REFRESH_INTERVAL });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
        <p className="text-sm font-medium">Chargement des paramètres de rafraîchissement depuis la base de données…</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4 sm:p-6 transition-all">
      {/* ── En-tête de la carte ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#2E7D32]/10 dark:bg-[#4CAF50]/15 text-[#2E7D32] dark:text-[#4CAF50] flex items-center justify-center shrink-0">
            <RefreshCw className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>Actualisation Hybride du Dashboard</span>
              {savedSuccess && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/50 dark:text-[#81C784] animate-in fade-in duration-200">
                  <Check className="w-3 h-3" /> Enregistré en BDD
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Stocké dans PostgreSQL · Synchronisé sur tous vos postes et appareils
            </p>
          </div>
        </div>

        {/* Badge statut effectif */}
        {data && (
          <div className="flex items-center gap-2 bg-[#F9F9F6] dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-gray-200/70 dark:border-zinc-700 text-xs shrink-0 self-start sm:self-auto">
            <span className="text-gray-500 dark:text-zinc-400">Règle active :</span>
            <span className="font-bold text-[#1B5E20] dark:text-[#81C784]">
              {data.effective.enabled ? `${data.effective.interval}s` : 'En pause'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold uppercase">
              {data.effective.source === 'system' ? 'Système' : 'Perso'}
            </span>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="my-4 flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Sélecteur de niveau : Mode Système (Admin) vs Ma préférence personnelle ── */}
      {data?.is_admin && (
        <div className="mt-5 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center gap-1 w-full sm:w-fit">
          <button
            type="button"
            onClick={() => handleScopeChange('user')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScope === 'user'
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Ma préférence personnelle</span>
          </button>
          <button
            type="button"
            onClick={() => handleScopeChange('system')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScope === 'system'
                ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Configuration Globale Système (Admin)</span>
          </button>
        </div>
      )}

      {/* ── Mode Préférence Personnelle : Option d'hériter ou de personnaliser ── */}
      {activeScope === 'user' && (
        <div className="mt-5 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-[#F9F9F6] dark:bg-zinc-800/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Comportement de mon compte
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                {useCustom
                  ? 'Vous utilisez une cadence personnalisée pour votre propre compte.'
                  : `Vous suivez actuellement la règle globale du système (${data?.system.interval}s, ${data?.system.enabled ? 'actif' : 'inactif'}).`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleUseCustom(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !useCustom
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50'
                }`}
              >
                Suivre le système
              </button>
              <button
                type="button"
                onClick={() => handleToggleUseCustom(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  useCustom
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50'
                }`}
              >
                Personnaliser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Formulaire de réglage ── */}
      <div className={`pt-5 space-y-6 ${activeScope === 'user' && !useCustom ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Toggle On / Off */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
          <div>
            <label htmlFor="dashboard-refresh-toggle" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
              {activeScope === 'system'
                ? 'Activer le rafraîchissement par défaut pour toute l’institution'
                : 'Activer le rafraîchissement automatique sur mon dashboard'}
            </label>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Interroge automatiquement le serveur sans recharger la page
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
            <input
              id="dashboard-refresh-toggle"
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={saving}
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
                  disabled={saving}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[58px] ${
                    isSelected
                      ? 'bg-[#DDEAD5] border-[#2E7D32]/50 text-[#1B5E20] dark:bg-[#1B5E20]/40 dark:text-[#81C784] shadow-xs ring-1 ring-[#2E7D32]/30'
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
              Valeur comprise entre 5 secondes et 3600 secondes (1 heure)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="custom-refresh-input"
              type="number"
              min={5}
              max={3600}
              value={interval}
              onChange={(e) => {
                const val = e.target.value;
                setIntervalVal(val === '' ? '' : parseInt(val, 10));
              }}
              onBlur={handleCustomIntervalBlur}
              disabled={saving}
              className="w-28 h-10 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32] transition-all text-center"
            />
            <span className="text-sm font-medium text-gray-500">secondes</span>
          </div>
        </div>

        {/* Bouton de réinitialisation si mode système */}
        {activeScope === 'system' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetSystemDefault}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rétablir 30s par défaut pour le système</span>
            </button>
          </div>
        )}

        {/* Info éco d'énergie & sécurité */}
        <div className="flex items-start gap-2.5 p-3.5 bg-[#DDEAD5]/30 dark:bg-[#1B5E20]/20 border border-[#2E7D32]/20 rounded-xl text-xs text-[#1B5E20] dark:text-[#81C784] font-medium leading-relaxed">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#2E7D32] dark:text-[#4CAF50] mt-0.5" />
          <span>
            <strong>Architecture Hybride :</strong> Vos réglages sont stockés de façon permanente dans PostgreSQL. Les administrateurs peuvent fixer une politique institutionnelle commune, tandis que chaque utilisateur conserve la liberté d&apos;ajuster sa propre fréquence d&apos;affichage selon ses besoins opérationnels.
          </span>
        </div>
      </div>
    </div>
  );
}
