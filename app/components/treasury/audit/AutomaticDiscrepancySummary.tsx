'use client';
import React from 'react';
import { FaExclamationTriangle, FaLightbulb, FaArrowRight } from 'react-icons/fa';

interface DiscrepancyCause {
  source: string;
  sourceName: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'explained' | 'resolved';
  note?: string;
}

interface AutomaticDiscrepancySummaryProps {
  totalDiscrepancy: number;
  causes: DiscrepancyCause[];
}

const AutomaticDiscrepancySummary: React.FC<AutomaticDiscrepancySummaryProps> = ({ 
  totalDiscrepancy, 
  causes 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      cash: '💵',
      bank_deposit: '🏦',
      agent: '👤',
      transaction: '📝'
    };
    return icons[source] || '📊';
  };

  // Trier les causes par montant (valeur absolue) décroissant
  const sortedCauses = [...causes].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  // Identifier la cause principale (plus gros montant)
  const mainCause = sortedCauses[0];
  const secondaryCauses = sortedCauses.slice(1, 3); // Top 3 au maximum

  if (totalDiscrepancy === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900">Aucun écart détecté</h3>
            <p className="text-sm text-green-700">La caisse est parfaitement équilibrée</p>
          </div>
        </div>
        <p className="text-sm text-green-800">
          Le cash théorique correspond exactement au cash réel compté. Aucune investigation nécessaire.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <FaLightbulb className="text-white text-xl" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            🔍 Analyse Automatique des Écarts
          </h3>
          <p className="text-sm text-gray-700">
            Intelligence métier - Causes probables identifiées
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">Écart total</p>
          <p className={`text-2xl font-bold ${totalDiscrepancy > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(totalDiscrepancy))}
          </p>
        </div>
      </div>

      {/* Cause principale */}
      {mainCause && (
        <div className="bg-white rounded-xl p-5 mb-4 border-2 border-orange-400 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{getSourceIcon(mainCause.source)}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900">Cause Principale</h4>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                  {mainCause.percentage.toFixed(0)}% de l'écart
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{mainCause.sourceName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaArrowRight className="text-orange-500" />
              <span className="text-sm text-gray-700">Impact financier:</span>
            </div>
            <span className={`text-xl font-bold ${mainCause.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(mainCause.amount))}
              <span className="text-sm ml-1">
                ({mainCause.amount > 0 ? 'surplus' : 'manque'})
              </span>
            </span>
          </div>

          {/* Note si disponible */}
          {mainCause.note && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">📝 Explication:</p>
              <p className="text-sm text-blue-800">{mainCause.note}</p>
            </div>
          )}

          {/* Statut */}
          {!mainCause.note && mainCause.status === 'pending' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Cette cause nécessite une explication
              </p>
            </div>
          )}
        </div>
      )}

      {/* Causes secondaires */}
      {secondaryCauses.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Autres causes identifiées:
          </h4>
          {secondaryCauses.map((cause, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{getSourceIcon(cause.source)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{cause.sourceName}</p>
                    {cause.note && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                        📝 {cause.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-lg font-bold ${cause.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(cause.amount))}
                  </p>
                  <p className="text-xs text-gray-500">
                    {cause.percentage.toFixed(0)}% de l'écart
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Graphique visuel simple */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-3">Répartition des écarts:</p>
        <div className="space-y-2">
          {sortedCauses.slice(0, 5).map((cause, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-32 truncate">{cause.sourceName}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full flex items-center justify-end px-2 text-xs font-semibold text-white ${
                    cause.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${cause.percentage}%` }}
                >
                  {cause.percentage >= 15 && `${cause.percentage.toFixed(0)}%`}
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-700 w-20 text-right">
                {formatCurrency(Math.abs(cause.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations */}
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-2">
          <FaExclamationTriangle className="text-blue-600 mt-1" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">💡 Recommandations:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {causes.some(c => c.status === 'pending') && (
                <li>• {causes.filter(c => c.status === 'pending').length} écart(s) nécessitent une explication</li>
              )}
              {mainCause && Math.abs(mainCause.amount) > Math.abs(totalDiscrepancy) * 0.7 && (
                <li>• Concentrez-vous d'abord sur la cause principale ({mainCause.percentage.toFixed(0)}% de l'écart)</li>
              )}
              {causes.length > 3 && (
                <li>• Plusieurs petits écarts - vérifiez les procédures de saisie</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomaticDiscrepancySummary;