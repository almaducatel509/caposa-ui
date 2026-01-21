// ✔️ Analyse financière
// revenu mensuel

// dépenses

// capacité de remboursement
// export interface FinancialAnalysis {
//   revenuMensuel: number;
//   depensesMensuelles: number;
//   capaciteRemboursement: number; // revenu - dépenses
//   ratioEndettement: number; // (paiements mensuels / revenu)
// }
'use client'
import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, Calendar, FileText, X, ChevronRight, Activity, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { FinancialHistoryEntry, MemberFinancialData } from '@/types/analyses';
import MemberCard from './MemberCardAnalyse';
import MemberDetailModal from './MemberDetailModal';

// Types

// Génération de données mock
const generateMemberData = (): MemberFinancialData[] => {
  const noms = ['Tremblay', 'Martin', 'Dubois', 'Roy', 'Gagnon', 'Côté', 'Lavoie', 'Bergeron', 'Bouchard', 'Morin', 'Jean-Baptiste', 'Pierre-Louis', 'Estimé', 'François'];
  const prenoms = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'Gabriel', 'Hannah', 'Isaac', 'Julia', 'Marie', 'Jean', 'Rose', 'Paul'];
  
  const data: MemberFinancialData[] = [];
  
  for (let i = 0; i < 24; i++) {
    const estSaisonnier = Math.random() > 0.6;
    const baseRevenu = 15000 + Math.random() * 35000;
    const baseDepenses = baseRevenu * (0.5 + Math.random() * 0.3);
    
    // Générer historique 6-12 mois
    const nbMois = estSaisonnier ? 12 : 6;
    const historique: FinancialHistoryEntry[] = [];
    
   // Dans la boucle de génération d'historique
for (let m = nbMois - 1; m >= 0; m--) {
  const date = new Date();
  date.setMonth(date.getMonth() - m);
  const moisStr = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
  
  let revenu = baseRevenu;
  let depenses = baseDepenses;
  let cycle = 0; // ⬅️ DÉCLARER cycle ICI
  
  if (estSaisonnier) {
    // Variation saisonnière
    cycle = Math.sin((m / 12) * Math.PI * 2); // ⬅️ CALCULER cycle
    revenu = baseRevenu + (baseRevenu * 0.4 * cycle);
    depenses = baseDepenses + (baseDepenses * 0.2 * cycle);
  } else {
    // Variation aléatoire légère
    revenu += (Math.random() - 0.5) * baseRevenu * 0.15;
    depenses += (Math.random() - 0.5) * baseDepenses * 0.15;
  }
  
  historique.push({
    mois: moisStr,
    revenu: Math.max(0, revenu),
    depenses: Math.max(0, depenses),
    isSaisonnier: estSaisonnier && Math.abs(cycle) > 0.5
  });
}
    
    const revenuMoyen = historique.reduce((sum, h) => sum + h.revenu, 0) / historique.length;
    const depensesMoyennes = historique.reduce((sum, h) => sum + h.depenses, 0) / historique.length;
    const capacite = revenuMoyen - depensesMoyennes;
    
    const aPret = Math.random() > 0.4;
    let ratioEndettement = 0;
    let dernierPret;
    
    if (aPret) {
        const montantPret = Math.floor(capacite * (3 + Math.random() * 6));
        const mensualite = montantPret / (12 + Math.floor(Math.random() * 24));
        ratioEndettement = mensualite / revenuMoyen;
        
        const random = Math.random();
        
        dernierPret = {
            montant: montantPret,
            statut: (random > 0.7 
            ? 'en_cours' 
            : random > 0.4 
                ? 'rembourse' 
                : 'en_retard') as 'en_cours' | 'rembourse' | 'en_retard',
            mensualite
        };
        }
    // Score de stabilité (0-100)
    const variance = historique.reduce((sum, h) => {
      const diff = h.revenu - revenuMoyen;
      return sum + (diff * diff);
    }, 0) / historique.length;
    const coeffVariation = Math.sqrt(variance) / revenuMoyen;
    const scoreStabilite = Math.max(0, Math.min(100, 100 - (coeffVariation * 200)));
    
    const anciennete = 6 + Math.floor(Math.random() * 48);
    const nombrePrets = Math.floor(anciennete / 12) + Math.floor(Math.random() * 3);
    const tauxRemboursement = 85 + Math.random() * 15;
    
    data.push({
      id: `MEM${1000 + i}`,
      nom: noms[Math.floor(Math.random() * noms.length)],
      prenom: prenoms[Math.floor(Math.random() * prenoms.length)],
      historique,
      revenuMensuelMoyen: revenuMoyen,
      depensesMensuellesMoyennes: depensesMoyennes,
      capaciteRemboursement: capacite,
      ratioEndettement,
      scoreStabilite,
      estSaisonnier,
      dernierPret,
      anciennete,
      nombrePrets,
      tauxRemboursement
    });
  }
  
  return data.sort((a, b) => b.scoreStabilite - a.scoreStabilite);
};


// Composant principal
const FinancialAnalysisDashboard = () => {
  const [members] = useState<MemberFinancialData[]>(generateMemberData());
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedMember, setSelectedMember] = useState<MemberFinancialData | null>(null);
  
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = 
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesScore = true;
      if (scoreFilter === 'high') matchesScore = m.scoreStabilite >= 75;
      if (scoreFilter === 'medium') matchesScore = m.scoreStabilite >= 50 && m.scoreStabilite < 75;
      if (scoreFilter === 'low') matchesScore = m.scoreStabilite < 50;
      
      return matchesSearch && matchesScore;
    });
  }, [members, searchTerm, scoreFilter]);
  
  const stats = useMemo(() => {
    return {
      total: members.length,
      high: members.filter(m => m.scoreStabilite >= 75).length,
      medium: members.filter(m => m.scoreStabilite >= 50 && m.scoreStabilite < 75).length,
      low: members.filter(m => m.scoreStabilite < 50).length,
      avgScore: members.reduce((sum, m) => sum + m.scoreStabilite, 0) / members.length,
      saisonniers: members.filter(m => m.estSaisonnier).length
    };
  }, [members]);
  
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyse Financière des Membres</h1>
              <p className="text-gray-600">Évaluation de la capacité de remboursement et stabilité financière</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total des membres</p>
              <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
            </div>
          </div>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-600 mb-1">Score Élevé (75+)</p>
              <p className="text-2xl font-bold text-green-700">{stats.high}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-600 mb-1">Score Moyen (50-74)</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.medium}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600 mb-1">Score Faible (&lt;50)</p>
              <p className="text-2xl font-bold text-red-700">{stats.low}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-600 mb-1">Score Moyen</p>
              <p className="text-2xl font-bold text-purple-700">{stats.avgScore.toFixed(0)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 mb-1">Saisonniers</p>
              <p className="text-2xl font-bold text-blue-700">{stats.saisonniers}</p>
            </div>
          </div>
          
          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setScoreFilter('all')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  scoreFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setScoreFilter('high')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  scoreFilter === 'high'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
                }`}
              >
                Élevé
              </button>
              <button
                onClick={() => setScoreFilter('medium')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  scoreFilter === 'medium'
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-yellow-400'
                }`}
              >
                Moyen
              </button>
              <button
                onClick={() => setScoreFilter('low')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  scoreFilter === 'low'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-red-400'
                }`}
              >
                Faible
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grille de membres */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun membre trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Modal */}
      {selectedMember && (
        <MemberDetailModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default FinancialAnalysisDashboard;