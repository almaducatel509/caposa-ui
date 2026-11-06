'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ArrowDownCircle } from 'lucide-react';
import DepositForm from './DepositForm';
import DepositFilterBar, { DepositFilterPeriod, DepositFilterRange } from './DepositFilterBar';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';
import { Modal } from '../../ui/Modal';
import DepositTable from './DepositTable';
import { DepositData, DepositFormValidated } from '../validation/deposit';
import { createDeposit, createTransaction, fetchAccountsByMember, fetchTransactions } from '@/app/lib/api/caisse';
import type { DepositApiResult } from './DepositReceipt';
import type { MemberOption, MemberData } from '../../members/validations'; // ← vérifie que MemberData est bien exporté ici
import { fetchMembers } from '@/app/lib/api/members';
import { useRef } from 'react';

// ─── Mappers (hors composant : pas recréés à chaque rendu) ───────

/** Membre complet (API) → option réduite attendue par DepositForm */
const toMemberOption = (m: MemberData): MemberOption => ({
  id:           String(m.id),
  member_name:  `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(), // ← vérifie les noms de champs
  id_number:    m.id_number ?? '',
  phone_number: m.phone_number,
});

/** Transaction (API Django) → ligne de la table des dépôts.
 *  Provisoire : clés à confirmer avec un vrai objet de /transactions/ */
const mapApiToDepositData = (t: any): DepositData => ({
  id:                 t.id,
  session_id:         String(t.session ?? t.session_id ?? ''),
  session_statut:     t.session_statut ?? t.session_status ?? 'ouverte',
  idCompte:           t.account_number ?? String(t.account ?? ''),
  codeAutorisation:   t.authorization_code ?? t.reference ?? '',
  montantTransaction: Number(t.amount ?? 0),
  depositSubtype:     t.deposit_subtype ?? 'cash',
  source:             t.source ?? '',
  description:        t.description ?? undefined,
  holdPeriod:         t.hold_period ?? 0,
  status:             t.status ?? 'encaisse',
  created_at:         t.created_at,
  member_name:        t.member_name ?? '',
  processed_by:       t.processed_by ?? t.employee_name ?? '',
  validated_by:       t.validated_by ?? '',
  caisse_numero:      t.caisse_numero ?? '',
  caisse_id:          String(t.caisse ?? t.caisse_id ?? ''),
});

const isDeposit = (t: any) =>
  String(t.transaction_type ?? t.type ?? '').toUpperCase() === 'DEPOSIT';

// ─── Main ────────────────────────────────────────────────────────

export default function DepositDashboard() {
  // ── Données ──────────────────────────────────────────────
  const [deposits,  setDeposits]  = useState<DepositData[]>([]);
  const [members,   setMembers]   = useState<MemberOption[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Modals ───────────────────────────────────────────────
  const [detailTx,       setDetailTx]       = useState<TransactionDetail | null>(null);
  const [newDepositOpen, setNewDepositOpen] = useState(false);

  // ── Filtres : UNE SEULE source de vérité ─────────────────
  const [search,         setSearch]         = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<DepositFilterPeriod>('all');
  const [selectedType,   setSelectedType]   = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRange,  setSelectedRange]  = useState<DepositFilterRange>('all');

  // ── Chargement ───────────────────────────────────────────
  const loadDeposits = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const txs = await fetchTransactions();
      setDeposits(txs.filter(isDeposit).map(mapApiToDepositData));
    } catch {
      setLoadError('Impossible de charger les dépôts. Vérifiez la connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Un seul chargement au montage (membres + dépôts)
  useEffect(() => {
    loadDeposits();
    fetchMembers()
      .then(list => setMembers(list.map(toMemberOption)))
      .catch(() => setLoadError('Impossible de charger la liste des membres.'));
  }, [loadDeposits]);

  const fetchMemberAccounts = (memberId: string) => fetchAccountsByMember(memberId);

  // ── Handlers ─────────────────────────────────────────────
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


  const handleExport = async (ids: number[]) => {
    console.log('Exporter les IDs :', ids);
  };

  const handleRefresh = () => loadDeposits();

  // Une clé d'idempotence par ouverture du formulaire :
  // un double-clic ou un retry ne crée pas deux dépôts
  const idemKeyRef = useRef<string>('');

  const openNewDeposit = () => {
    idemKeyRef.current = crypto.randomUUID();
    setNewDepositOpen(true);
  };

  const handleDepositSubmit = async (data: DepositFormValidated): Promise<DepositApiResult> => {
    const result = await createDeposit(data /* ou mapDepositToPayload(data) si trouvé */, idemKeyRef.current);
    idemKeyRef.current = crypto.randomUUID(); // nouveau dépôt = nouvelle clé
    await loadDeposits();
    return result as DepositApiResult;
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
      </div>

      {/* ── Erreur de chargement ── */}
      {loadError && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{loadError}</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── Barre de filtres ── */}
      <DepositFilterBar
        filterValue={search}
        selectedPeriod={selectedPeriod}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        selectedRange={selectedRange}
        totalCount={deposits.length}
        loading={loading}
        onSearchChange={setSearch}
        onClear={() => setSearch('')}
        onPeriodChange={setSelectedPeriod}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onRangeChange={setSelectedRange}
        onAdd={openNewDeposit}
        onRefresh={handleRefresh}
        deposits={deposits}
      />

      {/* ── Tableau ── */}
      <DepositTable
        deposits={deposits}
        loading={loading}
        onView={handleView}
        onExport={handleExport}
        search={search}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        selectedPeriod={selectedPeriod}
        selectedRange={selectedRange}
      />

      {/* ── Modal nouveau dépôt ── */}
      {newDepositOpen && (
        <Modal
          isOpen
          onClose={() => setNewDepositOpen(false)}
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
              members={members}
              fetchMemberAccounts={fetchMemberAccounts}
              onSubmit={handleDepositSubmit}
              onCancel={() => setNewDepositOpen(false)}
            />
          </div>
        </Modal>
      )}

      {/* ── Modal détail transaction ── */}
      {detailTx && (
        <TransactionDetailModal
          transaction={detailTx}
          onClose={() => setDetailTx(null)}
        />
      )}


    </div>
  );
}