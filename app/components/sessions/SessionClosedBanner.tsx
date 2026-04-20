'use client';

/**
 * SessionClosedBanner.tsx
 * ─────────────────────────────────────────────────────────────────
 * Affiche une carte d'information quand la caisse est fermée :
 *   • Jour férié
 *   • Jour fermé dans l'horaire
 *   • Hors plage horaire
 *
 * Palette CAPOSA — style institutionnel, pas alarmiste.
 * ─────────────────────────────────────────────────────────────────
 */

import { Lock, Calendar, Clock, CalendarX } from 'lucide-react';
import type { CanOpenResponse, CloseReason } from '@/types/session-rules';

interface Props {
  rules: CanOpenResponse;
}

// ─── Config par raison ───────────────────────────────────────────

const REASON_CONFIG: Record<
  CloseReason,
  {
    Icon: typeof Lock;
    titre: string;
  }
> = {
  holiday: {
    Icon: CalendarX,
    titre: 'Jour férié',
  },
  closed_day: {
    Icon: Calendar,
    titre: 'Jour de fermeture',
  },
  outside_hours: {
    Icon: Clock,
    titre: 'Hors plage d\'ouverture',
  },
};

// ─── Helper formatage date ──────────────────────────────────────

function formatNextOpening(iso: string): string {
  const d = new Date(iso);
  const joursSemaine = [
    'dimanche', 'lundi', 'mardi', 'mercredi',
    'jeudi', 'vendredi', 'samedi',
  ];
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];

  const jour = joursSemaine[d.getDay()];
  const numJour = d.getDate();
  const nomMois = mois[d.getMonth()];
  const heures = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${jour} ${numJour} ${nomMois} à ${heures}h${minutes}`;
}

// ─── Composant ───────────────────────────────────────────────────

export default function SessionClosedBanner({ rules }: Props) {
  // Ne rien afficher si ouverture autorisée
  if (rules.canOpen) return null;

  const config = rules.reason ? REASON_CONFIG[rules.reason] : null;
  const Icon = config?.Icon ?? Lock;
  const titre = config?.titre ?? 'Caisse fermée';

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-4 p-5 mb-6 rounded-2xl border-2 bg-[#F9F9F6] border-[#DDEAD5] shadow-sm"
    >
      {/* Icône */}
      <div className="shrink-0 w-12 h-12 rounded-xl bg-[#DDEAD5]/60 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#1B5E20]" />
      </div>

      {/* Texte */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-3.5 h-3.5 text-[#1B5E20]" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1B5E20]">
            {titre}
          </p>
        </div>

        <p className="text-sm font-bold text-gray-900 mb-1">
          {rules.message}
        </p>

        {rules.holidayName && (
          <p className="text-xs text-gray-500 mb-2">
            {rules.holidayName}
          </p>
        )}

        {rules.nextOpeningAt && (
          <div className="mt-2 pt-2 border-t border-[#DDEAD5]/60">
            <p className="text-xs text-gray-500">
              Prochaine ouverture :{' '}
              <span className="font-semibold text-[#2E7D32]">
                {formatNextOpening(rules.nextOpeningAt)}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}