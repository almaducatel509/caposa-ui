'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDashboardRefreshSettings,
  updateDashboardRefreshSettings,
  UpdateRefreshSettingsPayload,
  DashboardRefreshSettingsResponse,
} from './api/dashboard-refresh';

export interface DashboardRefreshConfig {
  enabled: boolean;
  interval: number; // in seconds
  source?: 'system' | 'user';
}

export const DEFAULT_REFRESH_INTERVAL = 30; // 30 secondes par défaut
export const REFRESH_STORAGE_KEY = 'caposa_dashboard_refresh_config';
export const REFRESH_EVENT_NAME = 'caposa-dashboard-refresh-config-changed';

export const REFRESH_INTERVAL_OPTIONS = [
  { label: '10 secondes', value: 10 },
  { label: '15 secondes', value: 15 },
  { label: '30 secondes (défaut)', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '2 minutes', value: 120 },
  { label: '5 minutes', value: 300 },
];

/**
 * Récupère la configuration actuelle du rafraîchissement depuis localStorage.
 * Valeur par défaut : { enabled: true, interval: 30 }
 */
export function getDashboardRefreshConfig(): DashboardRefreshConfig {
  if (typeof window === 'undefined') {
    return { enabled: true, interval: DEFAULT_REFRESH_INTERVAL, source: 'system' };
  }

  try {
    const raw = localStorage.getItem(REFRESH_STORAGE_KEY);
    if (!raw) {
      return { enabled: true, interval: DEFAULT_REFRESH_INTERVAL, source: 'system' };
    }
    const parsed = JSON.parse(raw);
    const interval = typeof parsed.interval === 'number' && parsed.interval >= 5 ? parsed.interval : DEFAULT_REFRESH_INTERVAL;
    const enabled = typeof parsed.enabled === 'boolean' ? parsed.enabled : true;
    const source = parsed.source === 'user' ? 'user' : 'system';
    return { enabled, interval, source };
  } catch {
    return { enabled: true, interval: DEFAULT_REFRESH_INTERVAL, source: 'system' };
  }
}

/**
 * Enregistre la configuration dans localStorage et notifie tous les onglets / composants.
 */
export function saveDashboardRefreshConfig(config: Partial<DashboardRefreshConfig>): DashboardRefreshConfig {
  const current = getDashboardRefreshConfig();
  const next: DashboardRefreshConfig = {
    enabled: typeof config.enabled === 'boolean' ? config.enabled : current.enabled,
    interval: typeof config.interval === 'number' && config.interval >= 5 ? config.interval : current.interval,
    source: config.source || current.source || 'system',
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(REFRESH_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(REFRESH_EVENT_NAME, { detail: next }));
    } catch (e) {
      console.warn('Impossible de sauvegarder la configuration de rafraîchissement locale:', e);
    }
  }

  return next;
}

/**
 * Sauvegarde la configuration à la fois en base de données PostgreSQL (backend)
 * et dans le cache local (localStorage).
 */
export async function persistRefreshConfigToBackend(
  payload: UpdateRefreshSettingsPayload
): Promise<DashboardRefreshSettingsResponse> {
  const result = await updateDashboardRefreshSettings(payload);
  const nextConfig: DashboardRefreshConfig = {
    enabled: result.effective.enabled,
    interval: result.effective.interval,
    source: result.effective.source,
  };
  saveDashboardRefreshConfig(nextConfig);
  return result;
}

export interface UseDashboardRefreshOptions {
  onRefresh: () => Promise<void> | void;
  defaultInterval?: number;
  defaultEnabled?: boolean;
}

/**
 * Hook pour gérer le rafraîchissement périodique du dashboard synchronisé avec PostgreSQL
 */
export function useDashboardRefresh({
  onRefresh,
  defaultInterval = DEFAULT_REFRESH_INTERVAL,
  defaultEnabled = true,
}: UseDashboardRefreshOptions) {
  const [config, setConfig] = useState<DashboardRefreshConfig>(() => {
    const initial = getDashboardRefreshConfig();
    return {
      enabled: initial.enabled ?? defaultEnabled,
      interval: initial.interval ?? defaultInterval,
      source: initial.source ?? 'system',
    };
  });

  const [secondsLeft, setSecondsLeft] = useState<number>(config.interval);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // Synchronisation avec la base de données au montage
  useEffect(() => {
    let isMounted = true;
    fetchDashboardRefreshSettings()
      .then((data) => {
        if (!isMounted) return;
        const effectiveConfig: DashboardRefreshConfig = {
          enabled: data.effective.enabled,
          interval: data.effective.interval,
          source: data.effective.source,
        };
        saveDashboardRefreshConfig(effectiveConfig);
        setConfig(effectiveConfig);
        setSecondsLeft(effectiveConfig.interval);
      })
      .catch((err) => {
        // En cas d'erreur réseau, on reste silencieux et conserve la configuration locale
        console.debug('Utilisation de la configuration locale de rafraîchissement:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Écouter les changements de configuration locaux (autres fenêtres ou modale rapide)
  useEffect(() => {
    const handleConfigChange = (e: Event) => {
      const customEvent = e as CustomEvent<DashboardRefreshConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
        setSecondsLeft(customEvent.detail.interval);
      } else {
        const latest = getDashboardRefreshConfig();
        setConfig(latest);
        setSecondsLeft(latest.interval);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === REFRESH_STORAGE_KEY) {
        const latest = getDashboardRefreshConfig();
        setConfig(latest);
        setSecondsLeft(latest.interval);
      }
    };

    window.addEventListener(REFRESH_EVENT_NAME, handleConfigChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(REFRESH_EVENT_NAME, handleConfigChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshRef.current();
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Erreur lors du rafraîchissement automatique du dashboard:', err);
    } finally {
      setIsRefreshing(false);
      setSecondsLeft(config.interval);
    }
  }, [config.interval, isRefreshing]);

  // Décompte chaque seconde et rafraîchissement automatique
  useEffect(() => {
    if (!config.enabled) return;

    const timer = setInterval(() => {
      // Si l'onglet est masqué, on ne décrémente pas pour économiser les requêtes
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      setSecondsLeft((prev) => {
        if (prev <= 1) {
          triggerRefresh();
          return config.interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.enabled, config.interval, triggerRefresh]);

  const updateConfig = useCallback((newConfig: Partial<DashboardRefreshConfig>) => {
    const saved = saveDashboardRefreshConfig(newConfig);
    setConfig(saved);
    setSecondsLeft(saved.interval);

    // Persister de manière asynchrone en BDD pour l'utilisateur
    persistRefreshConfigToBackend({
      scope: 'user',
      use_custom: true,
      custom_enabled: saved.enabled,
      custom_interval: saved.interval,
    }).catch((err) => {
      console.warn('Erreur synchronisation BDD refresh:', err);
    });
  }, []);

  return {
    config,
    secondsLeft,
    isRefreshing,
    lastRefreshed,
    triggerRefresh,
    updateConfig,
  };
}
