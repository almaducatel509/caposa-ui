'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeftRight, X, AlertTriangle } from 'lucide-react';

import TransferTable from './TransferTable';
import TransferForm, { TransferSubmitInput } from './TransferForm';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';
import TransferFilterBar from './TransferFilterBar';
import type { TransferData, TransferStatus } from '../validation/transfert';
import type { MemberOption } from '../../members/validations';
import type { AccountOption } from '../../accounts/validationsaccount';
import {
  getTransfers,
  createTransfer,
  fetchAllAccounts,
  fetchAccountsByMember,
  type TransferApiResult,
} from '@/app/lib/api/caisse';
import { fetchMembers } from '@/app/lib/api/members';

// Règle métier : un transfert n'est jamais modifié.
// Pour le défaire, on crée simplement un nouveau transfert en sens inverse.

// ─── Mappers API → Front ──────────────────────────────────────────

/** ⚠️ À aligner sur les choices réels de Transaction.status (models.py). */
const STATUS_MAP: Record<string, TransferStatus> = {
  completed: 'approuve',  approved:  'approuve', success: 'approuve',
  pending:   'en_attente',
  processing:'en_cours',
  failed:    'echoue',    rejected:  'echoue',
  cancelled: 'annule',    canceled:  'annule',
};

function mapTransferStatus(raw?: string | null): TransferStatus {
  const key = String(raw ?? '').toLowerCase();
  const mapped = STATUS_MAP[key];
  if (!mapped) console.warn('[transferts] statut backend inconnu :', raw);
  return mapped ?? 'en_attente';
}

/** Membre API → MemberOption (même forme que pour les dépôts). */
function toMemberOption(m: any): MemberOption {
  return {
    id:          String(m.id),
    member_name: m.full_name ?? `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
    id_number:   m.id_number ?? '',
  } as MemberOption;
}

type AccountRef = { id: string; member: string; account_number: string };

function mapApiTransfer(
  tx: TransferApiResult,
  accountById: Map<string, AccountRef>,
  memberById: Map<string, MemberOption>,
): TransferData {
  const src = accountById.get(String(tx.account));
  const dst = accountById.get(String(tx.to_account));
  const srcMember = src ? memberById.get(src.member) : undefined;
  const dstMember = dst ? memberById.get(dst.member) : undefined;

  return {
    id:                  tx.id,
    id_member:           src?.member ?? '',
    member_name:         srcMember?.member_name ?? '—',
    account_source:      tx.account_number    ?? src?.account_number ?? String(tx.account ?? ''),
    account_destination: tx.to_account_number ?? dst?.account_number ?? String(tx.to_account ?? ''),
    destination_name:    dstMember?.member_name,
    // même membre → interne ; deux membres différents → externe
    typeTransfert:       src && dst && src.member === dst.member ? 'interne' : 'externe',
    montant:             Number(tx.amount) || 0,
    reference:           tx.reference_number ?? tx.reference ?? undefined,
    description:         tx.description ?? undefined,
    status:              mapTransferStatus(tx.status),
    created_at:          tx.created_at,
    dateTransfert:       tx.transaction_date ?? tx.created_at,
    processed_by:        tx.created_by != null ? String(tx.created_by) : undefined,
    session_id:          tx.session != null ? String(tx.session) : undefined,
  } as TransferData;
}

function periodStart(period: 'day' | 'week' | 'month'): Date {
  const d = new Date();
  if (period === 'day') { d.setHours(0, 0, 0, 0); return d; }
  d.setDate(d.getDate() - (period === 'week' ? 7 : 30));
  return d;
}

// ─── Main ────────────────────────────────────────────────────────

export default function TransferDashboard() {
  const [detailTx,  setDetailTx]  = useState<TransactionDetail | null>(null);

  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [members,   setMembers]   = useState<MemberOption[]>([]);
  const [loadError, setLoadError] = useState('');

  const [period,         setPeriod]         = useState<'day' | 'week' | 'month'>('week');
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [selectedType,   setSelectedType]   = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalOpen,      setModalOpen]      = useState(false);

  // ── Chargement API (aucun fallback mock) ─────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [rawTransfers, accounts, rawMembers] = await Promise.all([
        getTransfers(),
        fetchAllAccounts(),
        fetchMembers(),
      ]);

      const memberOptions = (rawMembers as any[]).map(toMemberOption);
      const memberById    = new Map(memberOptions.map(m => [m.id, m]));
      const accountById   = new Map(accounts.map(a => [a.id, a]));

      setMembers(memberOptions);
      setTransfers(
        rawTransfers
          .map(tx => mapApiTransfer(tx, accountById, memberById))
          .sort((a, b) =>
            new Date(b.created_at ?? b.dateTransfert ?? 0).getTime() -
            new Date(a.created_at ?? a.dateTransfert ?? 0).getTime()),
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Impossible de charger les transferts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Callbacks pour le formulaire ─────────────────────────────
  const fetchMemberAccounts = useCallback(async (memberId: string): Promise<AccountOption[]> => {
    const accounts = await fetchAccountsByMember(memberId);
    return accounts.map(a => ({
      id:             a.id,
      account_number: a.account_number,
      typeCompte:     a.typeCompte,
      balance:        a.soldeActuel,
      account_status: a.account_status as AccountOption['account_status'],
    }));
  }, []);

  const submitTransfer = useCallback((input: TransferSubmitInput) =>
    createTransfer(
      {
        account:     input.sourceAccountId,
        to_account:  input.destAccountId,
        amount:      input.amount,
        description: input.description,
      },
      input.idemKey,
    ), []);

  // ── Filtrage ──────────────────────────────────────────────────
  const filteredTransfers = useMemo(() => {
    const q     = search.trim().toLowerCase();
    const since = periodStart(period).getTime();

    return transfers.filter(t => {
      const date = new Date(t.created_at ?? t.dateTransfert ?? 0).getTime();
      if (date < since) return false;
      if (selectedType   !== 'all' && t.typeTransfert !== selectedType)   return false;
      if (selectedStatus !== 'all' && t.status        !== selectedStatus) return false;
      if (q) {
        const haystack = [
          t.id, t.reference, t.account_source, t.account_destination,
          t.member_name, t.destination_name,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [transfers, search, selectedType, selectedStatus, period]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleView = (t: TransferData) => {
    setDetailTx({
      id:                t.id,
      kind:              'transfer',
      status:            t.status ?? 'en_attente',
      montant:           t.montant,
      created_at:        t.created_at ?? t.dateTransfert ?? new Date().toISOString(),
      reference:         t.reference,
      description:       t.description,
      member_name:       t.member_name,
      compteSource:      t.account_source,
      compteDestination: t.account_destination,
      transferType:      t.typeTransfert,
      processed_by:      t.processed_by,
      validated_by:      t.validated_by,
      caisse_numero:     t.caisse_numero,
      caisse_id:         t.caisse_id,
      session_id:        t.session_id,
    } as TransactionDetail);
  };

  const handleExport = async (ids: TransferData['id'][]) => {
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
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Transfert</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">Gestion et suivi des transferts membres</p>
        </div>
      </div>

      {/* ── Erreur de chargement ── */}
      {loadError && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{loadError}</span>
          </div>
          <button onClick={load} className="text-xs font-semibold underline shrink-0">Réessayer</button>
        </div>
      )}

      {/* ── Barre de filtres ── */}
      <TransferFilterBar
        filterValue={search}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        selectedPeriod={period}
        totalCount={filteredTransfers.length}
        loading={loading}
        onSearchChange={setSearch}
        onClear={() => setSearch('')}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onPeriodChange={setPeriod}
        onAdd={() => setModalOpen(true)}
        onRefresh={load}
        transfers={filteredTransfers}
      />

      {/* ── Table ── */}
      <TransferTable
        transfers={filteredTransfers}
        loading={loading}
        onView={handleView}
        onExport={handleExport}
      />

      {/* ── Modal Nouveau virement ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10">
          <div className="w-full max-w-2xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Nouveau virement</p>
                  <p className="text-xs text-gray-400">Transfert entre comptes ou vers un autre membre CAPOSA</p>
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
              <TransferForm
                members={members}
                fetchMemberAccounts={fetchMemberAccounts}
                onSubmit={submitTransfer}
                onSuccess={() => load()}
                onCancel={() => setModalOpen(false)}
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