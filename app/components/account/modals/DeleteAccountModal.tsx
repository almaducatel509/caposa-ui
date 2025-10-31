// app/components/account/modals/DeleteAccountModal.tsx
'use client';
import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from "@nextui-org/react";
import type { AccountData } from "../validationsaccount";
import { canCloseAccount } from "../validationsaccount";
import { deleteAccount } from "@/app/lib/api/accounts";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accountId: string) => void;
  account: AccountData | null;
}

export default function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  account 
}: DeleteAccountModalProps) {
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!account) return;

    // Vérifier si le compte peut être fermé
    const { canClose, reason } = canCloseAccount(account);
    if (!canClose) {
      setApiError(reason || "Ce compte ne peut pas être fermé");
      return;
    }

    setApiError(null);
    setIsDeleting(true);
    
    try {
      await deleteAccount(account.id);
      onSuccess(account.id);
      onClose();
    } catch (e: any) {
      setApiError(e?.message || "Erreur lors de la suppression du compte");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!account) return null;

  const { canClose, reason } = canCloseAccount(account);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-red-600">
                ⚠️ Supprimer le compte
              </h2>
              <p className="text-sm text-gray-600 font-normal">
                Cette action est irréversible
              </p>
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-4">
                {apiError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {apiError}
                  </div>
                )}

                {!canClose && reason && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                    <p className="font-semibold">❌ Ce compte ne peut pas être fermé :</p>
                    <p className="mt-2">{reason}</p>
                  </div>
                )}

                {canClose && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 mb-4">
                      Êtes-vous sûr de vouloir <strong className="text-red-600">fermer définitivement</strong> ce compte ?
                    </p>
                    
                    <div className="space-y-3 bg-white p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Numéro de compte:</span>
                        <span className="font-bold">{account.noCompte}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type:</span>
                        <Chip color="primary" variant="flat" size="sm">
                          {account.typeCompte}
                        </Chip>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Solde actuel:</span>
                        <span className="font-bold text-green-600">
                          {account.soldeActuel.toLocaleString('fr-CA')} $
                        </span>
                      </div>
                      
                      {account.member_details && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Membre:</span>
                          <span className="font-semibold">
                            {account.member_details.full_name || 
                             `${account.member_details.first_name} ${account.member_details.last_name}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <strong>⚠️ Attention :</strong> Une fois fermé, le compte ne pourra plus être réactivé. 
                        Toutes les données seront conservées pour l'historique, mais le compte sera marqué comme fermé.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                color="default" 
                variant="light" 
                onPress={onClose}
              >
                Annuler
              </Button>
              <Button 
                color="danger" 
                onPress={handleDelete}
                isLoading={isDeleting}
                isDisabled={!canClose}
              >
                {canClose ? "Oui, fermer le compte" : "Impossible de fermer"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}