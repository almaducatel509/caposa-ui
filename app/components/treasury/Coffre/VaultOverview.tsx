'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaExchangeAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { BiImport, BiExport } from 'react-icons/bi';
import PageHeader from '@/app/components/header';
import VaultMovementModal from './VaultMovementModal';
import VaultDeclarationModal from './VaultDeclarationModal';
import { ArrowLeft } from 'lucide-react';

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
  const router = useRouter();
  const [showMovementModal,    setShowMovementModal]    = useState(false);
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [movementType,         setMovementType]         = useState<'in' | 'out'>('in');

  const stats: VaultStats = {
    currentBalance: 45000.00,
    todayIn: 12340.00,
    todayOut: 8500.00,
    lastDeclaration: {
      date: '2026-02-11T17:30:00',
      amount: 45000.00,
      declaredBy: 'Luc Gagnon',
      difference: 0,
    },
    pendingMovements: 0,
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(value);

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('fr-CA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const handleOpenMovement = (type: 'in' | 'out') => {
    setMovementType(type);
    setShowMovementModal(true);
  };

  const handleViewHistory = () => {
    router.push('/dashboard/treasury/vault/history');
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
      <button onClick={() => router.push('/dashboard/treasury')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E7D32] transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" />
        Retour à la Trésorerie
      </button>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Coffre"
          subtitle="Gestion des réserves et mouvements"
        />
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleViewHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-[#355C7D] hover:bg-[#355C7D]/10 transition-colors"
          >
            <FaClipboardList className="w-3.5 h-3.5" />
            Historique
          </button>
          <button
            onClick={() => setShowDeclarationModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#D4AF37] to-[#C9B27C] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <FaClipboardList className="w-3.5 h-3.5" />
            Déclarer Coffre
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FaLock,        label: 'Solde Coffre',            value: stats.currentBalance,               sub: 'Réserves sécurisées',      from: 'from-[#355C7D]', to: 'to-[#2A4A5E]' },
          { icon: BiImport,      label: "Entrées (Aujourd'hui)",   value: stats.todayIn,                      sub: 'Remises, dépôts',          from: 'from-[#81C784]', to: 'to-[#66BB6A]' },
          { icon: BiExport,      label: "Sorties (Aujourd'hui)",   value: stats.todayOut,                     sub: 'Fonds de caisse, transferts', from: 'from-[#ff9800]', to: 'to-[#f57c00]' },
          { icon: FaExchangeAlt, label: 'Mouvement Net',           value: stats.todayIn - stats.todayOut,    sub: stats.todayIn > stats.todayOut ? '↑ Positif' : '↓ Négatif', from: 'from-[#2E7D32]', to: 'to-[#1B5E20]' },
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

      {/* ── Actions rapides ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => handleOpenMovement('in')}
          className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#2E7D32]/40 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#81C784] to-[#66BB6A] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <BiImport className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 group-hover:text-[#2E7D32] transition-colors">Entrée au Coffre</h3>
              <p className="text-sm text-gray-500 mt-0.5">Remise de caisse, dépôt, versement banque</p>
            </div>
            
          </div>
        </button>

        <button onClick={() => handleOpenMovement('out')}
          className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#ff9800] to-[#f57c00] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <BiExport className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Sortie du Coffre</h3>
              <p className="text-sm text-gray-500 mt-0.5">Fonds de caisse, réapprovisionnement</p>
            </div>
            
          </div>
        </button>
      </div>

      {/* ── État + Dernière déclaration ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-[#2E7D32]" /> État du Coffre
          </h3>
          <div className="space-y-3">
            {stats.pendingMovements === 0 ? (
              <div className="p-4 bg-[#DDEAD5] rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Coffre à jour</p>
                  <p className="text-xs text-gray-600">Tous les mouvements sont enregistrés</p>
                </div>
                <span className="px-2.5 py-0.5 bg-[#2E7D32] text-white text-xs font-bold rounded-full">OK</span>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Actions en attente</p>
                  <p className="text-xs text-gray-600">Mouvements non validés</p>
                </div>
                <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">{stats.pendingMovements}</span>
              </div>
            )}
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Solde théorique</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Solde d'hier", value: formatCurrency(stats.currentBalance - stats.todayIn + stats.todayOut), color: 'text-gray-700' },
                  { label: '+ Entrées',    value: formatCurrency(stats.todayIn),   color: 'text-[#2E7D32]' },
                  { label: '- Sorties',    value: formatCurrency(stats.todayOut),  color: 'text-orange-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className={`font-medium ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                  <span className="text-gray-900">Solde attendu</span>
                  <span className="text-[#2E7D32]">{formatCurrency(stats.currentBalance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Dernière Déclaration</h3>
          {stats.lastDeclaration ? (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2.5 text-sm">
                {[
                  { label: 'Date',           value: formatDateTime(stats.lastDeclaration.date)          },
                  { label: 'Déclaré par',    value: stats.lastDeclaration.declaredBy                   },
                  { label: 'Montant compté', value: formatCurrency(stats.lastDeclaration.amount)        },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Écart</span>
                  <span className={`font-bold ${stats.lastDeclaration.difference === 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                    {stats.lastDeclaration.difference === 0 ? '✓ Aucun' : formatCurrency(Math.abs(stats.lastDeclaration.difference))}
                  </span>
                </div>
              </div>
              {stats.lastDeclaration.difference === 0 && (
                <div className="p-3 bg-[#DDEAD5] border border-[#2E7D32]/20 rounded-xl flex items-center gap-2">
                  <FaCheckCircle className="text-[#2E7D32] shrink-0" />
                  <span className="text-sm font-medium text-gray-900">Déclaration conforme</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <FaClipboardList className="text-gray-400 text-xl" />
              </div>
              <p className="text-sm text-gray-500">Aucune déclaration aujourd'hui</p>
              <button onClick={() => setShowDeclarationModal(true)}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-[#D4AF37] to-[#C9B27C] text-white text-sm font-semibold">
                Déclarer maintenant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Rappel fin de journée ── */}
      <div className="bg-linear-to-r from-[#D4AF37]/10 to-[#C9B27C]/10 rounded-2xl p-6 border border-[#D4AF37]/30">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#D4AF37] flex items-center justify-center shrink-0">
            <FaClipboardList className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-1">N'oubliez pas la déclaration de fin de journée !</h3>
            <p className="text-xs text-gray-500 mb-3">
              Chaque soir, le trésorier doit compter physiquement le contenu du coffre et enregistrer une déclaration.
            </p>
            <button onClick={() => setShowDeclarationModal(true)}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-[#D4AF37] to-[#C9B27C] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all">
              Déclarer le coffre
            </button>
          </div>
        </div>
      </div>

      {/* ── Mouvements récents ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Mouvements Récents</h3>
          <button onClick={handleViewHistory}
            className="text-xs text-[#355C7D] hover:text-[#2A4A5E] font-medium flex items-center gap-1">
            Voir tout l'historique →
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { id: 1, type: 'out' as const, amount: 2000, time: '08:30', performedBy: 'Luc Gagnon',     note: 'Fonds de caisse matinal'        },
            { id: 2, type: 'in'  as const, amount: 5420, time: '17:15', performedBy: 'Marie Tremblay', note: 'Remise caisse principale'        },
            { id: 3, type: 'out' as const, amount: 1500, time: '09:45', performedBy: 'Paul Martin',    note: 'Réapprovisionnement caisse 2'    },
            { id: 4, type: 'in'  as const, amount: 3200, time: '16:30', performedBy: 'Sophie Lavoie',  note: 'Excédent caisse secondaire'      },
            { id: 5, type: 'out' as const, amount:  800, time: '10:15', performedBy: 'Luc Gagnon',     note: 'Monnaie pour change'             },
          ].map(m => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#DDEAD5]/10 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.type === 'in' ? 'bg-[#DDEAD5]' : 'bg-orange-50'}`}>
                {m.type === 'in'
                  ? <BiImport className="w-5 h-5 text-[#2E7D32]" />
                  : <BiExport className="w-5 h-5 text-orange-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.type === 'in' ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-orange-50 text-orange-700'}`}>
                    {m.type === 'in' ? 'ENTRÉE' : 'SORTIE'}
                  </span>
                  <span className="text-xs text-gray-400">{m.time}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{m.note}</p>
                <p className="text-xs text-gray-400">Par {m.performedBy}</p>
              </div>
              <p className={`text-sm font-bold shrink-0 ${m.type === 'in' ? 'text-[#2E7D32]' : 'text-orange-600'}`}>
                {m.type === 'in' ? '+' : '-'} {formatCurrency(m.amount)}
              </p>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6]">
          <button onClick={handleViewHistory}
            className="w-full py-1.5 text-xs font-medium text-[#355C7D] hover:text-[#2A4A5E] flex items-center justify-center gap-2">
            <FaClipboardList className="w-3.5 h-3.5" />
            Afficher l'historique complet
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
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