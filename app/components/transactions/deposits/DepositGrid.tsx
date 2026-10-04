'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AlertTriangle, ArrowDownCircle, Clock, Loader2 } from 'lucide-react';
import DepositForm from './DepositForm';
import DepositFilterBar, { DepositFilterPeriod, DepositFilterRange } from './DepositFilterBar';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';
import { Modal } from '../../ui/Modal';
import DepositTable from './DepositTable';
import EditDepositModal from './EditDepositModal';
import { DepositData, DepositFormValidated, mapApiTransactionToDeposit, mapDepositFormToPayload } from '../validation/deposit';
import DifferedDepositModal from './Differeddepositmodal';
import { useSession } from 'next-auth/react';
import { formatMemberName, type MemberOption } from '../../members/validations';

// ⚠️ À ajuster selon l'emplacement réel de caisse.ts dans le projet
import {
  getDeposits,
  createDeposit,
  fetchActiveSession,
  fetchAccountsByMember,
  type CaisseAccountOption,
  fetchAllAccounts,
} from '@/app/lib/api/caisse';
import { fetchMembers } from '@/app/lib/api/members';

// ─── Main ────────────────────────────────────────────────────────

export default function DepositDashboard() {
  const [detailTx,       setDetailTx]       = useState<TransactionDetail | null>(null);
  const [editDeposit,    setEditDeposit]    = useState<DepositData | null>(null);
  const [newDepositOpen, setNewDepositOpen] = useState(false);
  const [showDiffered,   setShowDiffered]   = useState(false);

  // ── Dépôts : chargés depuis l'API, pas de mock ───────────────
  const [deposits,        setDeposits]        = useState<DepositData[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [depositsError,   setDepositsError]   = useState<string | null>(null);

  // ── Session caisse active (nécessaire pour créer un dépôt) ───
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionError,    setSessionError]    = useState<string | null>(null);

  // ── Membres (à brancher sur l'API membres réelle) ────────────
  // ⚠️ Remplacer par un vrai chargement API (ex: getMembers()) — laissé vide
  // pour éviter de réintroduire un mock tant que l'endpoint n'est pas confirmé.
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [accountOwners, setAccountOwners] = useState<Record<string, string>>({});

  // ── Filtres : UNE SEULE source de vérité ─────────────────
  const [search,         setSearch]         = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<DepositFilterPeriod>('all');
  const [selectedType,   setSelectedType]   = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRange,  setSelectedRange]  = useState<DepositFilterRange>('all');

  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.isAdmin ?? false;
  const userId  = (session?.user as any)?.id ?? '';
  const role    = isAdmin ? 'admin' : 'caissier';

  // ── Chargement des dépôts ─────────────────────────────────────
  const loadDeposits = useCallback(async () => {
    setLoading(true);
    setDepositsError(null);
    try {
      const response: any = await getDeposits();
      console.log('[deposits] réponse API :', response);
      // Accepte : tableau direct, réponse Axios, ou pagination DRF
      const raw  = response?.data ?? response;
      const list = Array.isArray(raw) ? raw : raw?.results;

      if (!Array.isArray(list)) {
        throw new Error('Format de réponse inattendu pour la liste des dépôts.');
      }
      setDeposits(list.map(mapApiTransactionToDeposit));
    } catch (err) {
      setDepositsError(
        err instanceof Error ? err.message : "Impossible de charger les dépôts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  // ── Session caisse active ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const active = await fetchActiveSession();
        setActiveSessionId(active?.id ?? null);
        if (!active) {
          setSessionError('Aucune session caisse ouverte. Ouvrez une session avant de créer un dépôt.');
        }
      } catch (err) {
        setSessionError(
          err instanceof Error ? err.message : "Impossible de vérifier la session caisse active."
        );
      }
    })();
  }, []);

  useEffect(() => {
    fetchAllAccounts()
      .then(list => setAccountOwners(Object.fromEntries(list.map(a => [a.id, a.member]))))
      .catch(err => setDepositsError(err instanceof Error ? err.message : String(err)));
  }, []);

  // Croisement calculé au rendu : fonctionne quel que soit l'ordre d'arrivée des données
  const depositsAffiches = useMemo(() => {
    const nomParMembre = Object.fromEntries(members.map(m => [m.id, m.member_name]));
    return deposits.map(d => ({
      ...d,
      member_name: d.member_name ?? nomParMembre[accountOwners[(d as any).account]] ?? null,
    }));
  }, [deposits, members, accountOwners]);

  useEffect(() => {
    (async () => {
      const data = await fetchMembers();
      const options: MemberOption[] = data.map(m => ({
        id:           String(m.id),
        member_name:  formatMemberName(m),
        id_number:    m.id_number ?? '',
        phone_number: m.phone_number || undefined,
      }));
      setMembers(options);
      if (options.length === 0) {
        setDepositsError('Aucun membre chargé — vérifiez la console (erreur API possible).');
      }
    })();
  }, []);
  // ── Comptes d'un membre, pour DepositForm / DifferedDepositModal ──
  const handleFetchMemberAccounts = useCallback(
    async (memberId: string): Promise<CaisseAccountOption[]> => {
      return fetchAccountsByMember(memberId);
    },
    []
  );

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

  const handleEdit = (dep: DepositData) => setEditDeposit(dep);

  const handleExport = async (ids: number[]) => {
    // TODO : brancher sur l'endpoint d'export réel
    console.log('Exporter les IDs :', ids);
  };

  const handleRefresh = () => {
    loadDeposits();
  };

  // const handleDepositSubmit = async (data: DepositFormValidated) => {
  //   if (!activeSessionId) {
  //     throw new Error('Aucune session caisse ouverte. Ouvrez une session avant de créer un dépôt.');
  //   }
  //   const payload = mapDepositFormToPayload(data, activeSessionId);
  //   await createDeposit(payload);
  //   await loadDeposits();
  // };
  // DepositGrid.tsx
  const handleDepositSubmit = async (data: DepositFormValidated): Promise<void> => {
    if (!activeSessionId) throw new Error('Aucune session caisse ouverte.');
    await createDeposit(mapDepositFormToPayload(data, activeSessionId));
    await loadDeposits();
  };

  const handleDifferedSubmit = async (data: any) => {
    // La saisie différée passe par le même endpoint de création de transaction.
    await createDeposit(data);
    await loadDeposits();
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

        {role === 'admin' && (
          <button
            onClick={() => setShowDiffered(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Clock className="w-4 h-4" />
            Saisie différée
          </button>
        )}
      </div>

      {/* ── Bannière : aucune session caisse ouverte ── */}
      {sessionError && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{sessionError}</span>
        </div>
      )}

      {/* ── Bannière : échec de chargement des dépôts ── */}
      {depositsError && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{depositsError}</span>
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
        onAdd={() => setNewDepositOpen(true)}
        onRefresh={handleRefresh}
        deposits={depositsAffiches}
      />

      {/* ── Tableau ── */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement des dépôts…
        </div>
      ) : (
        <DepositTable
          deposits={depositsAffiches}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onExport={handleExport}
          search={search}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          selectedPeriod={selectedPeriod}
          selectedRange={selectedRange}
        />
      )}

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
              fetchMemberAccounts={handleFetchMemberAccounts}
              onSubmit={handleDepositSubmit}
              onCancel={() => setNewDepositOpen(false)}
            />
          </div>
        </Modal>
      )}

      {/* ── Modal saisie différée ── */}
      {showDiffered && activeSessionId && (
        <Modal
          isOpen
          onClose={() => setShowDiffered(false)}
          size="4xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Saisie différée</p>
                <p className="text-xs text-gray-400">Enregistrer une transaction a posteriori</p>
              </div>
            </div>
          }
        >
          <div className="p-5 overflow-y-auto max-h-[70vh]">
            <DifferedDepositModal
              sessionId={activeSessionId}
              saisiPar={userId}
              members={members}
              fetchMemberAccounts={handleFetchMemberAccounts}
              onSubmit={handleDifferedSubmit}
              onCancel={() => setShowDiffered(false)}
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

      {editDeposit && (
        <EditDepositModal
          deposit={editDeposit}
          onClose={() => setEditDeposit(null)}
          onSuccess={() => {
            setEditDeposit(null);
            loadDeposits();
          }}
        />
      )}

    </div>
  );
}