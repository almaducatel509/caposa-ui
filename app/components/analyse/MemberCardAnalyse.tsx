'use client';

import { CheckCircle2, AlertTriangle, Clock, Eye } from 'lucide-react';
import { computeMemberStatus, MemberFinancialData } from '@/types/analyses';

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
};

function formatHTG(n: number) {
  return Math.round(n).toLocaleString('fr-HT') + ' HTG';
}

function scoreConfig(score: number) {
  if (score >= 75) return { color: C.green,   bar: C.green,   label: 'Élevé'  };
  if (score >= 50) return { color: C.gold,    bar: C.gold,    label: 'Moyen'  };
  return              { color: '#EF4444', bar: '#EF4444', label: 'Faible' };
}

function statutConfig(statut: string) {
  switch (statut) {
    case 'rembourse': return { bg: C.greenPale, text: C.greenDark, dot: C.green,   label: 'Remboursé', icon: CheckCircle2  };
    case 'en_cours':  return { bg: '#EBF2F8',   text: C.blue,      dot: C.blue,    label: 'En cours',  icon: Clock         };
    case 'en_retard': return { bg: '#FEF2F2',   text: '#B91C1C',   dot: '#EF4444', label: 'En retard', icon: AlertTriangle };
    default:          return { bg: '#F3F4F6',   text: '#4B5563',   dot: '#9CA3AF', label: 'Inconnu',   icon: Clock         };
  }
}

interface Props {
  member:  MemberFinancialData;
  onClick: () => void;
  idx:     number;
  isSelected:   boolean;
  onSelect:     () => void;
}

export default function MemberCard({ member, onClick, idx, isSelected, onSelect }: Props) {
  if (!member || member.scoreStabilite == null || !member.nom || !member.prenom) return null;

  const statut    = computeMemberStatus(member);
  const sCfg      = statutConfig(statut);
  const sc        = scoreConfig(member.scoreStabilite);
  const initiales = `${member.prenom[0]}${member.nom[0]}`;

  return (
    <div className={`grid grid-cols-12 gap-3 items-center px-5 py-4 transition-all group border-b border-gray-50 last:border-0 ${
      isSelected
        ? 'bg-[#DDEAD5]/30 border-l-4 border-[#2E7D32]'
        : idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F6]' : 'bg-[#F9F9F6]/40 hover:bg-[#F9F9F6]'
    }`}>

      {/* Checkbox */}
      <div className="col-span-1">
        <input type="checkbox" checked={isSelected}
          onChange={onSelect}
          onClick={e => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]/30 cursor-pointer" />
      </div>

      {/* Membre */}
      <div className="col-span-3 flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold group-hover:scale-105 transition-transform"
          style={{ backgroundColor: sCfg.dot }}>
          {initiales}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{member.prenom} {member.nom}</p>
          <p className="text-xs text-gray-400 font-mono">#{member.id}</p>
        </div>
      </div>

      {/* Stabilité */}
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.label}</span>
          <span className="text-xs text-gray-400">{Math.round(member.scoreStabilite)}/100</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${member.scoreStabilite}%`, backgroundColor: sc.bar }} />
        </div>
      </div>

      {/* Revenu moyen */}
      <div className="col-span-2">
        <p className="text-sm font-bold text-[#355C7D]">{formatHTG(member.revenuMensuelMoyen)}</p>
        {member.estSaisonnier && (
          <p className="text-xs font-medium" style={{ color: C.gold }}>Saisonnier</p>
        )}
      </div>

      {/* Statut prêt */}
      <div className="col-span-2">
        {member.dernierPret ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: sCfg.bg, color: sCfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sCfg.dot }} />
            {sCfg.label}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>

      {/* Nb prêts */}
      <div className="col-span-1">
        <p className="text-sm font-semibold text-gray-700">{member.nombrePrets}</p>
        <p className="text-xs text-gray-400">prêt{member.nombrePrets > 1 ? 's' : ''}</p>
      </div>

      {/* Action */}
      <div className="col-span-1 flex justify-center">
        <button title="Voir" onClick={onClick}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#355C7D] transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}