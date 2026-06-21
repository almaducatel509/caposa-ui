'use client';

import { useState } from 'react';
import { PiCashRegisterFill } from 'react-icons/pi';
import {
  ChevronUp, ChevronDown, Banknote, TrendingUp,
  Clock, MapPin, Building2, ToggleLeft, ToggleRight,
  Loader2, AlertCircle,
} from 'lucide-react';
import { Caisse } from '@/types/caisse';
import { toggleCaisseActif } from '@/app/lib/api/caisse';
import { formatDate } from '@/config/appConfig';
import { FaDotCircle, FaRegCircle } from 'react-icons/fa';

interface Props {
  caisse:        Caisse;
  onOpenDetail:  (c: Caisse) => void;
  onToggle:      () => void;  // appelé après succès → load(true) dans le parent
}

export default function CaisseCard({ caisse, onOpenDetail, onToggle }: Props) {
  const [expanded,    setExpanded]    = useState(false);
  const [toggling,    setToggling]    = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const handleToggle = async () => {
    setToggling(true);
    setToggleError(null);
    try {
      // TODO API : PATCH /caisses/{id}/ → { actif: boolean }
      // Django refuse avec 409 si session active ou transactions pending
      await toggleCaisseActif(caisse.id, !caisse.actif);
      onToggle();
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Impossible de modifier le statut.';
      setToggleError(msg);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      caisse.actif ? 'border-gray-100 shadow-sm' : 'border-dashed border-gray-200 opacity-75'
    }`}>

      {/* Ligne principale */}
      <div className="flex items-center gap-4 px-5 py-4">

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          caisse.actif ? 'bg-[#DDEAD5]' : 'bg-gray-100'
        }`}>
          <PiCashRegisterFill className={`w-5 h-5 ${caisse.actif ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{caisse.nom_caisse}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
              {caisse.numero_caisse}
            </span>
              {caisse.actif ? (
                <span className="flex items-center gap-1 text-green-600">
                  <FaDotCircle size={10} />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500">
                  <FaRegCircle size={10} />
                  Inactive
                </span>
              )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {caisse.branch_name ?? caisse.branch}
          </p>
        </div>

        {/* Solde — TODO API : solde_actuel via SerializerMethodField */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-sm font-bold text-[#2E7D32]">
            {caisse.solde_actuel ?? caisse.solde_initial} HTG
          </p>
          <p className="text-xs text-gray-400">Solde actuel</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Toggle actif / inactif */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={caisse.actif ? 'Désactiver' : 'Activer'}
            className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
              caisse.actif
                ? 'text-[#2E7D32] hover:bg-[#DDEAD5]/60'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            {toggling
              ? <Loader2 size={16} className="animate-spin" />
              : caisse.actif
                ? <ToggleRight size={16} />
                : <ToggleLeft  size={16} />
            }
          </button>

          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Erreur toggle — 409 session active, etc. */}
      {toggleError && (
        <div className="mx-5 mb-3 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          <AlertCircle size={13} className="shrink-0" />
          {toggleError}
        </div>
      )}

      {/* Détail déroulant */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Banknote,   label: 'Solde initial',    value: `${caisse.solde_initial} HTG`,              color: 'text-gray-700'  },
            { icon: TrendingUp, label: 'Solde actuel',     value: caisse.solde_actuel != null ? `${caisse.solde_actuel} HTG` : '—', color: 'text-[#2E7D32]' },
            { icon: Clock,      label: 'Sessions',         value: String(caisse.nb_sessions ?? '—'),          color: 'text-blue-600'  },
            { icon: Clock,      label: 'Dernière session', value: formatDate(caisse.derniere_session),        color: 'text-gray-700'  },
            { icon: Building2,  label: 'Agence',           value: caisse.branch_name ?? '—',                 color: 'text-gray-700'  },
            { icon: Clock,      label: 'Créée le',         value: formatDate(caisse.created_at),             color: 'text-gray-700'  },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 flex items-center gap-1"><Icon size={11} />{label}</p>
              <p className={`text-sm font-semibold ${color} truncate`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}