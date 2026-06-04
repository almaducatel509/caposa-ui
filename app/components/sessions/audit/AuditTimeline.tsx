'use client';
import { useEffect, useState } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';
import AxiosInstance from '@/app/lib/axiosInstance';

export interface AuditEvent {
  time:  string;
  title: string;
  actor: string;
  kind:  'ouverture' | 'validation' | 'fermeture' | 'transaction' | 'alerte';
  note?: string;
}

interface AuditTimelineProps {
  sessionId: string;
}

const KIND_CFG: Record<AuditEvent['kind'], { dot: string }> = {
  ouverture:   { dot: 'bg-green-500' },
  validation:  { dot: 'bg-blue-500'  },
  transaction: { dot: 'bg-gray-400'  },
  fermeture:   { dot: 'bg-gray-600'  },
  alerte:      { dot: 'bg-red-500'   },
};

const MOCK_EVENTS: AuditEvent[] = [
  { time: '01:43:12', kind: 'ouverture',   title: 'Ouverture de session',       actor: 'alice.pierre' },
  { time: '01:43:25', kind: 'validation',  title: 'Validation superviseur',      actor: 'marie.joseph' },
  { time: '01:43:40', kind: 'validation',  title: 'Validation responsable cash', actor: 'paul.martin'  },
  { time: '03:15:08', kind: 'transaction', title: 'Dépôt espèces',               actor: 'alice.pierre' },
  { time: '05:22:45', kind: 'transaction', title: 'Retrait espèces',             actor: 'alice.pierre' },
  { time: '09:42:55', kind: 'fermeture',   title: 'Fermeture de session',        actor: 'alice.pierre' },
];

export default function AuditTimeline({ sessionId }: AuditTimelineProps) {
  const [events,  setEvents]  = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await AxiosInstance.get<AuditEvent[]>(`/sessions/${sessionId}/events/`);
        setEvents(data);
      } catch {
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-10">
      <Loader2 className="w-5 h-5 animate-spin text-[#2E7D32]" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
        <ClipboardList className="w-4 h-4 text-[#2E7D32]" />
        <h3 className="text-sm font-semibold text-gray-800">Journal des événements</h3>
        <span className="ml-auto text-[10px] text-gray-400 font-medium">
          {events.length} événement{events.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {events.map((e, i) => {
          const cfg = KIND_CFG[e.kind];
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
              <span className="text-xs font-mono text-gray-400 shrink-0 w-16">{e.time}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{e.title}</p>
                {e.note && <p className="text-xs text-gray-400 mt-0.5 italic">{e.note}</p>}
              </div>
              <span className="text-xs font-mono text-gray-400 shrink-0">{e.actor}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}