'use client';
import { ClipboardList } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────

export interface AuditEvent {
  time:     string;        // ex: "01:43:12"
  title:    string;        // ex: "Ouverture de session"
  detail:   string;        // ex: "Session ouverte avec un montant de 15 000,00 HTG"
  actor:    string;        // ex: "alice.pierre"
  kind:     'ouverture' | 'validation' | 'fermeture' | 'transaction' | 'alerte';
}

interface AuditTimelineProps {
  events: AuditEvent[];
}

// ─── Couleurs par type d'événement ─────────────────────────────────

const KIND_CFG: Record<AuditEvent['kind'], { dot: string }> = {
  ouverture:   { dot: 'bg-green-500' },
  validation:  { dot: 'bg-blue-500'  },
  transaction: { dot: 'bg-gray-400'  },
  fermeture:   { dot: 'bg-gray-600'  },
  alerte:      { dot: 'bg-red-500'   },
};

// ─── Component ─────────────────────────────────────────────────────

export default function AuditTimeline({ events }: AuditTimelineProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
        <ClipboardList className="w-4 h-4 text-[#2E7D32]" />
        <h3 className="text-sm font-semibold text-gray-800">Journal des événements</h3>
        <span className="ml-auto text-[10px] text-gray-400 font-medium">
          {events.length} événement{events.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Events — TOUS affichés, sans pagination ── */}
      <div className="divide-y divide-gray-50">
        {events.map((e, i) => {
          const cfg = KIND_CFG[e.kind];
          return (
            <div key={i} className="flex items-start gap-4 px-5 py-3">
              {/* Heure */}
              <div className="flex items-center gap-2 shrink-0 w-24">
                <span className={`w-2 h-2 rounded-full ${cfg.dot} mt-1.5`} />
                <span className="text-xs font-mono text-gray-400 mt-0.5">{e.time}</span>
              </div>
              {/* Titre + détail */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{e.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{e.detail}</p>
              </div>
              {/* Acteur */}
              <span className="text-xs font-mono text-gray-500 shrink-0">
                {e.actor}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}