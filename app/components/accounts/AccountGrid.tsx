'use client';

import React, { useState, useEffect } from 'react';
import { AccountData } from "./validationsaccount";
import { mockAccounts } from "./mockAccountData";

// ✅ IMPORT DES MODALS
import AccountDetailModal from './modals/AccountDetailModal';
import EditAccountModal from './modals/EditAccountModal';
import CloseAccountModal from './modals/CloseAccountModal';

// ============= COMPONENT =============
const AccountGrid: React.FC = () => {
  // ============= STATES =============
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // ============= CHARGEMENT DES DONNÉES =============
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simule un délai d'API
        await new Promise(resolve => setTimeout(resolve, 500));
        setAccounts(mockAccounts);
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // ============= HANDLERS =============
  const handleAdd = () => {
    console.log("🆕 Créer nouveau compte");
    setSelectedAccount(null);  // null = mode CREATE
    setShowEditModal(true);
  };

  const handleView = (account: AccountData) => {
    console.log("👁️ Voir détails:", account.account_number);
    setSelectedAccount(account);
    setShowDetailModal(true);
  };

  const handleEdit = (account: AccountData) => {
    console.log("✏️ Modifier:", account.account_number);
    setSelectedAccount(account);
    setShowEditModal(true);
  };

  const handleClose = (account: AccountData) => {
    console.log("🔒 Fermer le compte:", account.account_number);
    setSelectedAccount(account);
    setShowCloseModal(true);
  };

  const handleSuccess = (updatedAccount: AccountData) => {
    console.log("✅ Succès:", updatedAccount);
    
    if (selectedAccount) {
      // MODE EDIT: Mettre à jour le compte existant
      setAccounts(prev => prev.map(a => 
        a.id === updatedAccount.id ? updatedAccount : a
      ));
    } else {
      // MODE CREATE: Ajouter le nouveau compte
      setAccounts(prev => [...prev, updatedAccount]);
    }
    
    setShowEditModal(false);
    setSelectedAccount(null);
  };

  const handleCloseSuccess = () => {
    console.log("✅ Compte fermé (soft delete)");
    
    if (selectedAccount) {
      // Mettre à jour le statut localement
      setAccounts(prev => prev.map(a => 
        a.id === selectedAccount.id 
          ? { ...a, statutCompte: 'ferme' as const, dateFermeture: new Date().toISOString().split('T')[0] }
          : a
      ));
    }
    
    setShowCloseModal(false);
    setShowDetailModal(false);
    setSelectedAccount(null);
  };

  // ============= LOADING =============
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement des comptes...</p>
        </div>
      </div>
    );
  }

  // ============= RENDER =============
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comptes Bancaires</h1>
          <p className="text-gray-600 mt-1">{accounts.length} compte(s) total</p>
        </div>
        
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          ➕ Ajouter un Compte
        </button>
      </div>

      {/* GRID DE CARDS */}
      {accounts.length === 0 ? (
        // État vide
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucun compte
          </h3>
          <p className="text-gray-500 mb-6">
            Commencez par ajouter votre premier compte
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            ➕ Ajouter un Compte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header Card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {account.account_number}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {account.member_details?.full_name || 
                     `${account.member_details?.first_name || ''} ${account.member_details?.last_name || ''}`.trim() ||
                     account.id_membre}
                  </p>
                </div>
                
                {/* Badge Statut */}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  account.statutCompte === 'actif' 
                    ? 'bg-green-100 text-green-800'
                    : account.statutCompte === 'suspendu'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {account.statutCompte?.toUpperCase() || 'INCONNU'}
                </span>
              </div>

              {/* Infos Compte */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {account.typeCompte}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Solde:</span>
                  <span className="text-lg font-bold text-green-600">
                    {account.soldeActuel?.toLocaleString() || '0'} HTG
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ouverture:</span>
                  <span className="text-sm text-gray-900">
                    {account.dateOuverture 
                      ? new Date(account.dateOuverture).toLocaleDateString('fr-CA')
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>

              {/* Boutons Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleView(account)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                >
                  👁️ Voir
                </button>
                
                <button
                  onClick={() => handleEdit(account)}
                  className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors"
                >
                  ✏️ Modifier
                </button>
                
                <button
                  onClick={() => handleClose(account)}
                  className="flex-1 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium transition-colors"
                  title="Fermer le compte"
                >
                  🔒 Fermer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============= MODALS ============= */}
      
      {/* Modal Détails */}
      <AccountDetailModal
        isOpen={showDetailModal}           // true = ouvert, false = fermé
        account={selectedAccount}          // peut être null sans problème
        onClose={() => {
          setShowDetailModal(false);       // on ferme le modal
          setSelectedAccount(null);        // on nettoie la sélection
        }}
        onEdit={() => {
          setShowDetailModal(false);       // fermer le détail
          setShowEditModal(true);          // ouvrir l’édition
        }}
      />

      {/* Modal Create/Edit */}
     <EditAccountModal
        isOpen={showEditModal}             // contrôle l’affichage
        account={selectedAccount}          // null = création
        onClose={() => {
          setShowEditModal(false);
          setSelectedAccount(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Modal Fermeture de compte */}
        <CloseAccountModal
          isOpen={showCloseModal}
          onClose={() => {
            setShowCloseModal(false);
            setSelectedAccount(null);
          }}
          account={selectedAccount}
          onSuccess={handleCloseSuccess}
        />
    </div>
  );
};

export default AccountGrid;