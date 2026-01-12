"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AccountData } from "./validationsaccount";
import { mockAccounts } from "./mockAccountData";

// UI
import AccountFilterBar from "./AccountFilterBar";

// Modals
import AccountDetailModal from "./modals/AccountDetailModal";
import CloseAccountModal from "./modals/CloseAccountModal";
import PageHeader from "../header";
import { TfiWallet } from "react-icons/tfi";

const AccountGrid: React.FC = () => {
  /* =======================
     STATES – DATA
  ======================= */
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     STATES – FILTERS
  ======================= */
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  /* =======================
     STATES – MODALS
  ======================= */
  const [selectedAccount, setSelectedAccount] =
    useState<AccountData | null>(null);

  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showClose, setShowClose] = useState(false);

  /* =======================
     LOAD MOCK DATA
  ======================= */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));
      setAccounts(mockAccounts);
      setLoading(false);
    };
    load();
  }, []);

  const header = (
    <PageHeader 
      title="Gestion des Comptes"
      subtitle="Consultez et gérez tous les comptes bancaires"
      icon={<TfiWallet className="text-4xl" />}
    />
  );

  /* =======================
     FILTER LOGIC
  ======================= */
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        acc.account_number
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        acc.member_details?.full_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchType =
        selectedType === "all" || acc.typeCompte === selectedType;

      const matchStatus =
        selectedStatus === "all" || acc.statutCompte === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [accounts, search, selectedType, selectedStatus]);

  /* =======================
     HANDLERS
  ======================= */
  const handleAdd = () => {
    setSelectedAccount(null);
    setShowEdit(true);
  };

  const handleView = (acc: AccountData) => {
    setSelectedAccount(acc);
    setShowDetail(true);
  };

  const handleCloseAccount = (acc: AccountData) => {
    setSelectedAccount(acc);
    setShowClose(true);
  };
  
  /* =======================
     GET STATUS CONFIG
  ======================= */
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'actif':
        return { 
          gradient: 'from-emerald-500 to-teal-500',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50'
        };
      case 'ferme':
        return { 
          gradient: 'from-rose-500 to-pink-500',
          textColor: 'text-rose-700',
          bgColor: 'bg-rose-50'
        };
      case 'suspendu':
        return { 
          gradient: 'from-amber-500 to-orange-500',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50'
        };
      default:
        return { 
          gradient: 'from-gray-500 to-slate-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50'
        };
    }
  };

  /* =======================
     LOADING
  ======================= */
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-green-50/30 via-white to-yellow-50/30 min-h-screen">
        {header}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-50 bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 min-h-screen">
      {header}
      
      {/* FILTER BAR */}
      <AccountFilterBar
        filterValue={search}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        totalCount={filteredAccounts.length}
        onSearchChange={setSearch}
        onClear={() => setSearch("")}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onAdd={handleAdd}
        onImport={() => console.log("IMPORT")}
        onExport={() => console.log("EXPORT")}
      />

      {/* GRID */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          Aucun compte trouvé
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => {
            const statusConfig = getStatusConfig(account.statutCompte);
            
            return (
              <div
                key={account.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* Status Indicator Bar */}
                <div className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient}`} />

                <div className="p-6">
                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {account.account_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {account.member_details?.full_name || account.id_membre}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${statusConfig.bgColor} ${statusConfig.textColor}`}
                    >
                      {account.statutCompte}
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="space-y-2.5 text-sm mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Type</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {account.typeCompte}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Solde</span>
                      <span className="font-bold text-emerald-600 text-lg">
                        {account.soldeActuel?.toLocaleString('fr-CA') || '0'} HTG
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleView(account)}
                      className="flex-1 text-sm bg-blue-500 text-white rounded-xl py-2.5 hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => handleCloseAccount(account)}
                      className="flex-1 text-sm bg-orange-500 text-white rounded-xl py-2.5 hover:bg-orange-600 active:bg-orange-700 transition-colors font-medium"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      <AccountDetailModal
        isOpen={showDetail}
        account={selectedAccount}
        onClose={() => setShowDetail(false)}
        onEdit={() => {
          setShowDetail(false);
          setShowEdit(true);
        }}
      />

      <CloseAccountModal
        isOpen={showClose}
        account={selectedAccount}
        onClose={() => setShowClose(false)}
        onSuccess={() => setShowClose(false)}
      />
    </div>
  );
};

export default AccountGrid;