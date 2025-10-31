// app/components/account/modals/AccountDetailModal.tsx
'use client';
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from "@nextui-org/react";
import type { AccountData } from "../validationsaccount";
import { 
  getAccountTypeName, 
  getAccountStatusDisplay,
  formatAccountNumberMasked 
} from "../validationsaccount";

interface AccountDetailModalProps {
  isOpen: boolean;
  onEdit:() => void;
  onClose: () => void;
  account: AccountData | null;
}

export default function AccountDetailModal({ 
  onEdit,
  isOpen, 
  onClose, 
  account 
}: AccountDetailModalProps) {
  
  if (!account) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'success';
      case 'suspendu': return 'warning';
      case 'ferme': return 'danger';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'epargne': return 'primary';
      case 'cheques': return 'secondary';
      case 'terme': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Détails du compte</h2>
                <Chip 
                  color={getStatusColor(account.statutCompte)}
                  variant="flat"
                  size="lg"
                >
                  {getAccountStatusDisplay(account.statutCompte)}
                </Chip>
              </div>
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-6">
                {/* Section Informations générales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    📋 Informations générales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem 
                      label="Numéro de compte" 
                      value={account.noCompte}
                      highlight
                    />
                    <DetailItem 
                      label="Type de compte" 
                      value={
                        <Chip color={getTypeColor(account.typeCompte)} variant="flat">
                          {getAccountTypeName(account.typeCompte)}
                        </Chip>
                      }
                    />
                    <DetailItem 
                      label="Date d'ouverture" 
                      value={new Date(account.dateOuverture).toLocaleDateString('fr-CA')}
                    />
                    {account.dateFermeture && (
                      <DetailItem 
                        label="Date de fermeture" 
                        value={new Date(account.dateFermeture).toLocaleDateString('fr-CA')}
                      />
                    )}
                  </div>
                </div>

                {/* Section Informations financières */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    💰 Informations financières
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem 
                      label="Solde actuel" 
                      value={`${account.soldeActuel.toLocaleString('fr-CA')} $`}
                      highlight
                      className="text-xl font-bold text-green-600"
                    />
                    {account.tauxInteret !== null && account.tauxInteret !== undefined && (
                      <DetailItem 
                        label="Taux d'intérêt" 
                        value={`${account.tauxInteret}%`}
                      />
                    )}
                    {account.limiteTrait !== null && account.limiteTrait !== undefined && (
                      <DetailItem 
                        label="Limite de retrait" 
                        value={`${account.limiteTrait.toLocaleString('fr-CA')} $`}
                      />
                    )}
                    {account.fraisServiceMensuel !== null && account.fraisServiceMensuel !== undefined && (
                      <DetailItem 
                        label="Frais mensuels" 
                        value={`${account.fraisServiceMensuel.toLocaleString('fr-CA')} $`}
                      />
                    )}
                  </div>
                </div>

                {/* Section Membre */}
                {account.member_details && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      👤 Informations du membre
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem 
                        label="Nom complet" 
                        value={account.member_details.full_name || `${account.member_details.first_name} ${account.member_details.last_name}`}
                      />
                      <DetailItem 
                        label="Numéro d'identification" 
                        value={account.member_details.id_number}
                      />
                      <DetailItem 
                        label="Téléphone" 
                        value={account.member_details.phone_number}
                      />
                      {account.member_details.email && (
                        <DetailItem 
                          label="Email" 
                          value={account.member_details.email}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Section Statistiques */}
                {(account.total_transactions || account.total_deposits || account.total_withdrawals) && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      📊 Statistiques
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {account.total_transactions !== undefined && (
                        <DetailItem 
                          label="Total transactions" 
                          value={account.total_transactions}
                        />
                      )}
                      {account.total_deposits !== undefined && (
                        <DetailItem 
                          label="Total dépôts" 
                          value={`${account.total_deposits.toLocaleString('fr-CA')} $`}
                          className="text-green-600"
                        />
                      )}
                      {account.total_withdrawals !== undefined && (
                        <DetailItem 
                          label="Total retraits" 
                          value={`${account.total_withdrawals.toLocaleString('fr-CA')} $`}
                          className="text-red-600"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Section Métadonnées */}
                <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
                  <p>ID: {account.id}</p>
                  {account.created_at && (
                    <p>Créé le: {new Date(account.created_at).toLocaleString('fr-CA')}</p>
                  )}
                  {account.updated_at && (
                    <p>Modifié le: {new Date(account.updated_at).toLocaleString('fr-CA')}</p>
                  )}
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Fermer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// Composant helper pour afficher un item de détail
function DetailItem({ 
  label, 
  value, 
  highlight = false,
  className = ""
}: { 
  label: string; 
  value: React.ReactNode; 
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={highlight ? "col-span-2" : ""}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`font-semibold ${className}`}>
        {value}
      </p>
    </div>
  );
}