'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TrendingDown, X, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { getWithdrawals, createWithdrawal } from '@/app/lib/api/caisse';
import WithdrawalTable, { WithdrawalData } from './WithdrawalTable';
import WithdrawalFilterBar from './WithdrawalFilterBar';
import WithdrawalForm from './WithdrawalForm';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';
import { WithdrawalFormValidated } from '../validation/withdrawal';
import { fetchMembers, fetchMemberAccounts } from '@/app/lib/api/members';
// import { fetchMembers } from '@/app/lib/api/members';

// ─── Mapping API (TransactionSerializer) → WithdrawalData ────────

const STATUS_FROM_API: Record<string, WithdrawalData['status']> = {
  completed: 'decaisse',
  pending:   'en_attente',
  failed:    'echoue',
  cancelled: 'annule',
};

const SUBTYPE_FROM_METHOD: Record<string, WithdrawalData['withdrawalSubtype']> = {
  cash:     'counter',
  check:    'check',
  transfer: 'other',
};

function mapApiWithdrawal(t: any): WithdrawalData {
  return {
    id:                   String(t.id),
    idCompte:             t.account_number ?? '',
    codeAutorisation:     t.reference ?? '',
    montantTransaction:   Number(t.amount ?? 0),
    withdrawalSubtype:    SUBTYPE_FROM_METHOD[t.method] ?? 'counter',
    motif:                t.reason ?? '',
    description:          t.note ?? '',
    requiresVerification: t.method === 'check',
    status:               STATUS_FROM_API[t.status] ?? 'en_attente',
    created_at:           t.created_at,
    member_name:          t.member_name ?? '',
    processed_by:         t.created_by != null ? String(t.created_by) : '',
    validated_by:         '',
    caisse_numero:        t.caisse_numero ?? '',
    caisse_id:            '',
    session_id:           t.session_id ?? '',
  };
}

// const isWithdrawal = (t: any) => t.transaction_type === 'WITHDRAWAL';

// ─── Période → date de début ─────────────────────────────────────

function periodStart(period: 'day' | 'week' | 'month'): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === 'week')  d.setDate(d.getDate() - 6);
  if (period === 'month') d.setDate(d.getDate() - 29);
  return d;
}

// ─── Main ────────────────────────────────────────────────────────

export default function WithdrawalDashboard() {
  const [period,    setPeriod]    = useState<'day' | 'week' | 'month'>('week');
  const [data,      setData]      = useState<WithdrawalData[]>([]);
  const [members,   setMembers]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailTx,  setDetailTx]  = useState<TransactionDetail | null>(null);

  // ── Filtres ─────────────────────────────────────────────────
  const [search,         setSearch]         = useState('');
  const [selectedType,   setSelectedType]   = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // ── Chargement ──────────────────────────────────────────────
  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getWithdrawals();
      setData(
        list
          .map(mapApiWithdrawal)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      );
    } catch (e: any) {
      setError(e?.message ?? 'Impossible de charger les retraits.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWithdrawals(); }, [loadWithdrawals]);

  useEffect(() => {
    fetchMembers()
      .then((list: any[]) =>
        setMembers(list.map(m => ({
          ...m,
          member_name: m.member_name ?? [m.first_name, m.last_name].filter(Boolean).join(' '),
          id_number:   String(m.id_number ?? ''),
        }))),
      )
      .catch((e: any) => setError(e?.message ?? 'Impossible de charger les membres.'));
  }, []);

  // ── Filtrage ────────────────────────────────────────────────
  const filteredWithdrawals = useMemo(() => {
    const q     = search.trim().toLowerCase();
    const start = periodStart(period).getTime();
    return data.filter(w => {
      if (new Date(w.created_at).getTime() < start)                            return false;
      if (selectedType   !== 'all' && w.withdrawalSubtype !== selectedType)   return false;
      if (selectedStatus !== 'all' && w.status            !== selectedStatus) return false;
      if (q) {
        const haystack = [w.codeAutorisation, w.idCompte, w.member_name, w.motif]
          .filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data, period, search, selectedType, selectedStatus]);

  // ── Handlers ────────────────────────────────────────────────
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

  // const handleWithdrawalSubmit = async (form: WithdrawalFormValidated) => {
  //   // Les erreurs (ex. « Fonds insuffisants ») remontent au WithdrawalForm.
  //   await createTransaction({
  //     transaction_type: 'WITHDRAWAL',
  //     account:          form.idCompte,          // UUID du compte, pas account_number
  //     amount:           form.montantTransaction,
  //     reason:           form.reason,
  //     method:           'cash',
  //   } as any);
  //   setModalOpen(false);
  //   await loadWithdrawals();
  // };
  const handleWithdrawalSubmit = async (form: WithdrawalFormValidated) => {
    const result = await createWithdrawal({
      account: form.idCompte,
      amount:  form.montantTransaction,
      reason:  form.reason,
    });
    loadWithdrawals();
    return result;
  };
  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
           <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-white" />
           </div>

            <h1 className="text-3xl font-bold text-gray-900">Retraits</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">Gestion et suivi des retraits membres</p>
        </div>
      </div>

      {/* ── Erreur API ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm text-red-700">{error}</div>
          <button
            onClick={loadWithdrawals}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

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
        onRefresh={loadWithdrawals}
        withdrawals={filteredWithdrawals}
      />
            {/* ── Table ── */}
      <WithdrawalTable
        withdrawals={filteredWithdrawals}
        loading={loading}
        onView={handleView}
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
              <WithdrawalForm
                members={members}
                fetchMemberAccounts={fetchMemberAccounts}
                onCancel={() => setModalOpen(false)}
                onSubmit={handleWithdrawalSubmit}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Détail ── */}
      <TransactionDetailModal
        transaction={detailTx}
        onClose={() => setDetailTx(null)}
      />

    </div>
  );
}