'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import { AccountData, AccountStatus } from './validationsaccount';
import { fetchAccounts } from '@/app/lib/api/accounts';
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

import CreateAccountModal from './modals/CreateAccountModal';
import EditAccountModal   from './modals/EditAccountModal';
// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// 1. Statuts alignés sur l'enum officiel : 'actif' | 'gele' | 'ferme' |
//    'en_attente' | 'archive' (5 valeurs, plus de boolean).
//
// 2. Le filtre statut est SUPPRIMÉ. Les onglets du tableau s'en occupent.
//    → AccountFilterBar reçoit uniquement recherche + type.
//
// 3. Onglets UI = 3 (Ouverts / Gelés / Archive) :
//    - 'ouvert'  → actif + en_attente
//    - 'gele'    → gele
//    - 'archive' → ferme + archive
//
// 4. Garde-fous : un compte fermé/archivé ne peut PAS être :
//    - gelé (handleSuspend bloqué)
//    - fermé une 2e fois (handleClose bloqué)
//    Le helper `canActOn()` centralise la règle "compte vivant".
// ─────────────────────────────────────────────────────────────────────────────

// Type d'onglet (3 valeurs UI)
type TabId = 'ouvert' | 'gele' | 'archive';

// Helper : un compte est "vivant" si on peut encore agir dessus
function canActOn(a: AccountData): boolean {
  return a.account_status !== 'ferme' && a.account_status !== 'archive';
}

const AccountGrid: React.FC = () => {

  // ── Data ──
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── Filters (recherche + type uniquement) ──
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType,    setSelectedType]    = useState('all');

  // ── Tab actif (géré par AccountTable) ──
  const [activeAccountTab, setActiveAccountTab] = useState<TabId>('ouvert');

  // ── Modals ──
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [showDetail,      setShowDetail]      = useState(false);
  const [showClose,       setShowClose]       = useState(false);
  const [showSuspend,     setShowSuspend]     = useState(false);
  const [showHistory,     setShowHistory]     = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);  
  // ── Load ───────────────────────────────────────────────────────────────────
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await fetchAccounts();
      setAccounts(data);
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

  // ── Filtrage : recherche + type seulement (le statut = onglets du tableau)
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchSearch =
        !debouncedSearch ||
        acc.account_number?.toLowerCase().includes(debouncedSearch) ||
        acc.member_details?.full_name?.toLowerCase().includes(debouncedSearch) ||
        acc.member_details?.email?.toLowerCase().includes(debouncedSearch);

      const matchType =
        selectedType === 'all' || acc.typeCompte === selectedType;

      return matchSearch && matchType;
    });
  }, [accounts, debouncedSearch, selectedType]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd = () => {
    setSelectedAccount(null);
    setShowCreateModal(true);
  };
  const handleEdit = (a: AccountData) => {
    if (!canActOn(a)) {
      console.warn('Action ignorée : compte fermé/archivé non modifiable.');
      return;
    }
    setSelectedAccount(a);
    setShowEditModal(true);
  };
  // Lecture : toujours autorisée
  const handleView             = (a: AccountData) => { setSelectedAccount(a); setShowDetail(true); };
  const handleViewTransactions = (a: AccountData) => { setSelectedAccount(a); setShowHistory(true); };

  // Actions métier : bloquées si compte fermé/archivé
  const handleSuspend = (a: AccountData) => {
    if (!canActOn(a)) {
      console.warn('Action ignorée : un compte fermé/archivé ne peut pas être gelé.');
      return;
    }
    setSelectedAccount(a);
    setShowSuspend(true);
  };

  const handleClose = (a: AccountData) => {
    if (!canActOn(a)) {
      console.warn('Action ignorée : un compte fermé/archivé ne peut pas être refermé.');
      return;
    }
    setSelectedAccount(a);
    setShowClose(true);
  };

  // ── Bulk action ────────────────────────────────────────────────────────────
  const handleBulkAction = async (action: AccountBulkAction, ids: string[]) => {
    // Export : autorisé pour tous les comptes
    if (action === 'export') {
      exportToCSV(ids);
      return;
    }

    // Autres actions : retirer les comptes fermés/archivés
    const actionableIds = accounts
      .filter(a => ids.includes(a.id) && canActOn(a))
      .map(a => a.id);

    const skipped = ids.length - actionableIds.length;
    if (skipped > 0) {
      console.warn(`${skipped} compte(s) fermé(s)/archivé(s) ignoré(s) pour l'action "${action}".`);
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
      a.account_status ?? '',
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

  // ── Liste des membres (extraite des comptes pour l'export) ────────────────
  const members = useMemo(() => {
    const map = new Map();
    accounts.forEach(a => {
      if (a.member_details) map.set(a.member_details.id, a.member_details);
    });
    return Array.from(map.values());
  }, [accounts]);

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
        totalCount={filteredAccounts.length}
        onSearchChange={setSearch}
        onClear={() => setSearch('')}
        onTypeChange={setSelectedType}
        onImport={() => console.log('Import')}
        onAdd={handleAdd}
        members={members}
        accounts={accounts}
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
        onTabChange={setActiveAccountTab}
      />
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(created) => {
          setAccounts(prev => [...prev, created]);
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
          // Le compte n'est PAS retiré : il passe en 'ferme' / 'archive'
          // et reste visible dans l'onglet "Archive" (lecture seule).
          setAccounts(prev => prev.map(a => a.id === closed.id ? closed : a));
          setShowClose(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
};

export default AccountGrid;