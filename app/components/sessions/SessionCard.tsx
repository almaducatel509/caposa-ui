'use client';
import { useState } from 'react';
import {
  LogIn, LogOut, Clock, Banknote,
  TrendingUp, TrendingDown,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { CaisseSession } from '@/types/caisse';

// ─── Helpers ─────────────────────────────────────────────────────

function formatHTG(v: number) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: 'HTG', minimumFractionDigits: 2,
  }).format(v);
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function duree(ouverture?: string, fermeture?: string): string {
  if (!ouverture) return '—';
  const fin   = fermeture ? new Date(fermeture) : new Date();
  const debut = new Date(ouverture);
  const diff  = Math.floor((fin.getTime() - debut.getTime()) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m} min`;
}

// ─── Props ───────────────────────────────────────────────────────

interface Props {
  session: CaisseSession;
}

// ─── Composant ───────────────────────────────────────────────────

export default function SessionCard({ session }: Props) {
  const [expanded, setExpanded] = useState(false);

  const open  = session.statut === 'ouverte';
  const ecart = session.montant_fermeture != null
    ? session.montant_fermeture - session.montant_ouverture
    : null;

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      open ? 'border-[#2E7D32]/30 shadow-sm' : 'border-gray-100'
    }`}>

      {/* ── Ligne principale (cliquable) ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 rounded-2xl transition-colors"
      >
        {/* Icône statut */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          open ? 'bg-[#DDEAD5]' : 'bg-gray-100'
        }`}>
          {open
            ? <LogIn  className="w-5 h-5 text-[#2E7D32]" />
            : <LogOut className="w-5 h-5 text-gray-400"  />}
        </div>

        {/* Infos principales */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">
              {session.caissier_nom}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              open ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-gray-100 text-gray-500'
            }`}>
              {session.numero_caisse}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {open ? '● En cours' : '✓ Fermée'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            Superviseur : {session.superviseur} · {formatDate(session.ouverture_at)}
          </p>
        </div>

        {/* Montant ouverture */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-sm font-bold text-gray-800">
            {formatHTG(session.montant_ouverture)}
          </p>
          <p className="text-xs text-gray-400">Ouverture</p>
        </div>

        {/* Durée */}
        <div className="text-right shrink-0 hidden md:block">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            {duree(session.ouverture_at, session.fermeture_at)}
          </p>
          <p className="text-xs text-gray-400">{open ? 'en cours' : 'durée'}</p>
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-gray-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* ── Détail expandé ── */}
      {expanded && (
        <div className="px-5 pb-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              icon:  Banknote,
              label: 'Montant ouverture',
              value: formatHTG(session.montant_ouverture),
              color: 'text-[#2E7D32]',
            },
            {
              icon:  Banknote,
              label: 'Montant fermeture',
              value: session.montant_fermeture != null
                ? formatHTG(session.montant_fermeture)
                : '—',
              color: 'text-gray-700',
            },
            {
              icon:  ecart != null && ecart < 0 ? TrendingDown : TrendingUp,
              label: 'Écart',
              value: ecart != null
                ? ecart === 0
                  ? 'Aucun écart'
                  : `${ecart > 0 ? '+' : ''}${formatHTG(ecart)}`
                : '—',
              color: ecart == null   ? 'text-gray-400'
                : ecart === 0       ? 'text-[#2E7D32]'
                : ecart > 0         ? 'text-blue-600'
                :                     'text-red-600',
            },
            {
              icon:  Clock,
              label: 'Fermeture',
              value: formatDate(session.fermeture_at),
              color: 'text-gray-700',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col gap-1">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Icon size={11} />{label}
              </p>
              <p className={`text-sm font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}