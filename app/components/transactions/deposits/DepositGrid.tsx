'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, ArrowDownCircle } from 'lucide-react';
import DepositForm from './DepositForm';
import DepositFilterBar, { DepositFilterPeriod, DepositFilterRange } from './DepositFilterBar';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';
import { Modal } from '../../ui/Modal';
import DepositTable from './DepositTable';
import EditDepositModal from './EditDepositModal';
import { DepositData, DepositFormData, DepositFormValidated } from '../validation/deposit';
import DifferedDepositModal from './Differeddepositmodal';
import { useSession } from 'next-auth/react';
// ─── Mock ────────────────────────────────────────────────────────

function generateMockDeposits(daysBack: number): DepositData[] {
  const subtypes: DepositData['depositSubtype'][] = ['cash', 'check'];
  const statuses: DepositData['status'][]         = ['encaisse', 'encaisse', 'encaisse', 'en_attente', 'en_cours', 'echoue'];
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
  const [loading,      setLoading]      = useState(false);
  const [detailTx,     setDetailTx]     = useState<TransactionDetail | null>(null);
  const [editDeposit,  setEditDeposit]  = useState<DepositData | null>(null);
  const [newDepositOpen, setNewDepositOpen] = useState(false);

  // ── Filtres : UNE SEULE source de vérité ─────────────────
  const [search,         setSearch]         = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<DepositFilterPeriod>('all');
  const [selectedType,   setSelectedType]   = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRange,  setSelectedRange]  = useState<DepositFilterRange>('all');
  const [showDiffered, setShowDiffered] = useState(false);
  // Hardcodé pour l'instant — Django n'est pas prêt
  // À remplacer par ton contexte auth quand le backend sera prêt
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.isAdmin ?? false;
  const role    = isAdmin ? 'admin' : 'caissier';  // On génère un dataset large ; le filtrage période se fait dans la table.
  const deposits = useMemo(() => generateMockDeposits(365), []);
console.log(role,isAdmin, "admin et role");
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
    console.log('Exporter les IDs :', ids);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const handleDepositSubmit = async (data: DepositFormValidated) => {
    console.log('Mock submit:', data);
    await new Promise(r => setTimeout(r, 500));
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
        deposits={deposits}
        onDiffered={role === 'admin' ? () => setShowDiffered(true) : undefined}
      />

      {/* ── Tableau ── */}
      <DepositTable
        deposits={deposits}
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

      {editDeposit && (
        <EditDepositModal
          deposit={editDeposit}
          onClose={() => setEditDeposit(null)}
          onSuccess={(updated) => {
            // TODO API : rafraîchir la liste depuis le serveur
            setEditDeposit(null);
          }}
        />
    )}
    {showDiffered && (
      <Modal
        isOpen
        onClose={() => setShowDiffered(false)}
        size="3xl"
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Saisie différée</h2>
              <p className="text-xs text-gray-400 mt-0.5">Transaction enregistrée hors délai</p>
            </div>
          </div>
        }
      >
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <DifferedDepositModal
            sessionId="SESS-MOCK"
            saisiPar={(session?.user as any)?.username ?? 'inconnu'}
            onSubmit={async (data) => {
              console.log('[Mock] Saisie différée :', data);
            }}
            onCancel={() => setShowDiffered(false)}
          />
        </div>
      </Modal>
    )}
    </div>
  );
}