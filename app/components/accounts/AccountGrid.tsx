'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import { AccountData } from './validationsaccount';
import { mockAccounts } from './mockAccountData';

// UI
import PageHeader        from '@/app/components/header';
import AccountFilterBar  from './AccountFilterBar';
import AccountTable      from './AccountTable';           // ← remplace la grille de cartes

// Modals
import AccountDetailModal  from './modals/AccountDetailModal';
import CloseAccountModal   from './modals/CloseAccountModal';
import SuspendAccountModal from './modals/SuspendAccountModal';

const AccountGrid: React.FC = () => {

  // ── Data ──
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading,  setLoading]  = useState(true);

  // ── Filters ──
  const [search,         setSearch]         = useState('');
  const [debouncedSearch,setDebouncedSearch] = useState('');
  const [selectedType,   setSelectedType]   = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // ── Modals ──
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [showDetail,      setShowDetail]      = useState(false);
  const [showClose,       setShowClose]       = useState(false);
  const [showSuspend,     setShowSuspend]     = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));   // remplacer par fetchAccounts()
      setAccounts(mockAccounts);
      setLoading(false);
    };
    load();
  }, []);

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

      // Le filtre statut 'suspendu' est géré par AccountTable via forceSuspended
      // Ici on filtre seulement actif/ferme — suspendu = on passe tout
      const matchStatus =
        selectedStatus === 'all' ||
        selectedStatus === 'suspendu' ||   // ← laisse passer, AccountTable gère
        acc.statutCompte === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [accounts, debouncedSearch, selectedType, selectedStatus]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleView    = (a: AccountData) => { setSelectedAccount(a); setShowDetail(true); };
  const handleSuspend = (a: AccountData) => { setSelectedAccount(a); setShowSuspend(true); };
  const handleClose   = (a: AccountData) => { setSelectedAccount(a); setShowClose(true); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      <PageHeader
        title="Gestion des Comptes"
        subtitle="Consultez et gérez tous les comptes bancaires"
        icon={<Wallet className="w-8 h-8 text-[#2E7D32]" />}
      />

      <AccountFilterBar
        filterValue={search}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        totalCount={filteredAccounts.length}
        onSearchChange={setSearch}
        onClear={() => setSearch('')}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onImport={() => console.log('Import')}
        onExport={() => console.log('Export')}
      />

      {/* ── Table (remplace la grille de cartes) ── */}
      <AccountTable
        accounts={filteredAccounts}
        isLoading={loading}
        onView={handleView}
        onSuspend={handleSuspend}
        onClose={handleClose}
        forceSuspended={selectedStatus === 'suspendu'}
      />

      {/* Modals — inchangés */}
      <AccountDetailModal
        isOpen={showDetail}
        account={selectedAccount}
        onClose={() => setShowDetail(false)}
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