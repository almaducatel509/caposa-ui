// app/analyse/kpis/PerformanceSummaryCard.tsx
'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { KpiData } from '@/types/kpis';

interface PerformanceData {
  score: number; // 0-100
  niveau: 'Faible' | 'Moyen' | 'Bon';
  tendance: 'amélioration' | 'stable' | 'détérioration';
  alertes: string[];
  justification: {
    remboursement: { score: number; texte: string };
    liquidite: { score: number; texte: string };
    croissance: { score: number; texte: string };
  };
}

interface PerformanceSummaryCardProps {
  data: KpiData;
}

export default function PerformanceSummaryCard({ data }: PerformanceSummaryCardProps) {
  const performance = useMemo((): PerformanceData => {
    // 1. CALCUL DU SCORE (0-100)
    // Remboursement 40%
    const scoreRemboursement = (data.tauxRecouvrement / 100) * 40;
    const remboursementPct = Math.round((data.tauxRecouvrement / 100) * 100);
    
    // Liquidité 30%
    const scoreLiquidite = Math.min((data.ratioLiquidite / 2.0) * 30, 30); // Max à ratio 2.0
    const liquiditePct = Math.round((Math.min(data.ratioLiquidite / 2.0, 1)) * 100);
    
    // Croissance 30% (moyenne de la stabilité et activité membres)
    const scoreCroissance = ((data.scoreStabiliteMoyen / 100) * 15) + 
                           ((data.tauxActiviteMembres / 100) * 15);
    const croissancePct = Math.round(((data.scoreStabiliteMoyen + data.tauxActiviteMembres) / 2));
    
    const scoreTotal = Math.round(scoreRemboursement + scoreLiquidite + scoreCroissance);
    
    // 2. NIVEAU (Faible/Moyen/Bon)
    let niveau: 'Faible' | 'Moyen' | 'Bon';
    if (scoreTotal < 50) niveau = 'Faible';
    else if (scoreTotal < 75) niveau = 'Moyen';
    else niveau = 'Bon';
    
    // 3. JUSTIFICATION DU SCORE (vocabulaire ultra-simple)
    const justification = {
      remboursement: {
        score: remboursementPct,
        texte: data.tauxRecouvrement >= 95 
          ? `${data.tauxRecouvrement.toFixed(1)}% des prêts sont remboursés à temps. Excellent !`
          : data.tauxRecouvrement >= 90
          ? `${data.tauxRecouvrement.toFixed(1)}% des prêts sont remboursés. C'est bien, mais on peut faire mieux.`
          : `Seulement ${data.tauxRecouvrement.toFixed(1)}% des prêts sont remboursés. Attention : risque élevé.`
      },
      liquidite: {
        score: liquiditePct,
        texte: data.ratioLiquidite >= 1.5
          ? `La caisse a assez d'argent pour honorer tous les retraits. Très rassurant.`
          : data.ratioLiquidite >= 1.2
          ? `La caisse a de l'argent disponible, mais il faut rester vigilant.`
          : `Attention : la caisse manque d'argent liquide pour les retraits urgents.`
      },
      croissance: {
        score: croissancePct,
        texte: croissancePct >= 80
          ? `${croissancePct}% des membres sont actifs et stables. La caisse grandit bien.`
          : croissancePct >= 70
          ? `${croissancePct}% des membres sont actifs. La croissance est modérée.`
          : `${croissancePct}% des membres sont actifs. Beaucoup de membres sont inactifs.`
      }
    };
    
    // 4. TENDANCE (mock pour demo - en prod, comparer avec mois précédent)
    // Simuler une tendance basée sur les KPI actuels
    const mockTendance = scoreTotal >= 70 ? 'amélioration' : 
                         scoreTotal >= 60 ? 'stable' : 
                         'détérioration';
    
    // 5. ALERTES (2-3 max, vocabulaire simple comme si on parlait à un agriculteur)
    const alertes: string[] = [];
    
    if (data.tauxRecouvrement < 95) {
      alertes.push('⚠️ Certains membres ne remboursent pas à temps leurs prêts');
    }
    
    if (data.ratioLiquidite < 1.5) {
      alertes.push('💰 La caisse a peu d\'argent disponible pour les retraits urgents');
    }
    
    if (data.ratioCreancesDouteuses > 5) {
      alertes.push('🚨 Trop de prêts risquent de ne jamais être remboursés');
    }
    
    if (data.tauxActiviteMembres < 85) {
      alertes.push('👥 Beaucoup de membres n\'utilisent plus la caisse');
    }
    
    // Limiter à 3 alertes max
    const alertesFinales = alertes.slice(0, 3);
    
    // Ajouter un message positif si aucune alerte
    if (alertesFinales.length === 0) {
      alertesFinales.push('✅ Tout va bien ! Tous les indicateurs sont bons');
    }
    
    return {
      score: scoreTotal,
      niveau,
      tendance: mockTendance,
      alertes: alertesFinales,
      justification
    };
  }, [data]);

  // Couleurs selon niveau
  const niveauColors = {
    Faible: {
      bg: 'from-red-50 to-red-100',
      border: 'border-red-200',
      text: 'text-red-900',
      badge: 'bg-red-500',
      icon: 'text-red-600'
    },
    Moyen: {
      bg: 'from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      badge: 'bg-yellow-500',
      icon: 'text-yellow-600'
    },
    Bon: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-900',
      badge: 'bg-green-500',
      icon: 'text-green-600'
    }
  };

  const colors = niveauColors[performance.niveau];

  // Icône de tendance
  const TendanceIcon = performance.tendance === 'amélioration' ? TrendingUp :
                       performance.tendance === 'détérioration' ? TrendingDown :
                       Minus;

  const tendanceColor = performance.tendance === 'amélioration' ? 'text-green-600' :
                        performance.tendance === 'détérioration' ? 'text-red-600' :
                        'text-gray-600';

  const tendanceText = performance.tendance === 'amélioration' ? 'Amélioration depuis 2 mois' :
                       performance.tendance === 'détérioration' ? 'Détérioration depuis 2 mois' :
                       'Performance stable';

  return (
    <div className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-6 shadow-lg`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            📊 Santé de la Caisse
          </h2>
          <p className="text-sm text-gray-600">
            Note globale : comment va notre caisse ?
          </p>
        </div>
        
        {/* Badge niveau */}
        <div className={`px-4 py-2 rounded-full ${colors.badge} text-white font-bold text-sm shadow-md`}>
          {performance.niveau}
        </div>
      </div>

      {/* Score & Tendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Score */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/40">
          <p className="text-sm font-semibold text-gray-600 mb-2">Note Globale</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${colors.text}`}>
              {performance.score}
            </span>
            <span className="text-2xl text-gray-500 font-medium">/100</span>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.badge} transition-all duration-700 ease-out rounded-full`}
              style={{ width: `${performance.score}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-600 mt-3">
            {performance.score >= 75 ? '👍 La caisse est en bonne santé' :
             performance.score >= 50 ? '⚠️ La caisse va moyennement bien' :
             '🚨 La caisse a des problèmes à résoudre'}
          </p>
        </div>

        {/* Tendance */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/40">
          <p className="text-sm font-semibold text-gray-600 mb-2">Évolution</p>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${tendanceColor}`}>
              <TendanceIcon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`text-lg font-bold ${tendanceColor}`}>
                {performance.tendance === 'amélioration' ? '↑ Ça s\'améliore' :
                 performance.tendance === 'détérioration' ? '↓ Ça se dégrade' :
                 '→ Ça reste stable'}
              </p>
              <p className="text-sm text-gray-600">
                {performance.tendance === 'amélioration' ? 'Continuez comme ça !' :
                 performance.tendance === 'détérioration' ? 'Il faut agir vite' :
                 'Maintenez les efforts'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* JUSTIFICATION DU SCORE - Le "pourquoi" du bulletin */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/40 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-indigo-600" />
          <p className="text-sm font-semibold text-gray-700">Pourquoi cette note de {performance.score}/100 ?</p>
        </div>
        
        <div className="space-y-4">
          {/* Remboursement - 40% */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-sm font-semibold text-gray-700">1. Remboursement des prêts</span>
              </div>
              <span className="text-sm font-bold text-indigo-600">40% du score</span>
            </div>
            <p className="text-sm text-gray-600 pl-4">{performance.justification.remboursement.texte}</p>
          </div>
          
          {/* Liquidité - 30% */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-gray-700">2. Argent disponible</span>
              </div>
              <span className="text-sm font-bold text-blue-600">30% du score</span>
            </div>
            <p className="text-sm text-gray-600 pl-4">{performance.justification.liquidite.texte}</p>
          </div>
          
          {/* Croissance - 30% */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-gray-700">3. Membres actifs</span>
              </div>
              <span className="text-sm font-bold text-green-600">30% du score</span>
            </div>
            <p className="text-sm text-gray-600 pl-4">{performance.justification.croissance.texte}</p>
          </div>
        </div>
      </div>

      {/* Alertes */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/40">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-gray-700" />
          <p className="text-sm font-semibold text-gray-700">Ce qu'il faut surveiller</p>
        </div>
        
        <div className="space-y-2">
          {performance.alertes.map((alerte, index) => (
            <div key={index} className="flex items-start gap-3 bg-white/40 rounded-lg p-3">
              <p className="text-sm text-gray-700 leading-relaxed">{alerte}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer explicatif simplifié */}
      <div className="mt-5 pt-5 border-t border-white/40">
        <p className="text-xs text-gray-600 leading-relaxed">
          💡 <span className="font-semibold">Comment on calcule :</span> On additionne 3 choses importantes → 
          Remboursements (40 points) + Argent disponible (30 points) + Membres actifs (30 points) = Total sur 100
        </p>
      </div>
    </div>
  );
}