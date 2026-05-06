'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import { AccountData } from './validationsaccount';
import { mockAccounts } from './mockAccountData';
import { AccountBulkAction } from './AccountBulkActionDropdown';

// UI
import PageHeader       from '@/app/components/header';
import AccountFilterBar from './AccountFilterBar';
import AccountTable     from './AccountTable';

// Modals
import AccountDetailModal  from './modals/AccountDetailModal';
import CloseAccountModal   from './modals/CloseAccountModal';
import SuspendAccountModal from './modals/SuspendAccountModal';
import AccountHistoryModal from './modals/AccountHistoryModal';
import CreateAccountModal  from './modals/EditAccountModal';

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// 1. Statuts ramenés à 3 valeurs : 'ouvert' | 'gelé' | 'fermé'.
//    → Onglet et filtre partagent le MÊME type. Plus aucun mapping.
//
// 2. Onglets UI : "Ouverts" / "Gelés" / "Archive" (le label "Archive" est
//    purement cosmétique, l'état métier est 'fermé').
//
// 3. Garde-fous : un compte 'fermé' ne peut PAS être :
//    - geler (handleSuspend bloqué)
//    - fermer une 2e fois (handleClose bloqué)
//    - dégeler (les bulk actions 'activate' et 'suspend' filtrent les fermés)
//    - supprimé via UI (handleDelete bloqué)
//    Seules les actions de LECTURE restent autorisées (view, history, export).
//
// 4. Le helper `canActOn()` centralise la règle "compte vivant uniquement"
//    pour rester cohérent partout (UI ET bulk actions).
// ─────────────────────────────────────────────────────────────────────────────

// 3 vraies valeurs métier (alignées avec le futur modèle Django)
// type AccountStatus = 'ouvert' | 'gelé' | 'fermé';
// type StatusFilter  = AccountStatus | 'all';
export type AccountStatus = 'ouvert' | 'gelé' | 'fermé';
export type StatusFilter  = AccountStatus | 'all';

// Garde-fou : un compte 'fermé' est en lecture seule, aucune action métier
const canActOn = (acc: AccountData | null): boolean =>
  !!acc && acc.statusAccount !== 'fermé';

const AccountGrid: React.FC = () => {

  // ── Data ──
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── Filters ──
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType,    setSelectedType]    = useState('all');
  const [selectedStatus,  setSelectedStatus]  = useState<StatusFilter>('all');

  // ── Modals ──
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [showDetail,      setShowDetail]      = useState(false);
  const [showClose,       setShowClose]       = useState(false);
  const [showSuspend,     setShowSuspend]     = useState(false);
  const [showHistory,     setShowHistory]     = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ── Tab : MÊME type que le filtre (3 valeurs) ──
  const [activeAccountTab, setActiveAccountTab] = useState<AccountStatus>('ouvert');

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadAccounts = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setAccounts(mockAccounts);
    } catch (err) {
      console.error('Erreur chargement comptes:', err);
      setError('Impossible de charger les données des comptes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAccounts(); }, []);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ──── Filtrage : comparaison directe, plus aucun mapping ──────────────────
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchSearch =
        !debouncedSearch ||
        acc.account_number?.toLowerCase().includes(debouncedSearch) ||
        acc.member_details?.full_name?.toLowerCase().includes(debouncedSearch) ||
        acc.member_details?.email?.toLowerCase().includes(debouncedSearch);

      const matchType =
        selectedType === 'all' || acc.typeCompte === selectedType;

      const matchStatus =
        selectedStatus === 'all' || acc.statusAccount === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [accounts, debouncedSearch, selectedType, selectedStatus]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd = () => {
    setSelectedAccount(null);
    setShowCreateModal(true);
  };

  // Lecture : toujours autorisée
  const handleView             = (a: AccountData) => { setSelectedAccount(a); setShowDetail(true); };
  const handleViewTransactions = (a: AccountData) => { setSelectedAccount(a); setShowHistory(true); };

  // Actions métier : bloquées si compte fermé
  const handleSuspend = (a: AccountData) => {
    if (!canActOn(a)) {
      console.warn('Action ignorée : un compte fermé ne peut pas être gelé.');
      return;
    }
    setSelectedAccount(a);
    setShowSuspend(true);
  };

  const handleClose = (a: AccountData) => {
    if (!canActOn(a)) {
      console.warn('Action ignorée : ce compte est déjà fermé.');
      return;
    }
    setSelectedAccount(a);
    setShowClose(true);
  };

  // Couplage onglet ↔ filtre : trivial (mêmes clés des 2 côtés)
  // const handleStatusChange = (status: StatusFilter) => {
  //   setSelectedStatus(status);
  //   if (status !== 'all') setActiveAccountTab(status);
  // };
  const handleStatusChange = (status: StatusFilter) => {
  setSelectedStatus(status);

  if (status === 'all') {
    // Quand on enlève le filtre → retour à l’onglet "ouvert"
    setActiveAccountTab('ouvert');
  } else {
    // Sinon l’onglet suit le statut
    setActiveAccountTab(status);
  }
};


  // ── Bulk action ────────────────────────────────────────────────────────────
  // Filtre les comptes fermés AVANT de déclencher l'action métier.
  const handleBulkAction = async (action: AccountBulkAction, ids: string[]) => {
    // Pour l'export, on autorise tous les comptes (y compris fermés)
    if (action === 'export') {
      exportToCSV(ids);
      return;
    }

    // Pour les autres actions : on retire les comptes fermés
    const actionableIds = accounts
      .filter(a => ids.includes(a.id) && canActOn(a))
      .map(a => a.id);

    const skipped = ids.length - actionableIds.length;
    if (skipped > 0) {
      console.warn(`${skipped} compte(s) fermé(s) ignoré(s) pour l'action "${action}".`);
    }

    switch (action) {
      case 'activate': console.log('Débloquer comptes:', actionableIds); break;
      case 'suspend':  console.log('Geler comptes:',     actionableIds); break;
      case 'close':    console.log('Fermer comptes:',    actionableIds); break;
    }
    await loadAccounts();
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportToCSV = (ids: string[]) => {
    const selectedAccounts = filteredAccounts.filter(a => ids.includes(a.id));
    const headers = ['Numero de compte', 'Membre', 'Email', 'Type', 'Solde', 'Statut', 'Depuis'];
    const rows = selectedAccounts.map(a => [
      a.account_number ?? '',
      a.member_details?.full_name
        ?? `${a.member_details?.first_name ?? ''} ${a.member_details?.last_name ?? ''}`.trim(),
      a.member_details?.email ?? '',
      a.typeCompte ?? '',
      a.soldeActuel ?? '',
      a.statusAccount ?? '',
      a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : '',
    ]);
    const csv  = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `comptes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8 flex flex-col gap-6">

      <PageHeader
        title="Gestion des Comptes"
        subtitle="Consultez et gérez tous les comptes bancaires"
        icon={<Wallet className="w-6 h-6 text-[#2E7D32]" />}
        className="mb-0"
      />

      <AccountFilterBar
        filterValue={search}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        totalCount={filteredAccounts.length}
        onSearchChange={setSearch}
        onClear={() => setSearch('')}
        onTypeChange={setSelectedType}
        onStatusChange={handleStatusChange}
        onImport={() => console.log('Import')}
        onAdd={handleAdd}
      />

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
          <button
            onClick={loadAccounts}
            className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
          >
            Réessayer
          </button>
        </div>
      )}

      <AccountTable
        accounts={filteredAccounts}
        isLoading={loading}
        onView={handleView}
        onSuspend={handleSuspend}
        onClose={handleClose}
        onViewTransactions={handleViewTransactions}
        onBulkAction={handleBulkAction}
        activeTab={activeAccountTab}
        onTabChange={(tab: AccountStatus) => {
          setActiveAccountTab(tab);
          setSelectedStatus(tab);
        }}
      />

      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setSelectedAccount(null); }}
        account={selectedAccount}
        onSuccess={(created) => {
          setAccounts(prev => [...prev, created]);
          setShowCreateModal(false);
          setSelectedAccount(null);
        }}
      />
      <AccountDetailModal
        isOpen={showDetail}
        account={selectedAccount}
        onClose={() => setShowDetail(false)}
      />
      <AccountHistoryModal
        isOpen={showHistory}
        account={selectedAccount}
        onClose={() => { setShowHistory(false); setSelectedAccount(null); }}
      />
      <SuspendAccountModal
        isOpen={showSuspend}
        onClose={() => { setShowSuspend(false); setSelectedAccount(null); }}
        account={selectedAccount}
        onSuccess={(updated) => {
          setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
          setShowSuspend(false);
          setSelectedAccount(null);
        }}
      />
      <CloseAccountModal
        isOpen={showClose}
        account={selectedAccount}
        onClose={() => setShowClose(false)}
        onSuccess={(closed) => {
          // ← Le compte n'est PAS retiré du state : il devient juste 'fermé'
          //   et reste visible dans l'onglet "Archive" (lecture seule).
          setAccounts(prev => prev.map(a => a.id === closed.id ? closed : a));
          setShowClose(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
};

export default AccountGrid;