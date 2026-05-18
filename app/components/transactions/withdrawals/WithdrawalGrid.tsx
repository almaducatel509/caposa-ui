'use client';

import React, { useState, useMemo } from 'react';
import { TrendingDown, X } from 'lucide-react';

import WithdrawalTable, { WithdrawalData } from './WithdrawalTable';
import WithdrawalFilterBar from './WithdrawalFilterBar';
import WithdrawalForm from './WithdrawalForm';
import EditWithdrawalModal from './EditWithdrawalModal';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';

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
  const [period,       setPeriod]       = useState<'day' | 'week' | 'month'>('week');
  const [loading,      setLoading]      = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [detailTx,     setDetailTx]     = useState<TransactionDetail | null>(null);
  const [editTarget,   setEditTarget]   = useState<WithdrawalData | null>(null);

  // ── Filtres ─────────────────────────────────────────────────
  const [search,         setSearch]         = useState('');
  const [selectedType,   setSelectedType]   = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Regénère les données quand la période change
  const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  const data     = useMemo(() => generateMockWithdrawals(daysBack), [period]);

  // ── Filtrage ────────────────────────────────────────────────
  const filteredWithdrawals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter(w => {
      if (selectedType   !== 'all' && w.withdrawalSubtype !== selectedType)   return false;
      if (selectedStatus !== 'all' && w.status            !== selectedStatus) return false;
      if (q) {
        const haystack = [
          w.codeAutorisation,
          w.idCompte,
          w.member_name,
          w.motif,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data, search, selectedType, selectedStatus]);

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
    // TODO API : rafraîchir la liste depuis le serveur
    console.log('Retrait mis à jour :', updated);
  };

  const handleExport = async (ids: number[]) => {
    // TODO : appel API export CSV
    console.log('Exporter les IDs :', ids);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
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
      </div>

      {/* ── Barre de filtres ── */}
      <WithdrawalFilterBar
        filterValue={search}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        selectedPeriod={period}
        totalCount={filteredWithdrawals.length}
        loading={loading}
        onSearchChange={setSearch}
        onClear={() => setSearch('')}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onPeriodChange={setPeriod}
        onAdd={() => setModalOpen(true)}
        onRefresh={handleRefresh}
        withdrawals={filteredWithdrawals}
      />

      {/* ── Table ── */}
      <WithdrawalTable
        withdrawals={filteredWithdrawals}
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