'use client'
import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, Calendar, FileText, X, ChevronRight, Activity, PieChart as PieChartIcon, BarChart3, AlertTriangle, Sun, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { FinancialHistoryEntry, MemberFinancialData } from '@/types/analyses';
import MemberCard from './MemberCardAnalyse';
import MemberDetailModal from './MemberDetailModal';
import { generateMemberData } from './MemberDataMock';


// Génération de données mock

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