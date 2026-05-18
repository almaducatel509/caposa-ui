'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';

import TransferTable from './TransferTable';
import TransferForm from './TransferForm';
import TransactionDetailModal, { TransactionDetail } from '../DetailModal';
import EditTransferModal from './EditTransferModal';
import TransferFilterBar from './TransferFilterBar';
import type {
  TransferData,
  TransferType,
  TransferStatus,
} from '../validation/transfert';

// ─── Mock data ────────────────────────────────────────────────────
// 🏛️ Valeurs officielles CAPOSA :
//   types   : 'interne' | 'externe'
//   statuts : 'approuve' | 'en_attente' | 'en_cours' | 'echoue' | 'annule'

function generateMockTransfers(daysBack: number): TransferData[] {
  // Distribution réaliste : 70% interne, 30% externe
  const types: TransferType[] = [
    'interne', 'interne', 'interne', 'interne', 'interne',
    'externe', 'externe',
  ];

  // Distribution réaliste : majorité approuvée
  const statuses: TransferStatus[] = [
    'approuve', 'approuve', 'approuve', 'approuve',
    'en_attente', 'en_cours', 'echoue', 'annule',
  ];

  const members = [
    { id: 'MEM001', name: 'Hudson Joseph'       },
    { id: 'MEM002', name: 'Marie Dupont'        },
    { id: 'MEM003', name: 'Jean-Pierre Antoine' },
    { id: 'MEM004', name: 'Roseline Pierre'     },
    { id: 'MEM005', name: 'Claudette Moreau'    },
    { id: 'MEM006', name: 'Réginald Beaumont'   },
    { id: 'MEM007', name: 'Nadège Thermidor'    },
    { id: 'MEM008', name: 'Wilgens Désir'       },
  ];
  const employes = ['Josiane Mercier', 'Patrick Dorcélus', 'Nadège Jean-Louis', 'Lionel Préval'];
  const supers   = ['Marie-Ange Celestin', 'Réginald Toussaint'];
  const caisses  = [{ id: 'CAI001', numero: '01' }, { id: 'CAI002', numero: '02' }];

  const data: TransferData[] = [];
  let attempts = 0, i = 0;

  while (i < 60 && attempts < 200) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    if (date.getDay() === 0 || date.getDay() === 6) { attempts++; continue; }
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

    const type     = types[Math.floor(Math.random() * types.length)];
    const status   = statuses[Math.floor(Math.random() * statuses.length)];
    const caisse   = caisses[Math.floor(Math.random() * caisses.length)];
    const initiator = members[Math.floor(Math.random() * members.length)];

    // Pour 'externe' : on choisit un AUTRE membre comme destinataire
    // Pour 'interne' : c'est le même membre, deux comptes différents
    let destination: { id: string; name: string } | undefined;
    if (type === 'externe') {
      do {
        destination = members[Math.floor(Math.random() * members.length)];
      } while (destination.id === initiator.id);
    }

    data.push({
      id:         10000 + i,
      id_member:           initiator.id,
      member_name:         initiator.name,
      account_source:      `ACC${1000 + i}`,
      account_destination: type === 'externe' ? `ACC${5000 + i}` : `ACC${2000 + i}`,
      destination_name:    destination?.name,
      typeTransfert:       type,
      montant:             Math.floor(Math.random() * 80000) + 1000,
      reference:           `VIR-${String(i + 1).padStart(4, '0')}`,
      status,
      created_at:          date.toISOString(),
      dateTransfert:       date.toISOString(),
      processed_by:        employes[Math.floor(Math.random() * employes.length)],
      validated_by:        supers[Math.floor(Math.random() * supers.length)],
      caisse_numero:       caisse.numero,
      caisse_id:           caisse.id,
      session_id:          `SES-${1000 + i}`,
    });
    i++; attempts++;
  }
  return data.sort(
    (a, b) =>
      new Date(b.created_at ?? b.dateTransfert ?? 0).getTime() -
      new Date(a.created_at ?? a.dateTransfert ?? 0).getTime()
  );
}

// ─── Main ────────────────────────────────────────────────────────

export default function TransferDashboard() {
  const [detailTx,   setDetailTx]   = useState<TransactionDetail | null>(null);
  const [editTarget, setEditTarget] = useState<TransferData | null>(null);
  const [overrides,  setOverrides]  = useState<Record<string, TransferData>>({});

  const [period,         setPeriod]         = useState<'day' | 'week' | 'month'>('week');
  const [loading,        setLoading]        = useState(false);
  const [search,         setSearch]         = useState('');
  const [selectedType,   setSelectedType]   = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalOpen,      setModalOpen]      = useState(false);

  // ── Données ───────────────────────────────────────────────────
  const daysBack  = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  const transfers = useMemo(
    () => generateMockTransfers(daysBack).map(t => overrides[t.id] ?? t),
    [daysBack, overrides],
  );

  // ── Filtrage ──────────────────────────────────────────────────
  const filteredTransfers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transfers.filter(t => {
      if (selectedType   !== 'all' && t.typeTransfert !== selectedType)   return false;
      if (selectedStatus !== 'all' && t.status        !== selectedStatus) return false;
      if (q) {
        const haystack = [
          t.id,
          t.reference,
          t.account_source,
          t.account_destination,
          t.member_name,
          t.destination_name,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [transfers, search, selectedType, selectedStatus]);

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

  const handleEditSuccess = (updated: TransferData) => {
    setOverrides(prev => ({ ...prev, [updated.id]: updated }));
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
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Transfert</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">Gestion et suivi des transferts membres</p>
        </div>
      </div>

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
        onRefresh={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 800);
        }}
        transfers={filteredTransfers}
      />

      {/* ── Table ── */}
      <TransferTable
        transfers={filteredTransfers}
        loading={loading}
        onView={handleView}
        onEdit={t => setEditTarget(t)}
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
              <TransferForm onCancel={() => setModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit ── */}
      {editTarget && (
        <EditTransferModal
          transfer={editTarget}
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