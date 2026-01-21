// Composant Card Membre
'use client';
import { ChevronRight } from 'lucide-react';
import { FinancialHistoryEntry, MemberFinancialData } from '@/types/analyses';

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
  
  const colors = getScoreColor(member.scoreStabilite);
  const formatCurrency = (value: number) => `${Math.round(value).toLocaleString('fr-FR')} HTG`;
  
  return (
    <div 
      onClick={onClick}
      className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {member.prenom[0]}{member.nom[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{member.prenom} {member.nom}</h3>
            <p className="text-xs text-gray-600 font-mono">{member.id}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
      </div>
      
      {/* Score de stabilité */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600 uppercase">Stabilité Financière</span>
          <span className={`text-lg font-bold ${colors.text}`}>{Math.round(member.scoreStabilite)}/100</span>
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
        <div className={`${colors.badge} rounded-lg p-3`}>
          <p className="text-xs text-gray-600 mb-1">Revenu moyen</p>
          <p className="font-bold text-gray-900 text-sm">{formatCurrency(member.revenuMensuelMoyen)}</p>
        </div>
        <div className={`${colors.badge} rounded-lg p-3`}>
          <p className="text-xs text-gray-600 mb-1">Capacité</p>
          <p className="font-bold text-gray-900 text-sm">{formatCurrency(member.capaciteRemboursement)}</p>
        </div>
      </div>
      
      {/* Badges de statut */}
      <div className="flex flex-wrap gap-2">
        {member.estSaisonnier && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            📅 Saisonnier
          </span>
        )}
        {member.dernierPret && (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            member.dernierPret.statut === 'rembourse' ? 'bg-green-100 text-green-700' :
            member.dernierPret.statut === 'en_cours' ? 'bg-purple-100 text-purple-700' :
            'bg-red-100 text-red-700'
          }`}>
            {member.dernierPret.statut === 'rembourse' ? '✓ Remboursé' :
             member.dernierPret.statut === 'en_cours' ? '⏳ En cours' : '⚠️ Retard'}
          </span>
        )}
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          {member.nombrePrets} prêt{member.nombrePrets > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};