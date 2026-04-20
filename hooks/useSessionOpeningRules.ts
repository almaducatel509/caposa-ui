'use client';

/**
 * useSessionOpeningRules.ts
 * ─────────────────────────────────────────────────────────────────
 * Vérifie si une session peut être ouverte selon :
 *   • Les jours fériés (Calendrier)
 *   • L'horaire hebdomadaire (Horaire)
 *   • L'heure actuelle
 *
 * Appel : GET /api/sessions/can-open/
 *
 * Mode offline : si l'API ne répond pas, on AUTORISE par défaut
 * et on laisse le backend trancher au moment du POST /sessions/open/.
 * (Principe : ne jamais bloquer l'utilisateur en cas de panne réseau)
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import AxiosInstance from '@/app/lib/axiosInstance';
import { isAxiosError } from 'axios';
import type { CanOpenResponse } from '@/types/session-rules';

interface UseSessionOpeningRulesResult {
  /** État de la vérification */
  rules: CanOpenResponse | null;

  /** En cours de chargement */
  loading: boolean;

  /** Erreur (réseau / 5xx) — dans ce cas on autorise par défaut */
  error: string | null;

  /** Relancer la vérification manuellement */
  refresh: () => Promise<void>;
}

/**
 * Réponse par défaut si l'API est injoignable.
 * On AUTORISE pour ne pas bloquer l'utilisateur en cas de panne.
 * Le backend validera quand même au POST /sessions/open/.
 */
const FALLBACK_ALLOW: CanOpenResponse = {
  canOpen: true,
  message: 'Vérification indisponible — le serveur validera à l\'ouverture.',
};

export function useSessionOpeningRules(): UseSessionOpeningRulesResult {
  const [rules, setRules] = useState<CanOpenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await AxiosInstance.get<CanOpenResponse>(
        '/sessions/can-open/'
      );
      setRules(data);
    } catch (err) {
      // Erreur réseau / 5xx → fallback sur "autorisé"
      // (le backend tranche au POST, donc pas de risque)
      if (isAxiosError(err)) {
        const msg = err.response
          ? `Erreur ${err.response.status}`
          : 'Serveur injoignable';
        setError(msg);
        console.warn('[useSessionOpeningRules] fallback :', msg);
      } else {
        setError('Erreur inconnue');
      }
      setRules(FALLBACK_ALLOW);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check au chargement uniquement (pas de polling)
  useEffect(() => {
    check();
  }, [check]);

  return {
    rules,
    loading,
    error,
    refresh: check,
  };
}