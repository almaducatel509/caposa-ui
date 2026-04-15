'use client';

import React, { useState, useMemo } from 'react';
import { ArrowDownCircle, RefreshCw, Plus } from 'lucide-react';
import DepositForm from './DepositForm';
import DepositStats, { VolumePoint, TypePoint } from './DepositStats';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';
import { Modal } from '../../ui/Modal';
import DepositTable, { DepositData } from './DepositTable';
import EditDepositModal from './EditDepositModal';

// ─── Constantes ───────────────────────────────────────────────────

const C = {
  green:     '#2E7D32',
  greenDark: '#1B5E20',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
};

const SUBTYPE_CFG: Record<string, { label: string; color: string; bg: string }> = {
  cash:     { label: 'Espèces',  color: C.green,   bg: C.greenPale },
  check:    { label: 'Chèque',   color: C.blue,    bg: '#EBF2F8'   },
  transfer: { label: 'Virement', color: C.gold,    bg: '#FBF6E7'   },
  other:    { label: 'Autre',    color: '#6E6E6E', bg: '#F3F3F3'   },
};

// ─── Mock ────────────────────────────────────────────────────────

function generateMockDeposits(daysBack: number): DepositData[] {
  const subtypes: DepositData['depositSubtype'][] = ['cash', 'check', 'transfer', 'other'];
  const statuses: DepositData['status'][]         = ['decaisse', 'decaisse', 'decaisse', 'en_attente', 'en_cours', 'echoue'];
  const members  = ['Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre', 'Claudette Moreau', 'Réginald Beaumont', 'Nadège Thermidor', 'Wilgens Désir'];
  const sources  = ['Salaire', 'Remboursement', 'Épargne', 'Vente', 'Envoi diaspora', 'Dividendes'];
  const employes = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supers   = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses  = [{ id: 'CAI001', numero: '01' }, { id: 'CAI002', numero: '02' }, { id: 'CAI003', numero: '03' }];

  const data: DepositData[] = [];
  let attempts = 0, i = 0;

  while (i < 60 && attempts < 200) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    if (date.getDay() === 0 || date.getDay() === 6) { attempts++; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
    const subtype    = subtypes[Math.floor(Math.random() * subtypes.length)];
    const amount     = Math.floor(Math.random() * 80000) + 1000;
    const holdPeriod = subtype === 'check' ? Math.floor(Math.random() * 5) + 1 : 0;
    const caisse     = caisses[Math.floor(Math.random() * caisses.length)];
    data.push({
      id:                 i + 1,
      idCompte:           `ACC${1000 + i}`,
      codeAutorisation:   `AUTH${100000 + i}`,
      montantTransaction: amount,
      depositSubtype:     subtype,
      source:             sources[Math.floor(Math.random() * sources.length)],
      description:        Math.random() > 0.6 ? 'Dépôt régulier' : undefined,
      holdPeriod,
      status:             statuses[Math.floor(Math.random() * statuses.length)],
      created_at:         date.toISOString(),
      member_name:        members[Math.floor(Math.random() * members.length)],
      processed_by:       employes[Math.floor(Math.random() * employes.length)],
      validated_by:       supers[Math.floor(Math.random() * supers.length)],
      caisse_numero:      caisse.numero,
      caisse_id:          caisse.id,
      session_id:         `SES-${1000 + i}`,
      session_statut:     Math.random() > 0.3 ? 'ouverte' : 'fermée',
    });
    i++; attempts++;
  }
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ─── Main ────────────────────────────────────────────────────────

export default function DepositDashboard() {
  const [period,      setPeriod]      = useState<'day' | 'week' | 'month'>('week');
  const [loading,     setLoading]     = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [detailTx,    setDetailTx]    = useState<TransactionDetail | null>(null);
  const [editDeposit, setEditDeposit] = useState<DepositData | null>(null);

  const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  const deposits  = useMemo(() => generateMockDeposits(daysBack), [period]);

  // ── KPIs ─────────────────────────────────────────────────────
  const completed      = deposits.filter(d => d.status === 'decaisse');
  const totalAmount    = completed.reduce((s, d) => s + d.montantTransaction, 0);
  const avgAmount      = completed.length ? totalAmount / completed.length : 0;
  const uniqueMembers  = new Set(completed.map(d => d.member_name)).size;
  const pendingCount   = deposits.filter(d => d.status === 'en_attente').length;
  const completionRate = deposits.length ? (completed.length / deposits.length * 100) : 0;

  // ── Graphiques ───────────────────────────────────────────────
  const volumeData = useMemo((): VolumePoint[] => {
    const days: VolumePoint[] = [];
    let back = 0;
    while (days.length < (period === 'day' ? 9 : 5)) {
      back++;
      if (period === 'day') {
        const h = 9 + days.length;
        const d = new Date(); d.setHours(h, 0, 0, 0);
        days.push({ label: `${h}h`, date: d.toISOString(), count: 0, amount: 0 });
        if (days.length >= 9) break;
      } else {
        const d = new Date(); d.setDate(d.getDate() - back);
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          days.unshift({
            label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
            date:  d.toISOString().split('T')[0],
            count: 0,
            amount: 0,
          });
        }
      }
    }
    deposits.forEach(d => {
      const idx = days.findIndex(item =>
        period === 'day'
          ? new Date(item.date).getHours() === new Date(d.created_at).getHours()
          : item.date === d.created_at.split('T')[0]
      );
      if (idx >= 0) { days[idx].count++; days[idx].amount += d.montantTransaction; }
    });
    return days;
  }, [deposits, period]);

  const typeData = useMemo((): TypePoint[] =>
    Object.entries(SUBTYPE_CFG).map(([key, cfg]) => {
      const items = deposits.filter(d => d.depositSubtype === key);
      return {
        key,
        name:   cfg.label,
        value:  items.length,
        amount: items.reduce((s, d) => s + d.montantTransaction, 0),
        color:  cfg.color,
      };
    }), [deposits]);

  // ── Handlers ────────────────────────────────────────────────
  const handleView = (dep: DepositData) => {
    setDetailTx({
      id:                   dep.id,
      kind:                 'deposit',
      status:               dep.status,
      montant:              dep.montantTransaction,
      created_at:           dep.created_at,
      codeAutorisation:     dep.codeAutorisation,
      description:          dep.description,
      member_name:          dep.member_name,
      account_number:       dep.idCompte,
      depositSubtype:       dep.depositSubtype,
      source:               dep.source,
      holdPeriod:           dep.holdPeriod,
      requiresVerification: dep.holdPeriod > 0 || dep.montantTransaction > 50000,
      processed_by:         dep.processed_by,
      validated_by:         dep.validated_by,
      caisse_numero:        dep.caisse_numero,
      caisse_id:            dep.caisse_id,
      session_id:           dep.session_id,
    });
  };

  const handleEdit = (dep: DepositData) => {
    setEditDeposit(dep);
    // TODO : ouvrir EditDepositModal
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dépôts</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">Gestion et suivi des dépôts membres</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Nouveau dépôt
          </button>
        </div>
      </div>

      {/* ── Filtre période ── */}
      <div className="flex gap-2">
        {(['day', 'week', 'month'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p ? 'bg-[#2E7D32] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {p === 'day' ? "Aujourd'hui" : p === 'week' ? '7 jours' : '30 jours'}
          </button>
        ))}
      </div>

      {/* ── Stats (KPIs + Graphiques) ── */}
      <DepositStats
        totalAmount={totalAmount}
        depositCount={deposits.length}
        completedCount={completed.length}
        avgAmount={avgAmount}
        uniqueMembers={uniqueMembers}
        pendingCount={pendingCount}
        completionRate={completionRate}
        volumeData={volumeData}
        typeData={typeData}
      />

      {/* ── Tableau ── */}
      <DepositTable
        deposits={deposits}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* ── Modal nouveau dépôt ── */}
      {modalOpen && (
        <Modal
          isOpen
          onClose={() => setModalOpen(false)}
          size="4xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
                <ArrowDownCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Nouveau dépôt</p>
                <p className="text-xs text-gray-400">Enregistrer un dépôt membre</p>
              </div>
            </div>
          }
        >
          <div className="p-5 overflow-y-auto max-h-[70vh]">
            <DepositForm
              onSubmit={async (data) => {
                console.log('Dépôt soumis :', data);
                setModalOpen(false);
              }}
              onCancel={() => setModalOpen(false)}
            />
          </div>
        </Modal>
      )}

      {/* ── Modal détail transaction ── */}
      <TransactionDetailModal
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
      />


      {editDeposit && (
        <EditDepositModal
          deposit={editDeposit}
          onClose={() => setEditDeposit(null)}
          onSuccess={(updated) => {
            // TODO API : rafraîchir la liste depuis le serveur
            // Pour l'instant met à jour localement
            setEditDeposit(null);
          }}
        />
      )}

    </div>
  );
}