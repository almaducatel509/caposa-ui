'use client';
import React, { useState } from 'react';
import { FaMoneyBillWave, FaLock, FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';
import { BiImport } from 'react-icons/bi';
import PageHeader from '../header';
import CashHandoverModal from './CashHandoverModal';
import { TreasuryStats } from '@/types/tresorerie';
import CashOpeningModal from './Encaisse/CashOpeningModal';

const TreasuryOverview: React.FC = () => {
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showOpeningModal,  setShowOpeningModal]  = useState(false);

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
      receivedBy: 'Marie Tremblay',
    },
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(value);

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('fr-CA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Trésorerie"
          subtitle="Vue d'ensemble et gestion quotidienne"
        />
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => setShowOpeningModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:border-[#2E7D32]/30 transition-colors"
          >
            <FaLock className="w-3.5 h-3.5" />
            Ouvrir Caisse
          </button>
          <button
            onClick={() => setShowHandoverModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <BiImport className="w-4 h-4" />
            Remise de Caisse
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FaMoneyBillWave, label: 'Encaisse Disponible',         value: stats.cashAvailable, sub: 'Argent en circulation',  from: 'from-[#2E7D32]', to: 'to-[#1B5E20]' },
          { icon: FaLock,          label: 'Solde Coffre',                value: stats.vaultBalance,  sub: 'Argent sécurisé',        from: 'from-[#355C7D]', to: 'to-[#2A4A5E]' },
          { icon: FaExchangeAlt,   label: "Flux Entrants (Aujourd'hui)", value: stats.todayInflow,   sub: 'Dépôts, versements',     from: 'from-[#81C784]', to: 'to-[#66BB6A]' },
          { icon: FaExchangeAlt,   label: "Flux Sortants (Aujourd'hui)", value: stats.todayOutflow,  sub: 'Retraits, transferts',   from: 'from-[#D4AF37]', to: 'to-[#C9B27C]' },
        ].map(({ icon: Icon, label, value, sub, from, to }) => (
          <div key={label} className={`bg-linear-to-br ${from} ${to} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/80 text-xs font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(value)}</p>
            <p className="text-white/70 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── État caisse + Alertes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-[#2E7D32]" />
            État de la Caisse
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[#DDEAD5] rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-900">Caisse ouverte</span>
                <span className="px-2.5 py-0.5 bg-[#2E7D32] text-white text-xs font-bold rounded-full">ACTIVE</span>
              </div>
              <p className="text-xs text-gray-600">Ouverte à 09:02 par Jean Dupont</p>
              <p className="text-xs text-gray-600">Montant initial : {formatCurrency(2000)}</p>
            </div>

            {stats.lastHandover && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-700 mb-2">Dernière remise de caisse</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>📅 {formatDateTime(stats.lastHandover.date)}</p>
                  <p>💰 {formatCurrency(stats.lastHandover.amount)}</p>
                  <p>👤 {stats.lastHandover.handedBy} → {stats.lastHandover.receivedBy}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Alertes & Actions</h3>
          <div className="space-y-3">
            {stats.pendingReconciliation > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">{stats.pendingReconciliation}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-900">Réconciliation en attente</p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    {stats.pendingReconciliation} opération(s) nécessitent une vérification
                  </p>
                  <button className="mt-1.5 text-xs text-orange-600 hover:text-orange-800 font-medium">
                    Voir les détails →
                  </button>
                </div>
              </div>
            )}
            <div className="p-4 bg-[#DDEAD5] border border-[#2E7D32]/20 rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 bg-[#2E7D32] rounded-full flex items-center justify-center shrink-0">
                <FaCheckCircle className="text-white text-xs" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Tout est en ordre</p>
                <p className="text-xs text-gray-600 mt-0.5">Aucune anomalie détectée dans les opérations du jour</p>
              </div>
            </div>
            <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#DDEAD5]/30 transition-all flex items-center justify-center gap-2">
              <span className="text-lg">📊</span>
              Voir le rapport complet
            </button>
          </div>
        </div>
      </div>

      {/* ── Réponses rapides ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Réponses rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { q: "Combien d'argent en caisse ?",    v: formatCurrency(stats.cashAvailable),     color: 'text-[#2E7D32]' },
            { q: 'Le coffre est-il équilibré ?',    v: '✓ Oui',                                  color: 'text-[#2E7D32]' },
            { q: 'Y a-t-il des écarts ?',           v: stats.pendingReconciliation === 0 ? 'Aucun' : String(stats.pendingReconciliation), color: stats.pendingReconciliation === 0 ? 'text-[#2E7D32]' : 'text-orange-600' },
          ].map(({ q, v, color }) => (
            <div key={q} className="p-4 bg-[#F9F9F6] rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-2">{q}</p>
              <p className={`text-xl font-bold ${color}`}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modals ── */}
      <CashHandoverModal  isOpen={showHandoverModal} onClose={() => setShowHandoverModal(false)} />
      <CashOpeningModal   isOpen={showOpeningModal}  onClose={() => setShowOpeningModal(false)}  />
    </div>
  );
};

export default TreasuryOverview;