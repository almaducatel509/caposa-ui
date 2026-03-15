'use client';

import React, { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, Clock, Banknote, Landmark,
  Users, StickyNote, Lock, BarChart2, FileText, Filter,
  Download, ChevronRight,
} from 'lucide-react';
import DiscrepancySummaryTable from './DiscrepancySummaryTable';
import AutomaticDiscrepancySummary from './AutomaticDiscrepancySummary';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Palette CAPOSA ───────────────────────────────────────────────────────────
const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
  page:      '#F9F9F6',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHTG(value: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + ' HTG';
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateOnly(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatTimeOnly(dateString: string) {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ReconciliationPage: React.FC = () => {
  const [activeTab,          setActiveTab]          = useState<Tab>('summary');
  const [newNote,            setNewNote]            = useState('');
  const [discrepancyFilter,  setDiscrepancyFilter]  = useState<DiscrepancyFilter>('all');

  // ── Données mockées ──
  const report: DailyReport = {
    id: 'rpt_20260213', date: '2026-02-13', status: 'submitted',
    openingCash: 2000.00, theoreticalCash: 7130.00, actualCash: 7100.00, totalDiscrepancy: -30.00,
    openedBy: 'Jean Dupont', openedAt: '2026-02-13T08:00:00',
    submittedBy: 'Jean Dupont', submittedAt: '2026-02-13T17:00:00',
    reviewedBy: 'Marie Tremblay', reviewedAt: '2026-02-13T17:30:00',
  };

  const transactions: Transaction[] = [
    { id: 'tx_001', time: '09:15', type: 'deposit',    amount: 500.00,  member: 'Paul Martin',   status: 'match'        },
    { id: 'tx_002', time: '10:30', type: 'withdrawal', amount: 200.00,  member: 'Sophie Lavoie', status: 'match'        },
    { id: 'tx_003', time: '11:45', type: 'repayment',  amount: 1500.00, member: 'Luc Gagnon',    status: 'discrepancy'  },
    { id: 'tx_004', time: '14:20', type: 'fee',        amount: 50.00,   member: 'Anne Côté',     status: 'pending'      },
  ];

  const bankDeposits: BankDeposit[] = [
    { id: 'bd_001', slipNumber: 'BDP-2026-001', expectedAmount: 5000.00, confirmedAmount: 5000.00, status: 'match'       },
    { id: 'bd_002', slipNumber: 'BDP-2026-002', expectedAmount: 2500.00, confirmedAmount: 2480.00, status: 'discrepancy', notes: 'Frais bancaire déduit' },
  ];

  const agentCollections: AgentCollection[] = [
    { id: 'ag_001', agentName: 'Pierre Dubois',  declaredAmount: 1500.00, remittedAmount: 1500.00, discrepancy: 0,     receipts: 12, status: 'match'        },
    { id: 'ag_002', agentName: 'Julie Leblanc',  declaredAmount: 2200.00, remittedAmount: 2150.00, discrepancy: -50.00,receipts: 18, status: 'discrepancy'  },
    { id: 'ag_003', agentName: 'Marc Bouchard',  declaredAmount: 1800.00, remittedAmount: 1800.00, discrepancy: 0,     receipts: 15, status: 'pending'      },
  ];

  const supervisorNotes: SupervisorNote[] = [
    { id: 'note_001', author: 'Marie Tremblay', timestamp: '2026-02-13T17:30:00', content: 'Transaction tx_003: Membre a payé avec un billet de 100$ déchiré, remplacé par billet neuf. Billet abîmé envoyé à la banque.' },
    { id: 'note_002', author: 'Marie Tremblay', timestamp: '2026-02-13T17:45:00', content: 'Agent Julie Leblanc: Écart de 50$ expliqué - erreur de frappe sur reçu #478. Montant corrigé.' },
  ];

  const discrepancyCauses: DiscrepancyCause[] = [
    { source: 'cash',         sourceName: 'Cash en caisse — Comptage final', amount: -30.00,  percentage: 30, status: 'pending' },
    { source: 'bank_deposit', sourceName: 'Bordereau BDP-2026-002',          amount: -20.00,  percentage: 20, status: 'explained', note: 'Frais bancaire de 20$ déduit automatiquement par la banque. Confirmé par email.' },
    { source: 'agent',        sourceName: 'Agent Julie Leblanc',             amount: -50.00,  percentage: 50, status: 'explained', note: 'Erreur de frappe sur reçu #478. Montant corrigé dans le système.' },
  ];

  // ── Calculs ──
  const allDiscrepanciesExplained = discrepancyCauses.every(d => d.status !== 'pending');
  const pendingCount   = discrepancyCauses.filter(d => d.status === 'pending').length;
  const explainedCount = discrepancyCauses.filter(d => d.status !== 'pending').length;

  const getFilteredDiscrepancies = () => {
    if (discrepancyFilter === 'pending')   return discrepancyCauses.filter(d => d.status === 'pending');
    if (discrepancyFilter === 'explained') return discrepancyCauses.filter(d => d.status !== 'pending');
    return discrepancyCauses;
  };

  // ── Handlers ──
  const handleStatusChange    = (id: string, status: string) => console.log(`Statut ${id} → ${status}`);
  const handleAddNote         = () => { if (!newNote.trim()) return; console.log('Note:', newNote); setNewNote(''); };
  const handleSubmit          = () => console.log('Soumettre pour validation');
  const handleApproveAndLock  = () => console.log('Approuver et verrouiller');
  const handleExportPDF       = () => console.log('Export PDF');

  // ── Badge statut ──
  const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      match:       { bg: C.greenPale, text: C.greenDark, dot: C.green,     label: 'Conforme'    },
      discrepancy: { bg: '#FEF2F2',   text: '#B91C1C',   dot: '#EF4444',   label: 'Écart'       },
      pending:     { bg: '#FEF9EC',   text: '#B45309',   dot: '#F59E0B',   label: 'En attente'  },
      open:        { bg: '#EBF2F8',   text: C.blue,      dot: C.blue,      label: 'Ouvert'      },
      submitted:   { bg: '#F0FDF4',   text: '#166534',   dot: '#22C55E',   label: 'Soumis'      },
      reviewed:    { bg: '#EBF2F8',   text: C.blue,      dot: C.blue,      label: 'Révisé'      },
      approved:    { bg: C.greenPale, text: C.greenDark, dot: C.green,     label: 'Approuvé'    },
      locked:      { bg: '#F3F4F6',   text: '#4B5563',   dot: '#9CA3AF',   label: 'Verrouillé'  },
      explained:   { bg: '#EBF2F8',   text: C.blue,      dot: C.blue,      label: 'Expliqué'    },
      resolved:    { bg: C.greenPale, text: C.greenDark, dot: C.green,     label: 'Résolu'      },
    };
    const s = cfg[status] ?? cfg.pending;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: s.bg, color: s.text }}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
        {s.label}
      </span>
    );
  };

  const TX_TYPE: Record<string, string> = {
    deposit: 'Dépôt', withdrawal: 'Retrait', repayment: 'Remboursement', fee: 'Frais',
  };

  // ── Onglets config ──
  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'summary',       label: 'Résumé',            icon: Banknote    },
    { id: 'discrepancies', label: 'Écarts détaillés',  icon: BarChart2,  badge: pendingCount },
    { id: 'transactions',  label: 'Transactions',      icon: FileText    },
    { id: 'bank',          label: 'Dépôts bancaires',  icon: Landmark    },
    { id: 'agents',        label: 'Agents de crédit',  icon: Users       },
    { id: 'notes',         label: 'Notes',             icon: StickyNote  },
  ] as const;

  return (
    <div className="w-full p-6 space-y-6 bg-[#F9F9F6] min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réconciliation journalière</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(report.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={report.status} />
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-[#F9F9F6] transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Exporter PDF
          </button>
        </div>
      </div>

      {/* ── Bannière "Prêt à valider" ───────────────────────────────────────── */}
      {allDiscrepanciesExplained && report.status === 'submitted' && (
        <div className="bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold">Prêt à valider</p>
              <p className="text-sm text-white/80">Tous les écarts sont expliqués — la journée peut être soumise pour validation</p>
            </div>
            <button onClick={handleSubmit}
              className="px-5 py-2.5 bg-white text-[#2E7D32] rounded-xl font-bold text-sm hover:bg-[#DDEAD5] transition-colors shrink-0">
              Soumettre maintenant →
            </button>
          </div>
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Cash d'ouverture",   value: report.openingCash,      sub: `Ouvert par ${report.openedBy} · ${formatTimeOnly(report.openedAt)}`, accent: C.blue  },
          { label: 'Cash théorique',     value: report.theoreticalCash,  sub: 'Selon les transactions',    accent: C.blue  },
          { label: 'Cash réel compté',   value: report.actualCash,       sub: 'Comptage physique',         accent: C.green },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{formatHTG(card.value)}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}

        {/* Écart total */}
        <div className={`rounded-2xl border-2 p-5 shadow-sm ${
          report.totalDiscrepancy === 0 ? 'bg-[#DDEAD5]/30 border-[#2E7D32]' : 'bg-red-50 border-red-400'
        }`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Écart total</p>
          <p className={`text-2xl font-bold ${report.totalDiscrepancy === 0 ? 'text-[#1B5E20]' : 'text-red-700'}`}>
            {formatHTG(Math.abs(report.totalDiscrepancy))}
          </p>
          <p className={`text-xs mt-1 font-semibold ${report.totalDiscrepancy === 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
            {report.totalDiscrepancy === 0 ? '✓ Correspondance parfaite' : report.totalDiscrepancy > 0 ? '↗ Surplus' : '↘ Manque'}
          </p>
        </div>
      </div>

      {/* ── Tableau des écarts inline ───────────────────────────────────────── */}
      {report.totalDiscrepancy !== 0 && activeTab === 'summary' && (
        <div className="bg-white rounded-2xl border-2 border-yellow-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#D4AF37]" />
              <p className="text-sm font-bold text-gray-800">Tableau des écarts — Vue rapide</p>
            </div>
            {/* Filtre */}
            <div className="flex bg-[#F9F9F6] border border-gray-200 rounded-xl p-1 gap-1">
              {([
                { key: 'all',       label: `Tous (${discrepancyCauses.length})` },
                { key: 'pending',   label: `En attente (${pendingCount})`       },
                { key: 'explained', label: `Expliqués (${explainedCount})`      },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setDiscrepancyFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    discrepancyFilter === f.key
                      ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6]">
                  <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Source</th>
                  <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Attendu</th>
                  <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Réel</th>
                  <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Écart</th>
                  <th className="text-center px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Statut</th>
                  <th className="text-center px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {getFilteredDiscrepancies().map((disc) => {
                  const actual   = disc.amount < 0 ? Math.abs(disc.amount) : 0;
                  const expected = disc.amount < 0 ? 0 : disc.amount;
                  return (
                    <tr key={disc.source + disc.sourceName}
                      className={disc.status === 'pending' ? 'bg-yellow-50/40' : 'bg-white hover:bg-[#F9F9F6]'}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">{disc.sourceName}</p>
                        {disc.note && <p className="text-xs text-gray-500 mt-0.5 max-w-sm">📝 {disc.note}</p>}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{formatHTG(expected)}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{formatHTG(actual)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-bold ${disc.amount === 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                          {formatHTG(disc.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center"><StatusBadge status={disc.status} /></td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => { setActiveTab('discrepancies'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            disc.status === 'pending'
                              ? 'bg-[#D4AF37]/15 text-[#B8860B] hover:bg-[#D4AF37]/25'
                              : 'bg-[#355C7D]/10 text-[#355C7D] hover:bg-[#355C7D]/20'
                          }`}>
                          {disc.status === 'pending' ? 'Expliquer' : 'Voir'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-[#F9F9F6]">
                  <td className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-widest">Total</td>
                  <td colSpan={2} />
                  <td className="px-6 py-4 text-right">
                    <span className={`text-base font-bold ${report.totalDiscrepancy === 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                      {formatHTG(report.totalDiscrepancy)}
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-[#F9F9F6] flex justify-center">
            <button onClick={() => setActiveTab('discrepancies')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
              <BarChart2 className="w-4 h-4" /> Voir l'analyse complète des écarts
            </button>
          </div>
        </div>
      )}

      {/* ── Onglets ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Headers */}
        <div className="border-b border-gray-100 px-4 flex gap-0 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id as Tab)}
              className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-[#2E7D32] text-[#2E7D32]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-0.4 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )} 
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="p-6">

          {/* ── Résumé ─────────────────────────────────────────────────────── */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cash en caisse */}
                <div className="p-5 bg-[#DDEAD5]/30 rounded-2xl border border-[#DDEAD5]">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] mb-3">Cash en caisse</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Théorique</span><span className="font-semibold">{formatHTG(report.theoreticalCash)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Réel</span><span className="font-semibold">{formatHTG(report.actualCash)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-[#DDEAD5]">
                      <span className="font-semibold text-gray-700">Écart</span>
                      <span className={`font-bold ${report.totalDiscrepancy === 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>{formatHTG(report.totalDiscrepancy)}</span>
                    </div>
                  </div>
                </div>

                {/* Dépôts bancaires */}
                <div className="p-5 bg-[#EBF2F8]/50 rounded-2xl border border-[#D4E3EF]">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#355C7D] mb-3 ">Dépôts bancaires</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Total bordereaux</span><span className="font-semibold">{bankDeposits.length}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Montant total</span><span className="font-semibold">{formatHTG(bankDeposits.reduce((s, bd) => s + bd.confirmedAmount, 0))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Avec écarts</span><span className="font-bold text-red-600">{bankDeposits.filter(bd => bd.status === 'discrepancy').length}</span></div>
                  </div>
                </div>

                {/* Agents */}
                <div className="p-5 bg-[#FBF6E7]/60 rounded-2xl border border-[#EDE7D6]">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-3">Agents de crédit</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Total agents</span><span className="font-semibold">{agentCollections.length}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Cash collecté</span><span className="font-semibold">{formatHTG(agentCollections.reduce((s, ag) => s + ag.remittedAmount, 0))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Avec écarts</span><span className="font-bold text-red-600">{agentCollections.filter(ag => ag.status === 'discrepancy').length}</span></div>
                  </div>
                </div>
              </div>

              {/* 3 questions métier */}
              <div className="bg-[#f9f6f6] rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Les 3 questions essentielles</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Cash physique = théorique ?', ok: report.totalDiscrepancy === 0, tab: 'discrepancies' as Tab, cta: 'Voir les détails' },
                    { label: 'Dépôts bancaires confirmés ?', ok: bankDeposits.every(bd => bd.status === 'match'), tab: 'bank' as Tab,         cta: 'Vérifier'      },
                    { label: 'Agents ont tout remis ?',     ok: agentCollections.every(ag => ag.status === 'match'), tab: 'agents' as Tab,   cta: 'Contrôler'     },
                  ].map((q, i) => (
                    <button key={i} onClick={() => setActiveTab(q.tab)}
                      className="p-4 bg-white rounded-xl border border-gray-100 hover:border-[#2E7D32] hover:shadow-sm transition-all text-left">
                      <p className="text-xs text-gray-500 mb-2">{q.label}</p>
                      <p className={`text-xl font-bold ${q.ok ? 'text-[#2E7D32]' : 'text-[#D4AF37]'}`}>
                        {q.ok ? '✓ Oui' : '⚠ Réviser'}
                      </p>
                      <p className="text-xs text-[#355C7D] mt-2 flex items-center gap-1 font-medium">
                        {q.cta} <ChevronRight className="w-3 h-3" />
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Écarts détaillés ────────────────────────────────────────────── */}
          {activeTab === 'discrepancies' && <DiscrepancySummaryTable />}

          {/* ── Transactions ────────────────────────────────────────────────── */}
          {activeTab === 'transactions' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">Transactions du jour</p>
                <span className="text-xs text-gray-400">{transactions.length} transactions</span>
              </div>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] px-5 py-3 grid grid-cols-6 gap-3">
                  {['Heure', 'Type', 'Membre', 'Montant', 'Statut', 'Actions'].map(h => (
                    <p key={h} className="text-xs font-bold uppercase tracking-widest text-gray-500">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {transactions.map((tx, idx) => (
                    <div key={tx.id} className={`grid grid-cols-6 gap-3 items-center px-5 py-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F6]/40'}`}>
                      <p className="text-sm font-medium text-gray-700">{tx.time}</p>
                      <p className="text-sm text-gray-700">{TX_TYPE[tx.type]}</p>
                      <p className="text-sm font-semibold text-gray-800">{tx.member}</p>
                      <p className="text-sm font-bold text-[#355C7D]">{formatHTG(tx.amount)}</p>
                      <div><StatusBadge status={tx.status} /></div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleStatusChange(tx.id, 'match')}    title="Conforme"    className="p-1.5 rounded-lg hover:bg-[#DDEAD5] text-[#2E7D32] transition-colors"><CheckCircle2 className="w-4 h-4" /></button>
                        <button onClick={() => handleStatusChange(tx.id, 'discrepancy')} title="Écart"    className="p-1.5 rounded-lg hover:bg-red-50   text-red-500    transition-colors"><AlertTriangle className="w-4 h-4" /></button>
                        <button onClick={() => handleStatusChange(tx.id, 'pending')}  title="En attente" className="p-1.5 rounded-lg hover:bg-yellow-50 text-[#D4AF37]  transition-colors"><Clock className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Dépôts bancaires ────────────────────────────────────────────── */}
          {activeTab === 'bank' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">Dépôts bancaires</p>
                <span className="text-xs text-gray-400">{bankDeposits.length} bordereaux</span>
              </div>
              <div className="space-y-3">
                {bankDeposits.map(bd => (
                  <div key={bd.id} className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-800">Bordereau {bd.slipNumber}</p>
                        {bd.notes && <p className="text-xs text-gray-500 mt-0.5">📝 {bd.notes}</p>}
                      </div>
                      <StatusBadge status={bd.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Attendu',  value: bd.expectedAmount  },
                        { label: 'Confirmé', value: bd.confirmedAmount },
                        { label: 'Écart',    value: bd.confirmedAmount - bd.expectedAmount, colored: true },
                      ].map(col => (
                        <div key={col.label}>
                          <p className="text-xs text-gray-500 mb-1">{col.label}</p>
                          <p className={`text-base font-bold ${col.colored ? (col.value === 0 ? 'text-[#2E7D32]' : 'text-red-600') : 'text-gray-800'}`}>
                            {formatHTG(col.value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Agents ──────────────────────────────────────────────────────── */}
          {activeTab === 'agents' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">Encaissements des agents</p>
                <span className="text-xs text-gray-400">{agentCollections.length} agents</span>
              </div>
              <div className="space-y-3">
                {agentCollections.map(ag => (
                  <div key={ag.id} className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{ag.agentName}</p>
                        <p className="text-xs text-gray-400">{ag.receipts} reçus émis</p>
                      </div>
                      <StatusBadge status={ag.status} />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Déclaré',  value: ag.declaredAmount  },
                        { label: 'Remis',    value: ag.remittedAmount  },
                        { label: 'Écart',    value: ag.discrepancy, colored: true },
                      ].map(col => (
                        <div key={col.label}>
                          <p className="text-xs text-gray-500 mb-1">{col.label}</p>
                          <p className={`text-base font-bold ${col.colored ? (col.value === 0 ? 'text-[#2E7D32]' : 'text-red-600') : 'text-gray-800'}`}>
                            {formatHTG(col.value)}
                          </p>
                        </div>
                      ))}
                      <div className="flex items-end">
                        <button className="text-xs font-semibold text-[#355C7D] hover:text-[#2E7D32] transition-colors flex items-center gap-1">
                          Voir reçus <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notes ───────────────────────────────────────────────────────── */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#EBF2F8]/40 rounded-2xl border border-[#D4E3EF]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#355C7D] mb-3">Ajouter une note</p>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                  placeholder="Expliquez les écarts, ajoutez des observations…"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]" />
                <div className="flex justify-end mt-3">
                  <button onClick={handleAddNote} disabled={!newNote.trim()}
                    className="px-5 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-sm hover:shadow-md">
                    Ajouter la note
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Historique</p>
                {supervisorNotes.map(note => (
                  <div key={note.id} className="p-4 bg-white rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {note.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{note.author}</p>
                        <p className="text-xs text-gray-400">{formatDateTime(note.timestamp)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Audit trail ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Horodatage complet — Piste d'audit</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Ouverture',  by: report.openedBy,    at: report.openedAt,    color: C.blue  },
            ...(report.submittedBy && report.submittedAt ? [{ label: 'Soumission', by: report.submittedBy, at: report.submittedAt, color: C.green }] : []),
            ...(report.reviewedBy  && report.reviewedAt  ? [{ label: 'Révision',   by: report.reviewedBy,  at: report.reviewedAt,  color: C.blue  }] : []),
            ...(report.approvedBy  && report.approvedAt  ? [{ label: 'Approbation',by: report.approvedBy,  at: report.approvedAt,  color: C.green }] : []),
          ].map((step, i) => (
            <div key={i} className="p-4 bg-[#F9F9F6] rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: step.color }} />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{step.label}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{step.by}</p>
              <p className="text-xs text-gray-400">{formatDateOnly(step.at)}</p>
              <p className="text-base font-bold mt-0.5" style={{ color: step.color }}>{formatTimeOnly(step.at)}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">🔒 Horodatage certifié — Piste d'audit complète pour inspection externe</p>
      </div>

      {/* ── Actions finales ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm text-gray-500 space-y-0.5">
            {report.reviewedBy && <p>Révisé par : <span className="font-semibold text-gray-800">{report.reviewedBy}</span></p>}
            {report.approvedBy && <p>Approuvé par : <span className="font-semibold text-gray-800">{report.approvedBy}</span></p>}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">En attente</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{pendingCount}</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">Expliqués</p>
              <p className="text-2xl font-bold text-[#2E7D32]">{explainedCount}</p>
            </div>
          </div>
        </div>

        {/* Alerte écarts en attente */}
        {pendingCount > 0 && (
          <div className="mb-4 border-l-4 border-[#D4AF37] bg-[#FBF6E7] p-4 rounded-r-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{pendingCount} écart(s) doivent être expliqués avant de soumettre.</span>
                <button onClick={() => setActiveTab('discrepancies')} className="ml-2 text-[#355C7D] hover:text-[#2E7D32] font-semibold underline text-sm">
                  Expliquer maintenant →
                </button>
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {report.status === 'submitted' && (<>
            <button onClick={handleSubmit}
              className="flex-1 px-5 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-[#F9F9F6] transition-colors">
              Sauvegarder
            </button>
            <button onClick={handleSubmit} disabled={pendingCount > 0}
              className="flex-1 px-5 py-3 bg-linear-to-r from-[#355C7D] to-[#2E4A6A] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              ✓ Soumettre pour validation
            </button>
          </>)}
          {report.status === 'reviewed' && (<>
            <button onClick={() => console.log('Demander correction')}
              className="flex-1 px-5 py-3 border-2 border-red-300 text-red-700 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors">
              Demander correction
            </button>
            <button onClick={handleApproveAndLock}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all">
              <Lock className="w-4 h-4" /> Approuver et verrouiller
            </button>
          </>)}
        </div>

        {allDiscrepanciesExplained && report.status === 'submitted' && (
          <div className="mt-4 border-l-4 border-[#2E7D32] bg-[#DDEAD5]/40 p-3 rounded-r-xl">
            <p className="text-sm text-[#1B5E20]">✓ <span className="font-semibold">Tous les écarts sont expliqués.</span> Cette réconciliation est prête à être soumise au directeur.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ReconciliationPage;