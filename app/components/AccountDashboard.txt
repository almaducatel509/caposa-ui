    // app/dashboard/account/page.tsx (ou votre fichier Dashboard)
'use client';
import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import type { AccountData, MemberData } from '@/app/components/account/validationsaccount';

// ✅ Importer tous les modals
import CreateAccountModal from '@/app/components/account/CompteFormFields';
import AccountDetailModal from '@/app/components/account/modals/AccountDetailModal';
import EditAccountModal from '@/app/components/account/modals/EditAccountModal';
import DeleteAccountModal from '@/app/components/account/modals/DeleteAccountModal';
import AccountHistoryModal from '@/app/components/account/modals/AccountHistoryModal';

export default function AccountDashboard() {
  
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [accounts, setAccounts] = useState<AccountData[]>([
    // Vos comptes existants (exemple avec les données de votre screenshot)
    {
      id: '1',
      noCompte: '001-123456',
      idMembre: 'M001',
      typeCompte: 'epargne',
      soldeActuel: 2500.75,
      statutCompte: 'actif',
      dateOuverture: '2024-01-14',
      member_details: {
        id: 'M001',
        first_name: 'Marie',
        last_name: 'Dubois',
        full_name: 'Marie Dubois',
        id_number: 'M001',
        phone_number: '555-0001',
        address: '123 Rue',
        city: 'Montreal',
        department_code: 'QC',
        gender: 'F',
        date_of_birthday: '1990-01-01',
      }
    },
    // ... autres comptes
  ]);

  // Mock member pour la création (remplacer par vos vraies données)
  const currentMember: MemberData = {
    id: 'M001',
    first_name: 'Marie',
    last_name: 'Dubois',
    id_number: 'M001',
    phone_number: '555-0001',
    address: '123 Rue',
    city: 'Montreal',
    department_code: 'QC',
    gender: 'F',
    date_of_birthday: '1990-01-01',
    full_name: 'Marie Dubois',
  };

  

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Comptes</h1>
          <p className="text-gray-600">Liste et gestion de tous les comptes membres</p>
        </div>
        <div className="flex gap-2">
          <Button
            startContent={<span>🔄</span>}
            variant="bordered"
          >
            Actualiser
          </Button>
          <Button
            startContent={<span>➕</span>}
            className="bg-[#34963d] text-white"
            onPress={() => setShowCreateModal(true)}
          >
            Nouveau Compte
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">3</div>
          <div className="text-gray-600">Total Comptes</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">2</div>
          <div className="text-gray-600">Comptes Actifs</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-red-600">1</div>
          <div className="text-gray-600">Comptes Fermés</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-purple-600">$13,700.75</div>
          <div className="text-gray-600">Solde Total</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ouverture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.map(account => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{account.noCompte}</td>
                <td className="px-6 py-4">{account.typeCompte}</td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{account.member_details?.full_name}</div>
                    <div className="text-sm text-gray-500">ID: {account.idMembre}</div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-green-600">
                  ${account.soldeActuel.toLocaleString('fr-CA')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    account.statutCompte === 'actif' ? 'bg-green-100 text-green-800' :
                    account.statutCompte === 'suspendu' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {account.statutCompte}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(account.dateOuverture).toLocaleDateString('fr-CA')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailModal(account)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir détails"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => openEditModal(account)}
                      className="text-green-600 hover:text-green-800"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openHistoryModal(account)}
                      className="text-orange-600 hover:text-orange-800"
                      title="Historique"
                    >
                      🕐
                    </button>
                    <button
                      onClick={() => openDeleteModal(account)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============= MODALS ============= */}
      
      {/* Modal Création */}
      {showCreateModal && (
        <CreateAccountModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          defaultMemberId={currentMember.id}
        />
      )}

      {/* Modal Détails */}
      <AccountDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
      />

      {/* Modal Modification */}
      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAccount(null);
        }}
        onSuccess={handleUpdateSuccess}
        account={selectedAccount}
      />

      {/* Modal Suppression */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAccount(null);
        }}
        onSuccess={handleDeleteSuccess}
        account={selectedAccount}
      />

      {/* Modal Historique */}
      <AccountHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
      />
    </div>
  );
}