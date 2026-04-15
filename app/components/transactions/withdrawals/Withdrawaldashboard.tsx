'use client';

import React, { useState, useMemo } from 'react';
import { TrendingDown, RefreshCw, Plus, X } from 'lucide-react';

import WithdrawalTable, { WithdrawalData } from './WithdrawalTable';
import WithdrawalStats, { VolumePoint, TypePoint } from './WithdrawalStats';
import WithdrawalForm from './WithdrawalForm';
import EditWithdrawalModal from './EditWithdrawalModal';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';

// ─── Constantes ───────────────────────────────────────────────────

const C = {
  green:     '#2E7D32',
  greenPale: '#DDEAD5',
  blue:      '#355C7D',
  gold:      '#D4AF37',
};

const SUBTYPE_CFG: Record<string, { label: string; color: string }> = {
  counter:           { label: 'Comptoir',          color: C.green },
  check:             { label: 'Chèque',            color: C.blue  },
  loan_disbursement: { label: 'Décaissement prêt', color: C.gold  },
  other:             { label: 'Autre',             color: '#6E6E6E' },
};

// ─── Mock data ────────────────────────────────────────────────────

function generateMockWithdrawals(daysBack: number): WithdrawalData[] {
  const subtypes: WithdrawalData['withdrawalSubtype'][] = ['counter', 'counter', 'counter', 'check', 'loan_disbursement', 'other'];
  const statuses: WithdrawalData['status'][]            = ['decaisse', 'decaisse', 'decaisse', 'en_attente', 'en_cours', 'echoue'];
  const members   = ['Hudson Joseph', 'Marie Dupont', 'Jean-Pierre Antoine', 'Roseline Pierre', 'Claudette Moreau', 'Réginald Beaumont'];
  const motifs    = ['Achat fournitures', 'Paiement facture', 'Dépenses courantes', 'Urgence médicale', 'Autre'];
  const employes  = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supers    = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses   = [{ id: 'CAI001', numero: '01' }, { id: 'CAI002', numero: '02' }];

  const data: WithdrawalData[] = [];
  let attempts = 0, i = 0;

  while (i < 60 && attempts < 200) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    if (date.getDay() === 0 || date.getDay() === 6) { attempts++; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    const subtype = subtypes[Math.floor(Math.random() * subtypes.length)];
    const amount  = Math.floor(Math.random() * 50000) + 500;
    const caisse  = caisses[Math.floor(Math.random() * caisses.length)];
    const status  = statuses[Math.floor(Math.random() * statuses.length)];

    data.push({
      id:                   i + 1,
      idCompte:             `ACC${1000 + i}`,
      codeAutorisation:     `AUTHW${100000 + i}`,
      montantTransaction:   amount,
      withdrawalSubtype:    subtype,
      motif:                motifs[Math.floor(Math.random() * motifs.length)],
      requiresVerification: amount > 50000 || subtype === 'check',
      status,
      created_at:           date.toISOString(),
      member_name:          members[Math.floor(Math.random() * members.length)],
      processed_by:         employes[Math.floor(Math.random() * employes.length)],
      validated_by:         supers[Math.floor(Math.random() * supers.length)],
      caisse_numero:        caisse.numero,
      caisse_id:            caisse.id,
      session_id:           `SES-${1000 + i}`,
      session_statut:       status === 'decaisse' || status === 'annule' ? 'fermée' : 'ouverte',
    });
    i++; attempts++;
  }
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ─── Main ────────────────────────────────────────────────────────

export default function WithdrawalDashboard() {
  const [period,      setPeriod]      = useState<'day' | 'week' | 'month'>('week');
  const [loading,     setLoading]     = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [detailTx,    setDetailTx]    = useState<TransactionDetail | null>(null);
  const [editTarget,  setEditTarget]  = useState<WithdrawalData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>(() => generateMockWithdrawals(7));

  // Regénère les données quand la période change
  const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  const data     = useMemo(() => generateMockWithdrawals(daysBack), [period]);

  // ── KPIs ──────────────────────────────────────────────────────

  const completed      = data.filter(w => w.status === 'decaisse');
  const totalAmount    = completed.reduce((s, w) => s + w.montantTransaction, 0);
  const avgAmount      = completed.length ? totalAmount / completed.length : 0;
  const uniqueMembers  = new Set(completed.map(w => w.member_name)).size;
  const pendingCount   = data.filter(w => w.status === 'en_attente').length;
  const completionRate = data.length ? completed.length / data.length * 100 : 0;

  // ── Volume data ───────────────────────────────────────────────

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
            label:  d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
            date:   d.toISOString().split('T')[0],
            count:  0,
            amount: 0,
          });
        }
      }
    }
    data.forEach(w => {
      const idx = days.findIndex(item =>
        period === 'day'
          ? new Date(item.date).getHours() === new Date(w.created_at).getHours()
          : item.date === w.created_at.split('T')[0]
      );
      if (idx >= 0) { days[idx].count++; days[idx].amount += w.montantTransaction; }
    });
    return days;
  }, [data, period]);

  // ── Type distribution ─────────────────────────────────────────

  const typeData = useMemo((): TypePoint[] =>
    Object.entries(SUBTYPE_CFG).map(([key, cfg]) => {
      const items = data.filter(w => w.withdrawalSubtype === key);
      return {
        key,
        name:   cfg.label,
        value:  items.length,
        amount: items.reduce((s, w) => s + w.montantTransaction, 0),
        color:  cfg.color,
      };
    }), [data]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleView = (w: WithdrawalData) => {
    setDetailTx({
      id:                   w.id,
      kind:                 'withdrawal',
      status:               w.status,
      montant:              w.montantTransaction,
      created_at:           w.created_at,
      codeAutorisation:     w.codeAutorisation,
      description:          w.description,
      member_name:          w.member_name,
      account_number:       w.idCompte,
      withdrawalSubtype:    w.withdrawalSubtype,
      motif:                w.motif,
      requiresVerification: w.requiresVerification,
      processed_by:         w.processed_by,
      validated_by:         w.validated_by,
      caisse_numero:        w.caisse_numero,
      caisse_id:            w.caisse_id,
      session_id:           w.session_id,
    });
  };

  const handleEditSuccess = (updated: WithdrawalData) => {
    setWithdrawals(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const handleExport = async (ids: number[]) => {
    // TODO : appel API export CSV
    console.log('Exporter les IDs :', ids);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Retraits</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">Gestion et suivi des retraits membres</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Nouveau retrait
          </button>
        </div>
      </div>

      {/* ── Filtre période ── */}
      <div className="flex gap-2">
        {(['day', 'week', 'month'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p === 'day' ? "Aujourd'hui" : p === 'week' ? '7 jours' : '30 jours'}
          </button>
        ))}
      </div>

      {/* ── Stats (KPIs + graphiques) ── */}
      <WithdrawalStats
        totalAmount={totalAmount}
        withdrawalCount={data.length}
        completedCount={completed.length}
        avgAmount={avgAmount}
        uniqueMembers={uniqueMembers}
        pendingCount={pendingCount}
        completionRate={completionRate}
        volumeData={volumeData}
        typeData={typeData}
      />

      {/* ── Table ── */}
      <WithdrawalTable
        withdrawals={data}
        loading={loading}
        onView={handleView}
        onEdit={w => setEditTarget(w)}
        onExport={handleExport}
      />

      {/* ── Modal Nouveau retrait ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10">
          <div className="w-full max-w-2xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Nouveau retrait</p>
                  <p className="text-xs text-gray-400">Enregistrer un retrait membre</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[80vh]">
              <WithdrawalForm onCancel={() => setModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit ── */}
      {editTarget && (
        <EditWithdrawalModal
          withdrawal={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* ── Modal Détail ── */}
      <TransactionDetailModal
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
      />

    </div>
  );
}