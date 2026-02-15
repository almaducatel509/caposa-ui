'use client';
import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaClock, FaMoneyBillWave, FaUniversity, FaUsers, FaStickyNote, FaLock, FaChartBar, FaFilePdf, FaFilter } from 'react-icons/fa';
import { BiImport } from 'react-icons/bi';
import DiscrepancySummaryTable from './DiscrepancySummaryTable';
import AutomaticDiscrepancySummary from './AutomaticDiscrepancySummary';

interface DailyReport {
  id: string;
  date: string;
  status: 'open' | 'submitted' | 'reviewed' | 'approved' | 'locked';
  openingCash: number;
  theoreticalCash: number;
  actualCash: number;
  totalDiscrepancy: number;
  openedBy: string;
  openedAt: string;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  lockedAt?: string;
}

interface Transaction {
  id: string;
  time: string;
  type: 'deposit' | 'withdrawal' | 'repayment' | 'fee';
  amount: number;
  member: string;
  status: 'match' | 'discrepancy' | 'pending';
}

interface BankDeposit {
  id: string;
  slipNumber: string;
  expectedAmount: number;
  confirmedAmount: number;
  status: 'match' | 'discrepancy' | 'pending';
  notes?: string;
}

interface AgentCollection {
  id: string;
  agentName: string;
  declaredAmount: number;
  remittedAmount: number;
  discrepancy: number;
  receipts: number;
  status: 'match' | 'discrepancy' | 'pending';
}

interface SupervisorNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

interface DiscrepancyCause {
  source: string;
  sourceName: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'explained' | 'resolved';
  note?: string;
}

type Tab = 'summary' | 'discrepancies' | 'transactions' | 'bank' | 'agents' | 'notes';
type DiscrepancyFilter = 'all' | 'pending' | 'explained';

const ReconciliationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [newNote, setNewNote] = useState('');
  const [discrepancyFilter, setDiscrepancyFilter] = useState<DiscrepancyFilter>('all');

  // Données mockées
  const report: DailyReport = {
    id: 'rpt_20260213',
    date: '2026-02-13',
    status: 'submitted',
    openingCash: 2000.00,
    theoreticalCash: 7130.00,
    actualCash: 7100.00,
    totalDiscrepancy: -30.00,
    openedBy: 'Jean Dupont',
    openedAt: '2026-02-13T08:00:00',
    submittedBy: 'Jean Dupont',
    submittedAt: '2026-02-13T17:00:00',
    reviewedBy: 'Marie Tremblay',
    reviewedAt: '2026-02-13T17:30:00'
  };

  const transactions: Transaction[] = [
    { id: 'tx_001', time: '09:15', type: 'deposit', amount: 500.00, member: 'Paul Martin', status: 'match' },
    { id: 'tx_002', time: '10:30', type: 'withdrawal', amount: 200.00, member: 'Sophie Lavoie', status: 'match' },
    { id: 'tx_003', time: '11:45', type: 'repayment', amount: 1500.00, member: 'Luc Gagnon', status: 'discrepancy' },
    { id: 'tx_004', time: '14:20', type: 'fee', amount: 50.00, member: 'Anne Côté', status: 'pending' },
  ];

  const bankDeposits: BankDeposit[] = [
    { id: 'bd_001', slipNumber: 'BDP-2026-001', expectedAmount: 5000.00, confirmedAmount: 5000.00, status: 'match' },
    { id: 'bd_002', slipNumber: 'BDP-2026-002', expectedAmount: 2500.00, confirmedAmount: 2480.00, status: 'discrepancy', notes: 'Frais bancaire déduit' },
  ];

  const agentCollections: AgentCollection[] = [
    { id: 'ag_001', agentName: 'Pierre Dubois', declaredAmount: 1500.00, remittedAmount: 1500.00, discrepancy: 0, receipts: 12, status: 'match' },
    { id: 'ag_002', agentName: 'Julie Leblanc', declaredAmount: 2200.00, remittedAmount: 2150.00, discrepancy: -50.00, receipts: 18, status: 'discrepancy' },
    { id: 'ag_003', agentName: 'Marc Bouchard', declaredAmount: 1800.00, remittedAmount: 1800.00, discrepancy: 0, receipts: 15, status: 'pending' },
  ];

  const supervisorNotes: SupervisorNote[] = [
    { id: 'note_001', author: 'Marie Tremblay', timestamp: '2026-02-13T17:30:00', content: 'Transaction tx_003: Membre a payé avec un billet de 100$ déchiré, remplacé par billet neuf. Billet abîmé envoyé à la banque.' },
    { id: 'note_002', author: 'Marie Tremblay', timestamp: '2026-02-13T17:45:00', content: 'Agent Julie Leblanc: Écart de 50$ expliqué - erreur de frappe sur reçu #478. Montant corrigé.' },
  ];

  // Données pour l'analyse automatique des écarts
  const discrepancyCauses: DiscrepancyCause[] = [
    {
      source: 'cash',
      sourceName: 'Cash en caisse - Comptage final',
      amount: -30.00,
      percentage: 30,
      status: 'pending',
    },
    {
      source: 'bank_deposit',
      sourceName: 'Bordereau BDP-2026-002',
      amount: -20.00,
      percentage: 20,
      status: 'explained',
      note: 'Frais bancaire de 20$ déduit automatiquement par la banque. Confirmé par email de la Banque Nationale.'
    },
    {
      source: 'agent',
      sourceName: 'Agent Julie Leblanc',
      amount: -50.00,
      percentage: 50,
      status: 'explained',
      note: 'Erreur de frappe sur reçu #478. Montant corrigé dans le système. Agent a bien remis le montant exact.'
    }
  ];

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

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTimeOnly = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      match: { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle />, label: 'Match' },
      discrepancy: { bg: 'bg-red-100', text: 'text-red-800', icon: <FaExclamationTriangle />, label: 'Écart' },
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', icon: <FaClock />, label: 'En attente' },
      open: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaClock />, label: 'Ouvert' },
      submitted: { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FaCheckCircle />, label: 'Soumis' },
      reviewed: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <FaCheckCircle />, label: 'Révisé' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle />, label: 'Approuvé' },
      locked: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FaLock />, label: 'Verrouillé' },
      explained: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaCheckCircle />, label: 'Expliqué' },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle />, label: 'Résolu' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getTransactionTypeLabel = (type: string) => {
    const types = {
      deposit: 'Dépôt',
      withdrawal: 'Retrait',
      repayment: 'Remboursement',
      fee: 'Frais'
    };
    return types[type as keyof typeof types];
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    console.log(`Changer statut de ${itemId} à ${newStatus}`);
    // TODO: API call
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    console.log('Ajouter note:', newNote);
    setNewNote('');
    // TODO: API call
  };

  const handleSubmitForValidation = () => {
    console.log('Soumettre pour validation');
    // TODO: API call
  };

  const handleApproveAndLock = () => {
    console.log('Approuver et verrouiller');
    // TODO: API call
  };

  const handleExportPDF = () => {
    console.log('Exporter en PDF');
    // TODO: Implement PDF generation
    alert('📄 Export PDF en cours de développement...\n\nCette fonctionnalité permettra de générer un rapport PDF complet pour:\n• Les audits\n• Les archives papier\n• Les signatures\n• Les inspections externes');
  };

  const getFilteredDiscrepancies = () => {
    if (discrepancyFilter === 'all') return discrepancyCauses;
    if (discrepancyFilter === 'pending') return discrepancyCauses.filter(d => d.status === 'pending');
    if (discrepancyFilter === 'explained') return discrepancyCauses.filter(d => d.status !== 'pending');
    return discrepancyCauses;
  };

  const allDiscrepanciesExplained = discrepancyCauses.every(d => d.status !== 'pending');
  const pendingCount = discrepancyCauses.filter(d => d.status === 'pending').length;
  const explainedCount = discrepancyCauses.filter(d => d.status !== 'pending').length;

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réconciliation Journalière</h1>
          <p className="text-gray-600 mt-1">
            {new Date(report.date).toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(report.status)}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md"
          >
            <FaFilePdf />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Ready to Validate Indicator */}
      {allDiscrepanciesExplained && report.status === 'submitted' && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">✅ Prêt à valider</h3>
              <p className="text-green-100">
                Tous les écarts sont expliqués — la journée peut être soumise pour validation
              </p>
            </div>
            <button
              onClick={handleSubmitForValidation}
              className="px-6 py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 font-bold transition-colors shadow-md"
            >
              Soumettre maintenant →
            </button>
          </div>
        </div>
      )}

      {/* Résumé - Cards en haut */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash ouverture */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaMoneyBillWave className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Cash d'ouverture</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.openingCash)}</p>
          <p className="text-xs text-gray-500 mt-1">Ouvert par: {report.openedBy}</p>
          <p className="text-xs text-gray-400">{formatTimeOnly(report.openedAt)}</p>
        </div>

        {/* Cash théorique */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaMoneyBillWave className="text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Cash théorique</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.theoreticalCash)}</p>
          <p className="text-xs text-gray-500 mt-1">Selon les transactions</p>
        </div>

        {/* Cash réel */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FaMoneyBillWave className="text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Cash réel compté</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.actualCash)}</p>
          <p className="text-xs text-gray-500 mt-1">Comptage physique</p>
        </div>

        {/* Écart total */}
        <div className={`rounded-xl p-5 border-2 shadow-sm ${
          report.totalDiscrepancy === 0 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              report.totalDiscrepancy === 0 ? 'bg-green-200' : 'bg-red-200'
            }`}>
              {report.totalDiscrepancy === 0 
                ? <FaCheckCircle className="text-green-700" />
                : <FaExclamationTriangle className="text-red-700" />
              }
            </div>
            <p className="text-sm font-medium">Écart total</p>
          </div>
          <p className={`text-2xl font-bold ${
            report.totalDiscrepancy === 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatCurrency(Math.abs(report.totalDiscrepancy))}
          </p>
          <p className="text-xs mt-1">
            {report.totalDiscrepancy === 0 
              ? '✅ Parfait !' 
              : report.totalDiscrepancy > 0 
                ? '↗️ Surplus'
                : '↘️ Manque'
            }
          </p>
        </div>
      </div>

      {/* Inline Discrepancy Table - Always visible on summary */}
      {report.totalDiscrepancy !== 0 && activeTab === 'summary' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-orange-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaExclamationTriangle className="text-orange-600" />
              Tableau des Écarts — Vue Rapide
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDiscrepancyFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    discrepancyFilter === 'all' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaFilter className="inline mr-1" />
                  Tous ({discrepancyCauses.length})
                </button>
                <button
                  onClick={() => setDiscrepancyFilter('pending')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    discrepancyFilter === 'pending' 
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  En attente ({pendingCount})
                </button>
                <button
                  onClick={() => setDiscrepancyFilter('explained')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    discrepancyFilter === 'explained' 
                      ? 'bg-green-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Expliqués ({explainedCount})
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Source</th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">Attendu</th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">Réel</th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">Écart</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">Statut</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredDiscrepancies().map((disc) => {
                  // Calculate expected and actual based on the discrepancy
                  const actual = disc.amount < 0 ? Math.abs(disc.amount) : 0;
                  const expected = disc.amount < 0 ? 0 : disc.amount;
                  
                  return (
                    <tr 
                      key={disc.source + disc.sourceName} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        disc.status === 'pending' ? 'bg-orange-50' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{disc.sourceName}</div>
                        {disc.note && (
                          <div className="text-xs text-gray-600 mt-1 max-w-md">📝 {disc.note}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">
                        {formatCurrency(expected)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">
                        {formatCurrency(actual)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-bold text-lg ${
                          disc.amount === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(disc.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(disc.status)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {disc.status === 'pending' ? (
                          <button
                            onClick={() => {
                              setActiveTab('discrepancies');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm transition-colors"
                          >
                            Expliquer
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveTab('discrepancies');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                          >
                            Voir
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900">TOTAL</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-bold text-xl ${
                      report.totalDiscrepancy === 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(report.totalDiscrepancy)}
                    </span>
                  </td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setActiveTab('discrepancies')}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <FaChartBar />
              Voir l'analyse complète des écarts
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {[
              { id: 'summary', label: 'Résumé', icon: <FaMoneyBillWave /> },
              { id: 'discrepancies', label: 'Écarts détaillés', icon: <FaChartBar />, badge: report.totalDiscrepancy !== 0 ? pendingCount : undefined },
              { id: 'transactions', label: 'Transactions', icon: <BiImport /> },
              { id: 'bank', label: 'Dépôts bancaires', icon: <FaUniversity /> },
              { id: 'agents', label: 'Agents de crédit', icon: <FaUsers /> },
              { id: 'notes', label: 'Notes', icon: <FaStickyNote /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'border-[#2E7D32] text-[#2E7D32]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Onglet Résumé */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cash en caisse */}
                <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    Cash en Caisse
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Théorique:</span>
                      <span className="font-semibold">{formatCurrency(report.theoreticalCash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Réel:</span>
                      <span className="font-semibold">{formatCurrency(report.actualCash)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <span className="text-gray-700 font-medium">Écart:</span>
                      <span className={`font-bold ${report.totalDiscrepancy === 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {formatCurrency(report.totalDiscrepancy)}
                      </span>
                    </div>
                  </div>
                  {report.totalDiscrepancy === 0 && (
                    <div className="mt-3 p-2 bg-green-200 rounded-lg text-center">
                      <span className="text-xs font-semibold text-green-800">✅ Correspondance parfaite</span>
                    </div>
                  )}
                </div>

                {/* Dépôts bancaires */}
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUniversity className="text-blue-600" />
                    Dépôts Bancaires
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total bordereaux:</span>
                      <span className="font-semibold">{bankDeposits.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Montant total:</span>
                      <span className="font-semibold">
                        {formatCurrency(bankDeposits.reduce((sum, bd) => sum + bd.confirmedAmount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Avec écarts:</span>
                      <span className="font-semibold text-red-600">
                        {bankDeposits.filter(bd => bd.status === 'discrepancy').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agents */}
                <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUsers className="text-purple-600" />
                    Agents de Crédit
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total agents:</span>
                      <span className="font-semibold">{agentCollections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Cash collecté:</span>
                      <span className="font-semibold">
                        {formatCurrency(agentCollections.reduce((sum, ag) => sum + ag.remittedAmount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Avec écarts:</span>
                      <span className="font-semibold text-red-600">
                        {agentCollections.filter(ag => ag.status === 'discrepancy').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions métier */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">❓ Les 3 Questions Essentielles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('discrepancies')}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#2E7D32] hover:shadow-md transition-all text-left"
                  >
                    <p className="text-sm text-gray-600 mb-2">Cash physique = théorique?</p>
                    <p className="text-2xl font-bold">
                      {report.totalDiscrepancy === 0 
                        ? <span className="text-green-600">✅ Oui</span>
                        : <span className="text-red-600">❌ Non</span>
                      }
                    </p>
                    {report.totalDiscrepancy !== 0 && (
                      <p className="text-xs text-blue-600 mt-2 font-medium">
                        → Cliquer pour voir les détails
                      </p>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('bank')}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#2E7D32] hover:shadow-md transition-all text-left"
                  >
                    <p className="text-sm text-gray-600 mb-2">Dépôts bancaires confirmés?</p>
                    <p className="text-2xl font-bold">
                      {bankDeposits.every(bd => bd.status === 'match')
                        ? <span className="text-green-600">✅ Oui</span>
                        : <span className="text-orange-600">⚠️ Réviser</span>
                      }
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      → Cliquer pour vérifier
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab('agents')}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#2E7D32] hover:shadow-md transition-all text-left"
                  >
                    <p className="text-sm text-gray-600 mb-2">Agents ont tout remis?</p>
                    <p className="text-2xl font-bold">
                      {agentCollections.every(ag => ag.status === 'match')
                        ? <span className="text-green-600">✅ Oui</span>
                        : <span className="text-orange-600">⚠️ Réviser</span>
                      }
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      → Cliquer pour contrôler
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Écarts détaillés */}
          {activeTab === 'discrepancies' && (
            <div>
              <DiscrepancySummaryTable />
            </div>
          )}

          {/* Onglet Transactions */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Transactions du jour</h3>
                <span className="text-sm text-gray-600">{transactions.length} transactions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Heure</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Membre</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm">{tx.time}</td>
                        <td className="py-4 px-4 text-sm">{getTransactionTypeLabel(tx.type)}</td>
                        <td className="py-4 px-4 text-sm font-medium">{tx.member}</td>
                        <td className="py-4 px-4 text-sm text-right font-semibold">{formatCurrency(tx.amount)}</td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(tx.status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStatusChange(tx.id, 'match')}
                              className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                              title="Marquer comme Match"
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              onClick={() => handleStatusChange(tx.id, 'discrepancy')}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                              title="Marquer comme Écart"
                            >
                              <FaExclamationTriangle />
                            </button>
                            <button
                              onClick={() => handleStatusChange(tx.id, 'pending')}
                              className="p-2 rounded-lg hover:bg-orange-100 text-orange-600 transition-colors"
                              title="Marquer comme En attente"
                            >
                              <FaClock />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Dépôts bancaires */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Dépôts bancaires</h3>
                <span className="text-sm text-gray-600">{bankDeposits.length} bordereaux</span>
              </div>

              <div className="space-y-3">
                {bankDeposits.map((bd) => (
                  <div key={bd.id} className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Bordereau {bd.slipNumber}</p>
                        {bd.notes && (
                          <p className="text-sm text-gray-600 mt-1">📝 {bd.notes}</p>
                        )}
                      </div>
                      {getStatusBadge(bd.status)}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Montant attendu</p>
                        <p className="font-semibold text-lg">{formatCurrency(bd.expectedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Montant confirmé</p>
                        <p className="font-semibold text-lg">{formatCurrency(bd.confirmedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Écart</p>
                        <p className={`font-semibold text-lg ${
                          bd.expectedAmount === bd.confirmedAmount ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(bd.confirmedAmount - bd.expectedAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Agents */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Encaissements des agents</h3>
                <span className="text-sm text-gray-600">{agentCollections.length} agents</span>
              </div>

              <div className="space-y-3">
                {agentCollections.map((ag) => (
                  <div key={ag.id} className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{ag.agentName}</p>
                        <p className="text-sm text-gray-600">{ag.receipts} reçus émis</p>
                      </div>
                      {getStatusBadge(ag.status)}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Montant déclaré</p>
                        <p className="font-semibold text-lg">{formatCurrency(ag.declaredAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Montant remis</p>
                        <p className="font-semibold text-lg">{formatCurrency(ag.remittedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Écart</p>
                        <p className={`font-semibold text-lg ${
                          ag.discrepancy === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(ag.discrepancy)}
                        </p>
                      </div>
                      <div className="flex items-end">
                        <button className="text-sm text-[#2E7D32] hover:text-[#1B5E20] font-medium">
                          Voir reçus →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes du superviseur</h3>
                
                {/* Zone d'ajout de note */}
                <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ajouter une note
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Expliquez les écarts, ajoutez des observations..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-5 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter la note
                    </button>
                  </div>
                </div>

                {/* Historique des notes */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Historique</h4>
                  {supervisorNotes.map((note) => (
                    <div key={note.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {note.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{note.author}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(note.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 ml-10">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timestamp Audit Trail */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaClock className="text-gray-600" />
          Horodatage Complet — Piste d'Audit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Ouverture</p>
            </div>
            <p className="font-medium text-gray-900">{report.openedBy}</p>
            <p className="text-sm text-gray-600">{formatDateOnly(report.openedAt)}</p>
            <p className="text-lg font-bold text-blue-600">{formatTimeOnly(report.openedAt)}</p>
          </div>

          {report.submittedBy && report.submittedAt && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Soumission</p>
              </div>
              <p className="font-medium text-gray-900">{report.submittedBy}</p>
              <p className="text-sm text-gray-600">{formatDateOnly(report.submittedAt)}</p>
              <p className="text-lg font-bold text-purple-600">{formatTimeOnly(report.submittedAt)}</p>
            </div>
          )}

          {report.reviewedBy && report.reviewedAt && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Révision</p>
              </div>
              <p className="font-medium text-gray-900">{report.reviewedBy}</p>
              <p className="text-sm text-gray-600">{formatDateOnly(report.reviewedAt)}</p>
              <p className="text-lg font-bold text-indigo-600">{formatTimeOnly(report.reviewedAt)}</p>
            </div>
          )}

          {report.approvedBy && report.approvedAt && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Approbation</p>
              </div>
              <p className="font-medium text-gray-900">{report.approvedBy}</p>
              <p className="text-sm text-gray-600">{formatDateOnly(report.approvedAt)}</p>
              <p className="text-lg font-bold text-green-600">{formatTimeOnly(report.approvedAt)}</p>
            </div>
          )}

          {report.lockedAt && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Verrouillage</p>
              </div>
              <p className="font-medium text-gray-900">Système</p>
              <p className="text-sm text-gray-600">{formatDateOnly(report.lockedAt)}</p>
              <p className="text-lg font-bold text-gray-600">{formatTimeOnly(report.lockedAt)}</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          🔒 Horodatage certifié — Piste d'audit complète pour inspection externe
        </div>
      </div>

      {/* Actions en bas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {report.reviewedBy && (
              <p>Révisé par: <span className="font-medium text-gray-900">{report.reviewedBy}</span></p>
            )}
            {report.approvedBy && (
              <p className="mt-1">Approuvé par: <span className="font-medium text-gray-900">{report.approvedBy}</span></p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-xs text-gray-600">Écarts en attente</p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingCount}
              </p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Écarts expliqués</p>
              <p className="text-2xl font-bold text-green-600">
                {explainedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Alerte si écarts non expliqués */}
        {pendingCount > 0 && (
          <div className="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-orange-600 text-lg mt-1" />
              <div>
                <p className="font-semibold text-orange-900 mb-1">
                  ⚠️ Action requise avant soumission
                </p>
                <p className="text-sm text-orange-800">
                  {pendingCount} écart(s) doivent être expliqués avant de soumettre pour validation. 
                  <button 
                    onClick={() => setActiveTab('discrepancies')}
                    className="ml-2 text-orange-600 hover:text-orange-800 font-semibold underline"
                  >
                    Expliquer maintenant →
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          {report.status === 'submitted' && (
            <>
              <button
                onClick={handleSubmitForValidation}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                💾 Sauvegarder
              </button>
              <button
                onClick={handleSubmitForValidation}
                disabled={pendingCount > 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title={pendingCount > 0 ? 'Tous les écarts doivent être expliqués' : ''}
              >
                ✅ Soumettre pour validation
              </button>
            </>
          )}
          
          {report.status === 'reviewed' && (
            <>
              <button
                onClick={() => console.log('Demander correction')}
                className="flex-1 px-6 py-3 border-2 border-red-500 text-red-700 rounded-lg hover:bg-red-50 font-semibold transition-colors"
              >
                🔄 Demander correction
              </button>
              <button
                onClick={handleApproveAndLock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-lg hover:from-[#1B5E20] hover:to-[#2E7D32] font-semibold transition-all shadow-lg"
              >
                <FaLock />
                🔒 Approuver et Verrouiller
              </button>
            </>
          )}
        </div>

        {/* Info sur le verrouillage */}
        {allDiscrepanciesExplained && report.status === 'submitted' && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
            <p className="text-sm text-green-800">
              ✅ <span className="font-semibold">Tous les écarts sont expliqués.</span> Cette réconciliation est prête à être soumise au directeur.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReconciliationPage;