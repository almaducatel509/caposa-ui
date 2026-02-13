'use client';
import React, { useState } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaEye, FaEdit } from 'react-icons/fa';
import DiscrepancyDetailModal from './Discrepancydetailmodal';

interface Discrepancy {
  id: string;
  source: 'cash' | 'bank_deposit' | 'agent' | 'transaction';
  sourceId: string;
  sourceName: string;
  expectedAmount: number;
  actualAmount: number;
  discrepancyAmount: number;
  status: 'pending' | 'explained' | 'resolved';
  note?: string;
  createdBy?: string;
  createdAt?: string;
}

const DiscrepancySummaryTable: React.FC = () => {
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<Discrepancy | undefined>();
  const [showModal, setShowModal] = useState(false);

  // Données mockées - remplacer par API
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([
    {
      id: 'disc_001',
      source: 'cash',
      sourceId: 'cash_daily',
      sourceName: 'Cash en caisse - Comptage final',
      expectedAmount: 7130.00,
      actualAmount: 7100.00,
      discrepancyAmount: -30.00,
      status: 'pending',
      note: undefined
    },
    {
      id: 'disc_002',
      source: 'bank_deposit',
      sourceId: 'bd_002',
      sourceName: 'Bordereau BDP-2026-002',
      expectedAmount: 2500.00,
      actualAmount: 2480.00,
      discrepancyAmount: -20.00,
      status: 'explained',
      note: 'Frais bancaire de 20$ déduit automatiquement par la banque. Confirmé par email de la Banque Nationale.',
      createdBy: 'Marie Tremblay',
      createdAt: '2026-02-13T17:30:00'
    },
    {
      id: 'disc_003',
      source: 'agent',
      sourceId: 'ag_002',
      sourceName: 'Agent Julie Leblanc',
      expectedAmount: 2200.00,
      actualAmount: 2150.00,
      discrepancyAmount: -50.00,
      status: 'explained',
      note: 'Erreur de frappe sur reçu #478. Montant corrigé dans le système. Agent a bien remis le montant exact.',
      createdBy: 'Marie Tremblay',
      createdAt: '2026-02-13T17:45:00'
    },
    {
      id: 'disc_004',
      source: 'transaction',
      sourceId: 'tx_003',
      sourceName: 'Transaction #TX-003 - Luc Gagnon',
      expectedAmount: 1500.00,
      actualAmount: 1470.00,
      discrepancyAmount: -30.00,
      status: 'pending',
      note: undefined
    }
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getSourceBadge = (source: string) => {
    const badges = {
      cash: { bg: 'bg-purple-100', text: 'text-purple-700', label: '💵 Cash' },
      bank_deposit: { bg: 'bg-blue-100', text: 'text-blue-700', label: '🏦 Banque' },
      agent: { bg: 'bg-green-100', text: 'text-green-700', label: '👤 Agent' },
      transaction: { bg: 'bg-orange-100', text: 'text-orange-700', label: '📝 Transaction' }
    };
    const badge = badges[source as keyof typeof badges];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', icon: <FaClock />, label: 'En attente' },
      explained: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaCheckCircle />, label: 'Expliqué' },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle />, label: 'Résolu' }
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const handleEditDiscrepancy = (disc: Discrepancy) => {
    setSelectedDiscrepancy(disc);
    setShowModal(true);
  };

  const handleSaveDiscrepancy = (id: string, note: string, status: string) => {
    setDiscrepancies(prev => prev.map(d => 
      d.id === id 
        ? { 
            ...d, 
            note, 
            status: status as any,
            createdBy: 'Marie Tremblay', // TODO: user actuel
            createdAt: new Date().toISOString()
          }
        : d
    ));
    console.log('Écart mis à jour:', id, note, status);
    // TODO: API call
  };

  const totalDiscrepancy = discrepancies.reduce((sum, d) => sum + d.discrepancyAmount, 0);
  const pendingCount = discrepancies.filter(d => d.status === 'pending').length;
  const explainedCount = discrepancies.filter(d => d.status === 'explained').length;
  const resolvedCount = discrepancies.filter(d => d.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" />
              Liste Détaillée des Écarts
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Tous les écarts détectés doivent être expliqués avant validation
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Écart total</p>
            <p className={`text-3xl font-bold ${totalDiscrepancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totalDiscrepancy))}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalDiscrepancy > 0 ? '↗️ Surplus' : '↘️ Manque'}
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <FaClock className="text-3xl text-orange-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Expliqués</p>
                <p className="text-2xl font-bold text-blue-600">{explainedCount}</p>
              </div>
              <FaCheckCircle className="text-3xl text-blue-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Résolus</p>
                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des écarts */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Source</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Attendu</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Réel</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Écart</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((disc, index) => (
                <tr 
                  key={disc.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    disc.status === 'pending' ? 'bg-orange-50/30' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    {getSourceBadge(disc.source)}
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{disc.sourceName}</p>
                      {disc.note && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          📝 {disc.note}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(disc.expectedAmount)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(disc.actualAmount)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-bold text-lg ${
                      disc.discrepancyAmount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(disc.discrepancyAmount))}
                    </span>
                    <p className="text-xs text-gray-500">
                      {disc.discrepancyAmount > 0 ? 'surplus' : 'manque'}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(disc.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditDiscrepancy(disc)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                          disc.status === 'pending'
                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        title={disc.status === 'pending' ? 'Ajouter une explication' : 'Voir/Modifier'}
                      >
                        {disc.status === 'pending' ? (
                          <>
                            <FaEdit /> Expliquer
                          </>
                        ) : (
                          <>
                            <FaEye /> Voir
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={4} className="py-4 px-4 text-right font-semibold text-gray-900">
                  TOTAL DES ÉCARTS:
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-bold text-2xl ${
                    totalDiscrepancy >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(totalDiscrepancy))}
                  </span>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Alertes */}
      {pendingCount > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-xl">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-orange-600 text-xl mt-1" />
            <div>
              <p className="font-semibold text-orange-900 mb-1">
                ⚠️ {pendingCount} écart{pendingCount > 1 ? 's' : ''} en attente d'explication
              </p>
              <p className="text-sm text-orange-800">
                Tous les écarts doivent être expliqués avant de soumettre la réconciliation pour validation. 
                Cliquez sur "Expliquer" pour ajouter une note obligatoire.
              </p>
            </div>
          </div>
        </div>
      )}

      {pendingCount === 0 && discrepancies.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-xl">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-600 text-xl mt-1" />
            <div>
              <p className="font-semibold text-green-900 mb-1">
                ✅ Tous les écarts ont été expliqués
              </p>
              <p className="text-sm text-green-800">
                Vous pouvez maintenant soumettre cette réconciliation pour validation par le directeur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détail */}
      <DiscrepancyDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        discrepancy={selectedDiscrepancy}
        onSave={handleSaveDiscrepancy}
      />
    </div>
  );
};

export default DiscrepancySummaryTable;