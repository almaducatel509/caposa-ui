'use client';
import React, { useState } from 'react';
import { FaLock, FaExchangeAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { BiImport, BiExport } from 'react-icons/bi';
import VaultMovementModal from './VaultMovementModal';
import VaultDeclarationModal from './VaultDeclarationModal';

interface VaultStats {
  currentBalance: number;
  todayIn: number;
  todayOut: number;
  lastDeclaration?: {
    date: string;
    amount: number;
    declaredBy: string;
    difference: number;
  };
  pendingMovements: number;
}

const VaultOverview: React.FC = () => {
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');

  // Données mockées - à remplacer par fetch API
  const stats: VaultStats = {
    currentBalance: 45000.00,
    todayIn: 12340.00,
    todayOut: 8500.00,
    lastDeclaration: {
      date: '2026-02-11T17:30:00',
      amount: 45000.00,
      declaredBy: 'Luc Gagnon',
      difference: 0
    },
    pendingMovements: 0
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-CA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenMovement = (type: 'in' | 'out') => {
    setMovementType(type);
    setShowMovementModal(true);
  };
  
  
  const handleViewHistory = () => {
    // Navigation vers page historique complète
    window.location.href = 'http://localhost:3000/dashboard/treasury/vault/history';
    // Ou avec Next.js router:
    // router.push('/treasury/coffre/history');
        console.log('Voir historique des mouvements coffre');

  };

  return (
    <div className="w-full p-4 space-y-8">

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde actuel - Bleu pétrole */}
        <div className="bg-linear-to-br from-[#355C7D] to-[#2A4A5E] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaLock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Solde Coffre</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.currentBalance)}</p>
            <div className="flex items-center gap-1 text-blue-100 text-xs">
              Réserves sécurisées
            </div>
          </div>
        </div>

        {/* Entrées du jour - Vert sauge */}
        <div className="bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BiImport className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Entrées (Aujourd'hui)</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.todayIn)}</p>
            <div className="flex items-center gap-1 text-green-100 text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Remises, dépôts
            </div>
          </div>
        </div>

        {/* Sorties du jour - Orange */}
        <div className="bg-gradient-to-br from-[#ff9800] to-[#f57c00] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BiExport className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">Sorties (Aujourd'hui)</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.todayOut)}</p>
            <div className="flex items-center gap-1 text-orange-100 text-xs">
              Fonds de caisse, transferts
            </div>
          </div>
        </div>

        {/* Mouvement net - Vert CAPOSA */}
        <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaExchangeAlt className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Mouvement Net</p>
            <p className="text-4xl font-bold text-white mb-1">
              {formatCurrency(stats.todayIn - stats.todayOut)}
            </p>
            <div className="flex items-center gap-1 text-green-100 text-xs">
              {stats.todayIn > stats.todayOut ? '↑ Positif' : '↓ Négatif'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entrée au coffre */}
        <button
          onClick={() => handleOpenMovement('in')}
          className="group p-8 bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-[#2E7D32] hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#81C784] to-[#66BB6A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <BiImport className="w-8 h-8 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#2E7D32] transition-colors">
                Entrée au Coffre
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Remise de caisse, dépôt, versement banque
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </button>

        {/* Sortie du coffre */}
        <button
          onClick={() => handleOpenMovement('out')}
          className="group p-8 bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-[#ff9800] hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff9800] to-[#f57c00] flex items-center justify-center group-hover:scale-110 transition-transform">
              <BiExport className="w-8 h-8 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#ff9800] transition-colors">
                Sortie du Coffre
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Fonds de caisse, réapprovisionnement
              </p>
            </div>
            <div className="text-4xl">📤</div>
          </div>
        </button>
      </div>

      {/* État et dernière déclaration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* État actuel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-[#2E7D32]" />
            État du Coffre
          </h3>
          
          <div className="space-y-4">
            {stats.pendingMovements === 0 ? (
              <div className="p-4 bg-[#DDEAD5] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Coffre à jour</span>
                  <span className="px-3 py-1 bg-[#2E7D32] text-white text-xs font-semibold rounded-full">
                    OK
                  </span>
                </div>
                <p className="text-sm text-gray-600">Tous les mouvements sont enregistrés</p>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Actions en attente</span>
                  <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                    {stats.pendingMovements}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Mouvements non validés</p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-3">Solde théorique</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Solde d'hier</span>
                  <span className="font-medium">{formatCurrency(stats.currentBalance - stats.todayIn + stats.todayOut)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>+ Entrées</span>
                  <span className="font-medium">{formatCurrency(stats.todayIn)}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>- Sorties</span>
                  <span className="font-medium">{formatCurrency(stats.todayOut)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                  <span>Solde attendu</span>
                  <span className="text-[#2E7D32]">{formatCurrency(stats.currentBalance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dernière déclaration */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernière Déclaration</h3>
          
          {stats.lastDeclaration ? (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDateTime(stats.lastDeclaration.date)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Déclaré par</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.lastDeclaration.declaredBy}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Montant compté</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(stats.lastDeclaration.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Écart</span>
                  <span className={`text-lg font-bold ${
                    stats.lastDeclaration.difference === 0 
                      ? 'text-[#2E7D32]' 
                      : 'text-red-600'
                  }`}>
                    {stats.lastDeclaration.difference === 0 
                      ? '✓ Aucun' 
                      : formatCurrency(Math.abs(stats.lastDeclaration.difference))}
                  </span>
                </div>
              </div>

              {stats.lastDeclaration.difference === 0 && (
                <div className="p-3 bg-[#DDEAD5] border border-[#2E7D32]/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-[#2E7D32]" />
                    <span className="text-sm font-medium text-gray-900">
                      Déclaration conforme
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClipboardList className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-600 mb-4">Aucune déclaration aujourd'hui</p>
              <button
                onClick={() => setShowDeclarationModal(true)}
                className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C9B27C] transition-colors font-medium"
              >
                Déclarer maintenant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rappel de fin de journée */}
      <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#C9B27C]/10 rounded-2xl p-6 border-2 border-[#D4AF37]/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📋</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              N'oubliez pas la déclaration de fin de journée !
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Chaque soir, le trésorier doit compter physiquement le contenu du coffre et enregistrer une déclaration. 
              Cela permet de détecter les écarts et d'assurer la traçabilité.
            </p>
            <button
              onClick={() => setShowDeclarationModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9B27C] text-white rounded-lg hover:from-[#C9B27C] hover:to-[#D4AF37] font-semibold transition-all shadow-md"
            >
              Déclarer le coffre
            </button>
          </div>
        </div>
      </div>

      {/* Historique récent */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Mouvements Récents</h3>
            <button
              onClick={handleViewHistory}
              className="text-sm text-[#355C7D] hover:text-[#2A4A5E] font-medium flex items-center gap-2"
            >
              Voir tout l'historique
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Exemple de mouvements récents - à remplacer par données API */}
            {[
              {
                id: 1,
                type: 'out' as const,
                amount: 2000,
                time: '08:30',
                performedBy: 'Luc Gagnon',
                note: 'Fonds de caisse matinal'
              },
              {
                id: 2,
                type: 'in' as const,
                amount: 5420,
                time: '17:15',
                performedBy: 'Marie Tremblay',
                note: 'Remise caisse principale'
              },
              {
                id: 3,
                type: 'out' as const,
                amount: 1500,
                time: '09:45',
                performedBy: 'Paul Martin',
                note: 'Réapprovisionnement caisse 2'
              },
              {
                id: 4,
                type: 'in' as const,
                amount: 3200,
                time: '16:30',
                performedBy: 'Sophie Lavoie',
                note: 'Excédent caisse secondaire'
              },
              {
                id: 5,
                type: 'out' as const,
                amount: 800,
                time: '10:15',
                performedBy: 'Luc Gagnon',
                note: 'Monnaie pour change'
              }
            ].map((movement) => (
              <div
                key={movement.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Icon & Type */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    movement.type === 'in' 
                      ? 'bg-green-100' 
                      : 'bg-orange-100'
                  }`}>
                    {movement.type === 'in' ? (
                      <BiImport className="w-6 h-6 text-green-600" />
                    ) : (
                      <BiExport className="w-6 h-6 text-orange-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        movement.type === 'in'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {movement.type === 'in' ? 'ENTRÉE' : 'SORTIE'}
                      </span>
                      <span className="text-xs text-gray-500">{movement.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{movement.note}</p>
                    <p className="text-xs text-gray-600">Par {movement.performedBy}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      movement.type === 'in' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {movement.type === 'in' ? '+' : '-'} {formatCurrency(movement.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>    

        {/* Footer avec lien vers historique complet */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleViewHistory}
            className="w-full py-2 text-sm font-medium text-[#355C7D] hover:text-[#2A4A5E] transition-colors flex items-center justify-center gap-2"
          >
          
            <FaClipboardList />
            Afficher l'historique complet avec graphiques (ou non! on va voir)
          </button>
        </div>
      </div>

      

      {/* Modals */}
      <VaultMovementModal 
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
        movementType={movementType}
      />

      <VaultDeclarationModal 
        isOpen={showDeclarationModal}
        onClose={() => setShowDeclarationModal(false)}
      />
    </div>
  );
};

export default VaultOverview;