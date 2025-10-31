'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@nextui-org/react";
import { FaUsers } from 'react-icons/fa6';
import { fetchMembers } from "@/app/lib/api/accounts";
import { AccountData, MemberData } from "./validationsaccount";
import { mockAccounts } from "./mockAccountData";
import AccountFilterBar from "./AccountFilterBar";
import AccountCard from "./AccountCard";

// ✅ IMPORT DES MODALS (Comme EmployeeGrid)
import AccountDetailModal from './modals/AccountDetailModal';
import EditAccountModal from './modals/EditAccountModal';
import DeleteAccountModal from './modals/DeleteAccountModal';

// ============= TYPES =============
interface AccountGridProps {
  accounts?: AccountData[];
  onSuccess?: () => void;
}

// ============= COMPONENT =============
const AccountGrid: React.FC<AccountGridProps> = ({ 
  accounts: initialAccounts, 
  onSuccess: parentOnSuccess 
}) => {
  // ============= STATES =============
  // Data states
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   
  // Filter states
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(filterValue);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states (Comme EmployeeGrid)
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ============= DEBOUNCING =============
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(filterValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterValue]);

  // ============= DATA LOADING =============
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simule un délai d'API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock pour accounts, API pour members
      setAccounts(mockAccounts);
      const membersData = await fetchMembers();
      setMembers(membersData);

    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de charger les comptes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============= INITIAL LOAD =============
  useEffect(() => {
    if (initialAccounts && initialAccounts.length > 0) {
      setAccounts(initialAccounts);
      setIsLoading(false);
      setError(null);
    } else {
      loadAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAccounts]);  // ✅ FIXÉ: Retire loadAccounts des dépendances

  // ============= FILTERING =============
  const filteredAccounts = useMemo(() => {
    let filtered = accounts;

    // Search filter
    if (debouncedValue) {
      const lowercased = debouncedValue.toLowerCase();
      filtered = filtered.filter((account) =>
        account.noCompte?.toLowerCase().includes(lowercased) ||
        account.member_name?.toLowerCase().includes(lowercased) ||
        account.idMembre?.toLowerCase().includes(lowercased)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(account => account.typeCompte === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(account => account.statutCompte === selectedStatus);
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [accounts, debouncedValue, selectedType, selectedStatus]);

  // ============= HANDLERS (Exactement comme EmployeeGrid) =============
  const handleAdd = useCallback(() => {
    console.log("🆕 Creating new account"); 
    setSelectedAccount(null);  // ← null = mode CREATE
    setShowEditModal(true);    // ← EditModal gère CREATE et EDIT
    console.log("📋 Modal state:", { 
      showEditModal: true, 
      selectedAccount: null, 
      isEditMode: false 
    });
  }, []);

  const handleView = useCallback((account: AccountData) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
  }, []);

  const handleEdit = useCallback((account: AccountData) => {
    console.log('🔍 handleEdit appelé:', {
      account: account?.noCompte,
      accountId: account?.id
    });
    setSelectedAccount(account);
    setShowEditModal(true);
    console.log('🔍 États après:', {
      selectedAccount: account?.noCompte,
      isEditMode: true
    });
  }, []);

  const handleDelete = useCallback((account: AccountData) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
  }, []);

  const handleViewTransactions = useCallback((account: AccountData) => {
    console.log('Afficher transactions pour:', account.noCompte);
    alert(`Transactions pour le compte ${account.noCompte} (à implémenter)`);
  }, []);

  const handleDeleteSuccess = useCallback((deletedId?: string) => {
    if (deletedId) {
      setAccounts(prev => prev.filter(a => a.id !== deletedId));
      if (selectedAccount?.id === deletedId) {
        setSelectedAccount(null);
        setShowDetailModal(false);
      }
    } else {
      loadAccounts();
      setShowDetailModal(false);
    }
    setShowDeleteModal(false);
  }, [selectedAccount, loadAccounts]);

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
    setSelectedType('all');
    setSelectedStatus('all');
  }, []);

  const handleExport = useCallback(() => {
    try {
      const csvContent = [
        'No Compte,Membre,Type,Statut,Solde,Date Ouverture',
        ...filteredAccounts.map(acc =>
          `"${acc.noCompte}","${acc.member_name || acc.idMembre}","${acc.typeCompte}","${acc.statutCompte}","${acc.soldeActuel}","${acc.dateOuverture}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `accounts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export échoué:', error);
      setError('Impossible d\'exporter les données');
    }
  }, [filteredAccounts]);

  // ============= LOADING STATE =============
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#34963d] mx-auto mb-4"></div>
          <p className="text-[#2c2e2f] font-medium">Chargement des comptes...</p>
        </div>
      </div>
    );
  }

  // ============= RENDER =============
  return (
    <div className="flex flex-col gap-4 px-6 py-4 w-full bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Gestion d'erreurs */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
          <Button 
            size="sm" 
            onClick={loadAccounts} 
            className="mt-2 bg-red-600 text-white hover:bg-red-700"
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Barre de filtres */}
      <AccountFilterBar
        search={filterValue}
        type={selectedType}
        status={selectedStatus}
        onSearchChange={onSearchChange}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onAdd={handleAdd}
        onRefresh={() => loadAccounts()}
        onExport={handleExport}
        onClear={onClear}
        totalCount={filteredAccounts.length}
      />

      {/* Compteur */}
      <div className="text-sm text-[#2c2e2f]/70">
        {filteredAccounts.length} Compte(s) trouvé(s)
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredAccounts.length > 0 ? (
          filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}  
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewTransactions={handleViewTransactions}  
            />
          ))
        ) : (
          // État vide
          <div className="col-span-full text-center py-12">
            <div className="text-8xl mb-4 text-gray-300 flex justify-center">
              <FaUsers />
            </div>
            <h3 className="text-xl font-semibold text-[#2c2e2f] mb-2">
              {filterValue ? "Aucun compte trouvé" : "Aucun compte"}  
            </h3>
            <p className="text-[#2c2e2f]/70 mb-4">
              {filterValue 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre premier compte"  
              }
            </p>
            {filterValue ? (
              <Button 
                onPress={onClear} 
                variant="light" 
                className="text-[#34963d] hover:bg-green-50"
              >
                Effacer les filtres
              </Button>
            ) : (
              <Button 
                onPress={handleAdd} 
                className="bg-[#34963d] text-white hover:bg-green-700"
              >
                Ajouter un compte
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ============= MODALS (Exactement comme EmployeeGrid) ============= */}
      
      {/* Modal Détails */}
      {selectedAccount && showDetailModal && (
        <AccountDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          account={selectedAccount}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      {/* Modal Edit/Create (UN SEUL MODAL pour les deux modes) */}
      {showEditModal && (
        <EditAccountModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          account={selectedAccount}  // ← null = CREATE, objet = EDIT
          onSuccess={(updated) => {
            // Rafraîchir la liste + le détail
            if (selectedAccount) {
              // Mode EDIT: mettre à jour
              setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
            } else {
              // Mode CREATE: ajouter
              setAccounts(prev => [...prev, updated]);
            }
            setSelectedAccount(updated);
            setShowEditModal(false);
          }}
        />
      )}

      {/* Modal Suppression */}
      {showDeleteModal && selectedAccount && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          account={selectedAccount}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default AccountGrid;