"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AccountData } from "./validationsaccount";
import { mockAccounts } from "./mockAccountData";

// UI
import AccountFilterBar from "./AccountFilterBar";

// Modals
import AccountDetailModal from "./modals/AccountDetailModal";
import EditAccountModal from "./modals/EditAccountModal";
import CloseAccountModal from "./modals/CloseAccountModal";
import { FaBriefcase, FaUsers, FaWallet } from "react-icons/fa";
import PageHeader from "../header";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/react";
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
      icon={<TfiWallet  className="text-4xl 0" />}
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

  const handleEdit = (acc: AccountData) => {
    setSelectedAccount(acc);
    setShowEdit(true);
  };

  const handleCloseAccount = (acc: AccountData) => {
    setSelectedAccount(acc);
    setShowClose(true);
  };

  /* =======================
     LOADING        
     <div className="animate-spin h-12 w-12 rounded-full border-b-4 border-emerald-600" />

  ======================= */
 if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 bg-linear-to-br from-green-50/30 via-white to-yellow-50/30 min-h-screen">
              {header}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-50 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardBody className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* =======================
     RENDER
  ======================= */
  return (
 <div className="flex flex-col gap-6 p-6 bg-linear-to-br from-purple-50/30 via-white to-pink-50/30 min-h-screen">
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
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-white p-6 rounded-xl shadow border"
            >
              {/* HEADER */}
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">
                    {account.account_number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {account.member_details?.full_name ||
                      account.id_membre}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    account.statutCompte === "actif"
                      ? "bg-green-100 text-green-700"
                      : account.statutCompte === "suspendu"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {account.statutCompte}
                </span>
              </div>

              {/* INFO */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-semibold capitalize">
                    {account.typeCompte}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Solde</span>
                  <span className="font-bold text-emerald-600">
                    {account.soldeActuel} HTG
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleView(account)}
                  className="flex-1 text-sm bg-blue-50 text-blue-700 rounded-lg py-2"
                >
                  Voir
                </button>
                <button
                  onClick={() => handleEdit(account)}
                  className="flex-1 text-sm bg-green-50 text-green-700 rounded-lg py-2"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleCloseAccount(account)}
                  className="flex-1 text-sm bg-orange-50 text-orange-700 rounded-lg py-2"
                >
                  Fermer
                </button>
              </div>
            </div>
          ))}
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

      <EditAccountModal
        isOpen={showEdit}
        account={selectedAccount}
        onClose={() => setShowEdit(false)}
        onSuccess={(acc) => {
          setAccounts((prev) =>
            prev.some((a) => a.id === acc.id)
              ? prev.map((a) => (a.id === acc.id ? acc : a))
              : [...prev, acc]
          );
          setShowEdit(false);
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
