'use client'
import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, Calendar, FileText, X, ChevronRight, Activity, PieChart as PieChartIcon, BarChart3, AlertTriangle, Sun, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { FinancialHistoryEntry, MemberFinancialData } from '@/types/analyses';
import MemberCard from './MemberCardAnalyse';
import MemberDetailModal from './MemberDetailModal';


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

interface AnalysisCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string; // ex: "bg-green-500"
  subValue?: string;
}

const AnalysisCard = ({ icon: Icon, label, value, subValue, trend, color }: any) => (  
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{label}</p>

      {subValue && (
        <p className="text-xs text-gray-500 mt-1">{subValue}</p>
      )}
    </div>
  );


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
    <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-indigo-50 md:p-8">
      {/* Header */}
            {/* Filtres */}
      <div className="mb-6 flex gap-3">
          {(['all', 'high', 'medium', 'low'] as const).map(score => (
            <button
              key={score}
              onClick={() => setScoreFilter(score)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                scoreFilter === score
                  ? score === 'all' ? 'bg-blue-600 text-white shadow-lg' :
                    score === 'high' ? 'bg-green-600 text-white shadow-lg' :
                    score === 'medium' ? 'bg-orange-500 text-white shadow-lg' :
                    'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {score === 'all' ? 'Tous' : 
              score === 'high' ? 'Élevé' : 
              score === 'medium' ? 'Moyen' : 
              'Faible'}
            </button>
          ))}
      </div>
      {/* stats */}
      <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <AnalysisCard
          icon={CheckCircle}
          label="Score Élevé (75+)"
          value={stats.high}
          color="bg-green-500"
        />

        <AnalysisCard
          icon={AlertTriangle}
          label="Score Moyen (50-74)"
          value={stats.medium}
          color="bg-yellow-500"
        />

        <AnalysisCard
          icon={XCircle}
          label="Score Faible (<50)"
          value={stats.low}
          color="bg-red-500"
        />

        <AnalysisCard
          icon={BarChart}
          label="Score Moyen"
          value={stats.avgScore.toFixed(0)}
          color="bg-purple-500"
        />

        <AnalysisCard
          icon={Sun}
          label="Saisonniers"
          value={stats.saisonniers}
          color="bg-blue-500"
        />

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