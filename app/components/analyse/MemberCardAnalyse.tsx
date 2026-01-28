// Composant Card Membre
'use client';
import { ChevronRight } from 'lucide-react';
import { computeMemberStatus, FinancialHistoryEntry, MemberFinancialData } from '@/types/analyses';

interface Props {
  member: MemberFinancialData;
  onClick: () => void;
}

export default function MemberCard({ member, onClick }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' };
    if (score >= 50) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' };
  };
  const getTypeConfig = (status: string) => {
    switch (status) {
      case 'rembourse':
        return { 
          gradient: 'from-emerald-500 to-teal-500',
          textColor: 'text-emerald-600'
        };
      case 'en_cours':
        return { 
          gradient: 'from-blue-500 to-blue-700',
          textColor: 'text-violet-600'
        };
      case 'en_retard':
        return { 
          gradient: 'from-rose-500 to-pink-500',
          textColor: 'text-rose-600'
        };
      default:
        return { 
          gradient: 'from-gray-400 to-slate-500',
          textColor: 'text-gray-600'
        };
    }
  };

  const statut = computeMemberStatus(member);
  const typeConfig = getTypeConfig(statut);

  
  const colors = getScoreColor(member.scoreStabilite);
  const formatCurrency = (value: number) => `${Math.round(value).toLocaleString('fr-FR')} HTG`;
  
  return (
  <div 
    onClick={onClick}
    className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer"
  >
    {/* Gradient Bar */}
    <div className={`h-1.5 bg-linear-to-r ${typeConfig.gradient}`} />
    
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-md bg-linear-to-br ${typeConfig.gradient} flex items-center justify-center text-white shadow-lg`}>
            <span className="font-bold text-lg">{member.prenom[0]}{member.nom[0]}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Membre</p>
            <p className="text-xs text-gray-400 mt-0.5">#{member.id}</p>
          </div>
        </div>
        
        {/* Status Icon */}
        <div className="flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <p className={`text-3xl font-bold ${colors.text} tracking-tight`}>
          {member.prenom} {member.nom}
        </p>
      </div>

      {/* Score de stabilité */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Stabilité Financière</span>
          <span className={`text-sm font-bold ${colors.text}`}>{Math.round(member.scoreStabilite)}/100</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${member.scoreStabilite >= 75 ? 'bg-green-500' : member.scoreStabilite >= 50 ? 'bg-yellow-500' : 'bg-red-500'} transition-all`}
            style={{ width: `${member.scoreStabilite}%` }}
          />
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Revenu moyen</p>
          <p className="font-bold text-gray-900 text-sm">{formatCurrency(member.revenuMensuelMoyen)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Capacité</p>
          <p className="font-bold text-gray-900 text-sm">{formatCurrency(member.capaciteRemboursement)}</p>
        </div>
      </div>

      {/* Meta Info / Badges */}
      <div className="flex flex-wrap gap-2 py-3 border-t border-gray-100">
        {member.estSaisonnier && (
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
            📅 Saisonnier
          </span>
        )}
        {member.dernierPret && (
          <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
            member.dernierPret.statut === 'rembourse' ? 'bg-green-50 text-green-700' :
            member.dernierPret.statut === 'en_cours' ? 'bg-purple-50 text-blue-700' :
            'bg-red-50 text-red-700'
          }`}>
            {member.dernierPret.statut === 'rembourse' ? '✓ Remboursé' :
             member.dernierPret.statut === 'en_cours' ? '⏳ En cours' : '⚠️ Retard'}
          </span>
        )}
        <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-md">
          {member.nombrePrets} prêt{member.nombrePrets > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  </div>
);
};