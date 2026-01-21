import { MemberFinancialData } from "@/types/analyses";
import { Activity } from "react";
import { X, TrendingUp, TrendingDown, CheckCircle, DollarSign, AlertCircle, BarChart3 } from "lucide-react";
import { PieChart as PieChartIcon } from "lucide-react"; // ⬅️ Renommer l'import
import { 
  ResponsiveContainer, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, // ⬅️ Ajouter LineChart
  Line,
  PieChart, // ⬅️ Importer de recharts
  Pie, 
  Cell 
} from "recharts";
interface Props {
  member: MemberFinancialData;
  onClose: () => void;
}

// Modal détaillé
export default function MemberDetailModal({ member, onClose }: Props) {
  const formatCurrency = (value: number) => `${Math.round(value).toLocaleString('fr-FR')} HTG`;
  
  // Données pour graphiques
  const evolutionData = member.historique.map(h => ({
    mois: h.mois,
    revenu: Math.round(h.revenu),
    depenses: Math.round(h.depenses),
    solde: Math.round(h.revenu - h.depenses)
  }));
  
  const repartitionData = [
    { name: 'Dépenses', value: Math.round(member.depensesMensuellesMoyennes), color: '#ef4444' },
    { name: 'Capacité', value: Math.round(member.capaciteRemboursement), color: '#10b981' }
  ];
  
  const indicateursData = [
    { label: 'Stabilité', value: member.scoreStabilite, max: 100, color: '#8b5cf6' },
    { label: 'Taux remb.', value: member.tauxRemboursement, max: 100, color: '#10b981' },
    { label: 'Endettement', value: member.ratioEndettement * 100, max: 50, color: '#f59e0b' }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-3xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {member.prenom[0]}{member.nom[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{member.prenom} {member.nom}</h2>
                <p className="text-purple-100 font-mono">{member.id}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                    Membre depuis {Math.floor(member.anciennete / 12)} an{Math.floor(member.anciennete / 12) > 1 ? 's' : ''}
                  </span>
                  {member.estSaisonnier && (
                    <span className="px-3 py-1 bg-blue-500/30 rounded-full text-xs font-semibold">
                      📅 Revenus saisonniers
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vue d'ensemble */}
          <section>
            <Activity>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Vue d'ensemble financière
                </h3>
            </Activity>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-700 uppercase">Revenu Mensuel Moyen</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(member.revenuMensuelMoyen)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {member.estSaisonnier ? 'Moyenne sur 12 mois (saisonnier)' : 'Moyenne sur 6 mois'}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <p className="text-xs font-semibold text-red-700 uppercase">Dépenses Mensuelles</p>
                </div>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(member.depensesMensuellesMoyennes)}</p>
                <p className="text-xs text-red-600 mt-1">
                  {((member.depensesMensuellesMoyennes / member.revenuMensuelMoyen) * 100).toFixed(1)}% du revenu
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-xs font-semibold text-green-700 uppercase">Capacité Remboursement</p>
                </div>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(member.capaciteRemboursement)}</p>
                <p className="text-xs text-green-600 mt-1">
                  Montant disponible/mois
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PieChartIcon className="w-5 h-5 text-purple-600" />
                  <p className="text-xs font-semibold text-purple-700 uppercase">Score Stabilité</p>
                </div>
                <p className="text-2xl font-bold text-purple-900">{Math.round(member.scoreStabilite)}/100</p>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.round(member.scoreStabilite / 20) ? 'bg-purple-600' : 'bg-purple-200'}`} />
                  ))}
                </div>
              </div>
            </div>
          </section>
          
          {/* Graphiques */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution temporelle */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">Évolution Revenus & Dépenses</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" fontSize={11} stroke="#6b7280" />
                  <YAxis fontSize={11} stroke="#6b7280" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                    formatter={(value: number | undefined) => value ? formatCurrency(value) : '0 HTG'} 
                    contentStyle={{ borderRadius: '8px' }} 
                    />                  <Legend />
                  <Line type="monotone" dataKey="revenu" stroke="#3b82f6" strokeWidth={2} name="Revenus" />
                  <Line type="monotone" dataKey="depenses" stroke="#ef4444" strokeWidth={2} name="Dépenses" />
                  <Line type="monotone" dataKey="solde" stroke="#10b981" strokeWidth={2} name="Solde" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Répartition */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">Répartition Budget Mensuel</h4>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie data={repartitionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {repartitionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                <Tooltip 
                formatter={(value: number | undefined) => value ? formatCurrency(value) : '0 HTG'} 
                contentStyle={{ borderRadius: '8px' }} 
                />                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {repartitionData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-gray-700 font-semibold">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(item.value)}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-5">
                        {((item.value / member.revenuMensuelMoyen) * 100).toFixed(1)}% du revenu
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          
          {/* Indicateurs détaillés */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Indicateurs de Performance
            </h4>
            <div className="space-y-4">
              {indicateursData.map((ind, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{ind.label}</span>
                    <span className="text-lg font-bold text-gray-900">{Math.round(ind.value)}/{ind.max}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${Math.min(100, (ind.value / ind.max) * 100)}%`,
                        backgroundColor: ind.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Prêt actuel */}
          {member.dernierPret && (
            <section className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Prêt Actuel
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-purple-600 mb-1">Montant</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(member.dernierPret.montant)}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-600 mb-1">Mensualité</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(member.dernierPret.mensualite)}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-600 mb-1">Ratio d'endettement</p>
                  <p className="text-xl font-bold text-purple-900">{(member.ratioEndettement * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600">
                  <strong>Note :</strong> Ce prêt représente {((member.dernierPret.mensualite / member.capaciteRemboursement) * 100).toFixed(1)}% de la capacité de remboursement mensuelle du membre.
                </p>
              </div>
            </section>
          )}
          
          {/* Historique et réputation */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">Historique de Crédit</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ancienneté</span>
                  <span className="font-semibold text-gray-900">{Math.floor(member.anciennete / 12)} an{Math.floor(member.anciennete / 12) > 1 ? 's' : ''} {member.anciennete % 12} mois</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nombre de prêts</span>
                  <span className="font-semibold text-gray-900">{member.nombrePrets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux de remboursement</span>
                  <span className="font-semibold text-green-700">{member.tauxRemboursement.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">Recommandation</h4>
              <div className="space-y-2">
                {member.scoreStabilite >= 70 && member.tauxRemboursement >= 90 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700">Profil très stable, excellent candidat pour un prêt</p>
                  </div>
                )}
                {member.estSaisonnier && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-gray-700">Revenus saisonniers : utiliser la moyenne sur 12 mois</p>
                  </div>
                )}
                {member.ratioEndettement > 0.35 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <p className="text-sm text-gray-700">Taux d'endettement élevé : prudence recommandée</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
