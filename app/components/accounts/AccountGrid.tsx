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
import CreateAccountModal from './modals/EditAccountModal'; // ← nom du fichier reste pareil

// ─── TODO: remplacer mockAccounts par un vrai appel API ───────────────────────
// import { fetchAccounts } from '@/app/lib/api/accounts';
// ─────────────────────────────────────────────────────────────────────────────

const AccountGrid: React.FC = () => {

  // ── Data ──
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── Filters ──
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType,    setSelectedType]    = useState('all');
  const [selectedStatus,  setSelectedStatus]  = useState('all');

  // ── Modals ──
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [showDetail,      setShowDetail]      = useState(false);
  const [showClose,       setShowClose]       = useState(false);
  const [showSuspend,     setShowSuspend]     = useState(false);
  const [showHistory,     setShowHistory]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // était showEditModal

  // ── Tab ──
  const [activeAccountTab, setActiveAccountTab] = useState<'ouvert' | 'gelé' | 'en_attente' | 'fermé'>('ouvert');

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

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchSearch =
        !debouncedSearch ||
        acc.account_number?.toLowerCase().includes(debouncedSearch) ||
        acc.member_details?.full_name?.toLowerCase().includes(debouncedSearch) ||
        acc.member_details?.email?.toLowerCase().includes(debouncedSearch);

      const matchType = selectedType === 'all' || acc.typeCompte === selectedType;

      // effectiveStatus = valeur normalisée du compte
      const effectiveStatus = (acc as any).statusAccount ?? acc.statutCompte;

      // ← clés alignées avec AccountFilterBar : 'ouvert' | 'suspendu' | 'ferme'
      const matchStatus =
        selectedStatus === 'all'                                              ||
        effectiveStatus === selectedStatus                                    ||
        (selectedStatus === 'ouvert'   && effectiveStatus === 'actif')       ||
        (selectedStatus === 'ferme'    && effectiveStatus === 'fermé')       ||
        (selectedStatus === 'suspendu' && effectiveStatus === 'gelé');       // ← suspendu → gelé

      return matchSearch && matchType && matchStatus;
    });
  }, [accounts, debouncedSearch, selectedType, selectedStatus]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAdd = () => {
    setSelectedAccount(null);
    setShowCreateModal(true); // était setShowEditModal
  };
  const handleView   = (a: AccountData) => { setSelectedAccount(a); setShowDetail(true); };
  const handleSuspend= (a: AccountData) => { setSelectedAccount(a); setShowSuspend(true); };
  const handleClose  = (a: AccountData) => { setSelectedAccount(a); setShowClose(true); };
  const handleDelete = (a: AccountData) => { setSelectedAccount(a); setShowDeleteModal(true); };
  const handleViewTransactions = (a: AccountData) => { setSelectedAccount(a); setShowHistory(true); };

  // ← dropdown envoie 'ouvert' | 'suspendu' | 'ferme' — tout aligné
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if      (status === 'ferme' || status === 'fermé') setActiveAccountTab('fermé');
    else if (status === 'suspendu' || status === 'gelé') setActiveAccountTab('gelé');
    else if (status === 'en_attente') setActiveAccountTab('en_attente');
    else    setActiveAccountTab('ouvert');
  };

  // ── Bulk action ────────────────────────────────────────────────────────────
  const handleBulkAction = async (action: AccountBulkAction, ids: string[]) => {
    switch (action) {
      case 'activate':
        console.log('Débloquer comptes:', ids);
        break;
      case 'suspend':
        console.log('Geler comptes:', ids);
        break;
      case 'close':
        console.log('Fermer comptes:', ids);
        break;
      case 'export':
        exportToCSV(ids);
        return;
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
          <button onClick={loadAccounts}
            className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
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
        onDelete={handleDelete}
        onViewTransactions={handleViewTransactions}
        onBulkAction={handleBulkAction}
        activeTab={activeAccountTab}
        // ← onglet → dropdown : clés alignées avec AccountFilterBar
        onTabChange={(tab) => {
          setActiveAccountTab(tab);
          setSelectedStatus(
            tab === 'gelé'       ? 'suspendu' :
            tab === 'fermé'      ? 'ferme'    :
            tab === 'en_attente' ? 'en_attente': 'ouvert'
          );
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
        onSuccess={() => {
          setAccounts(prev => prev.filter(a => a.id !== selectedAccount?.id));
          setShowClose(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
};

export default AccountGrid;