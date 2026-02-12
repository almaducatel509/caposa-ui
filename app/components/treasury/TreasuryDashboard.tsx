'use client';
import React, { useState } from 'react';
import { FaMoneyBillWave, FaLock, FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';
import { BiImport } from 'react-icons/bi';
import PageHeader from '../header';
import CashHandoverModal from './CashHandoverModal';
import { TreasuryStats } from '@/types/tresorerie';


const TreasuryOverview: React.FC = () => {
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Données mockées - à remplacer par fetch API
  const stats: TreasuryStats = {
    cashAvailable: 15420.50,
    vaultBalance: 45000.00,
    todayInflow: 8340.00,
    todayOutflow: 3210.00,
    pendingReconciliation: 2,
    lastHandover: {
      date: '2026-02-10T08:45:00',
      amount: 2000.00,
      handedBy: 'Jean Dupont',
      receivedBy: 'Marie Tremblay'
    }
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

  const handleOpenCashSession = () => {
    console.log('Ouvrir session de caisse');
    // TODO: Implémenter ouverture session
  };

  return (
    <div className="w-full p-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Trésorerie"
          subtitle="Vue d'ensemble et gestion quotidienne"
        />
        
        <div className="flex gap-3">
          <button
            onClick={handleOpenCashSession}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
          >
            <FaLock className="text-sm" />
            Ouvrir Caisse
          </button>
          <button
            onClick={() => setShowHandoverModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-lg hover:from-[#1B5E20] hover:to-[#2E7D32] transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            <BiImport className="text-xl" />
            Remise de Caisse
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Encaisse disponible - Vert CAPOSA */}
        <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaMoneyBillWave className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Encaisse Disponible</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.cashAvailable)}</p>
            <div className="flex items-center gap-1 text-green-100 text-xs">
              Argent en circulation
            </div>
          </div>
        </div>

        {/* Coffre - Bleu pétrole */}
        <div className="bg-gradient-to-br from-[#355C7D] to-[#2A4A5E] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaLock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Solde Coffre</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.vaultBalance)}</p>
            <div className="flex items-center gap-1 text-blue-100 text-xs">
              Argent sécurisé
            </div>
          </div>
        </div>

        {/* Flux entrants - Vert sauge */}
        <div className="bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaExchangeAlt className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Flux Entrants (Aujourd'hui)</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.todayInflow)}</p>
            <div className="flex items-center gap-1 text-green-100 text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Dépôts, versements
            </div>
          </div>
        </div>

        {/* Flux sortants - Or doux */}
        <div className="bg-gradient-to-br from-[#D4AF37] to-[#C9B27C] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FaExchangeAlt className="w-6 h-6 text-white transform rotate-180" />
            </div>
          </div>
          <div>
            <p className="text-yellow-100 text-sm font-medium mb-1">Flux Sortants (Aujourd'hui)</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.todayOutflow)}</p>
            <div className="flex items-center gap-1 text-yellow-100 text-xs">
              Retraits, transferts
            </div>
          </div>
        </div>
      </div>

      {/* Section Status et Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* État de la caisse */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-[#2E7D32]" />
            État de la Caisse
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-[#DDEAD5] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Caisse ouverte</span>
                <span className="px-3 py-1 bg-[#2E7D32] text-white text-xs font-semibold rounded-full">
                  ACTIVE
                </span>
              </div>
              <p className="text-sm text-gray-600">Ouverte à 09:02 par Jean Dupont</p>
              <p className="text-sm text-gray-600">Montant initial: {formatCurrency(2000)}</p>
            </div>

            {stats.lastHandover && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">Dernière remise de caisse</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📅 {formatDateTime(stats.lastHandover.date)}</p>
                  <p>💰 {formatCurrency(stats.lastHandover.amount)}</p>
                  <p>👤 {stats.lastHandover.handedBy} → {stats.lastHandover.receivedBy}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alertes et Réconciliation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes & Actions</h3>
          
          <div className="space-y-3">
            {stats.pendingReconciliation > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{stats.pendingReconciliation}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-orange-900">Réconciliation en attente</p>
                    <p className="text-sm text-orange-700 mt-1">
                      {stats.pendingReconciliation} opération(s) nécessitent une vérification
                    </p>
                    <button className="mt-2 text-sm text-orange-600 hover:text-orange-800 font-medium">
                      Voir les détails →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-[#DDEAD5] border border-[#2E7D32]/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="text-white text-sm" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Tout est en ordre</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Aucune anomalie détectée dans les opérations du jour
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#DDEAD5]/30 transition-all">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">📊</span>
                <span className="font-medium">Voir le rapport complet</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Questions métier */}
      <div className="bg-gradient-to-r from-[#F9F9F6] to-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Réponses rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Combien d'argent en caisse ?</p>
            <p className="text-2xl font-bold text-[#2E7D32]">{formatCurrency(stats.cashAvailable)}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Le coffre est-il équilibré ?</p>
            <p className="text-2xl font-bold text-[#355C7D]">
              <FaCheckCircle className="inline text-[#2E7D32]" /> Oui
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Y a-t-il des écarts ?</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.pendingReconciliation === 0 ? (
                <span className="text-[#2E7D32]">Aucun</span>
              ) : (
                <span className="text-orange-600">{stats.pendingReconciliation}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Remise de Caisse */}
      <CashHandoverModal 
        isOpen={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
      />
    </div>
  );
};

export default TreasuryOverview;