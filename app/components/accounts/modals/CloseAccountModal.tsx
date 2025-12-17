'use client';
import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Input } from "@heroui/react";
import type { AccountData } from "../validationsaccount";
import { updateAccount } from "@/app/lib/api/accounts";

interface CloseAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  //account: AccountData; avant 
  onSuccess: () => void;
    account: AccountData | null; //apres
}

export default function CloseAccountModal({ 
  isOpen, 
  onClose, 
  account,
  onSuccess 
}: CloseAccountModalProps) {
  
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closureDate, setClosureDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // ============= VALIDATIONS MÉTIER =============
  const solde = account?.soldeActuel || parseFloat(account?.balance || '0');
  const isAlreadyClosed = account?.statutCompte === 'ferme';
  
  // Règle 1: Le solde DOIT être à zéro
  const canClose = solde === 0 && !isAlreadyClosed;
  
  // Messages d'erreur contextuels
  const getBlockingReason = () => {
    if (isAlreadyClosed) {
      return "Ce compte est déjà fermé.";
    }
    if (solde !== 0) {
      return `Le compte a un solde de ${solde.toLocaleString('fr-CA')} HTG. Le solde doit être exactement à 0 HTG avant la fermeture.`;
    }
    return null;
  };

  const blockingReason = getBlockingReason();

  // ============= HANDLER DE FERMETURE =============
  const handleClose = async () => {
    if (!canClose) {
      setError(blockingReason || "Impossible de fermer ce compte.");
      return;
    }

    // Validation de la date
    const openingDate = new Date(account?.dateOuverture || account?.created_at || '');
    const closeDate = new Date(closureDate);
    
    if (closeDate < openingDate) {
      setError("La date de fermeture ne peut pas être antérieure à la date d'ouverture.");
      return;
    }

    setIsClosing(true);
    setError(null);

    try {
      // ⬇️ SOFT DELETE: On met à jour le statut au lieu de supprimer
      // await updateAccount(account?.id, {
      //   statutCompte: 'ferme',
      //   dateFermeture: closureDate,
      // });
await updateAccount(account!.id, {
  statutCompte: 'ferme',
  dateFermeture: closureDate,
});

      console.log("✅ Compte fermé (soft delete):", {
        id: account?.id,
        account_number: account?.account_number,
        dateFermeture: closureDate,
        reason: reason || 'Non spécifié'
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("❌ Erreur fermeture:", err);
      setError(err.message || "Erreur lors de la fermeture du compte.");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      isDismissable={!isClosing}
      hideCloseButton={isClosing}
      backdrop="opaque"
      classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
      radius="lg"

    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-orange-600">
                🔒 Fermer le compte
              </h2>
              <p className="text-sm text-gray-600 font-normal">
                Fermeture logique - Les données seront conservées pour la traçabilité
              </p>
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-4">
                {/* Avertissement principal */}
                <div className={`p-4 rounded-lg border-2 ${
                  canClose 
                    ? 'bg-yellow-50 border-yellow-300' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <p className={`font-semibold mb-2 ${
                    canClose ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {canClose 
                      ? '⚠️ Fermeture de compte' 
                      : '❌ Fermeture impossible'
                    }
                  </p>
                  <p className={canClose ? 'text-yellow-700' : 'text-red-700'}>
                    {blockingReason || 
                      'Le compte sera marqué comme fermé. Aucune nouvelle transaction ne sera possible, mais l\'historique sera conservé.'
                    }
                  </p>
                </div>

                {/* Info légale */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                  <p className="text-blue-800 text-sm">
                    <strong>ℹ️ Note importante :</strong> Conformément aux réglementations bancaires, 
                    les données du compte seront conservées à des fins de traçabilité et d'audit. 
                    Le compte restera consultable mais ne pourra plus être utilisé.
                  </p>
                </div>

                {/* Détails du compte */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-gray-800">
                    📋 Détails du compte :
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Numéro :</span>
                      <span className="font-semibold">{account?.account_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Titulaire :</span>
                      <span className="font-semibold">
                        {account?.member_details?.full_name || 
                         `${account?.member_details?.first_name || ''} ${account?.member_details?.last_name || ''}`.trim() ||
                         account?.id_membre
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type :</span>
                      <span className="font-semibold capitalize">{account?.typeCompte}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Solde actuel :</span>
                      <span className={`font-bold ${solde === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {solde.toLocaleString('fr-CA')} HTG
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ouvert le :</span>
                      <span className="font-semibold">
                        {account?.dateOuverture 
                          ? new Date(account.dateOuverture).toLocaleDateString('fr-CA')
                          : new Date(account?.created_at || '').toLocaleDateString('fr-CA')
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut actuel :</span>
                      <Chip 
                        size="sm"
                        color={
                          account?.statutCompte === 'actif' ? 'success' :
                          account?.statutCompte === 'suspendu' ? 'warning' : 'danger'
                        }
                        variant="flat"
                      >
                        {account?.statutCompte?.toUpperCase() || 'INCONNU'}
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Formulaire de fermeture (uniquement si possible) */}
                {canClose && (
                  <div className="space-y-3">
                    <Input
                      type="date"
                      label="Date de fermeture"
                      value={closureDate}
                      onChange={(e) => setClosureDate(e.target.value)}
                      min={account?.dateOuverture || account?.created_at?.split('T')[0]}
                      max={new Date().toISOString().split('T')[0]}
                      isRequired
                      description="La date ne peut pas être antérieure à la date d'ouverture"
                    />
                    
                    <Input
                      label="Raison de la fermeture (optionnel)"
                      placeholder="Ex: Demande du client, Migration vers autre compte..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                )}

                {/* Message d'erreur */}
                {error && (
                  <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                    <p className="text-red-800 font-semibold">❌ Erreur</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                )}

                {/* Instructions si solde non nul */}
                {!canClose && solde !== 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                    <p className="text-blue-800 font-semibold mb-2">
                      📝 Étapes à suivre :
                    </p>
                    <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                      <li>Effectuez {solde > 0 ? 'un retrait' : 'un dépôt'} pour ramener le solde exactement à 0 HTG</li>
                      <li>Vérifiez qu'aucune transaction n'est en attente</li>
                      <li>Assurez-vous que tous les chèques ont été compensés</li>
                      <li>Revenez pour fermer le compte</li>
                    </ol>
                  </div>
                )}
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onClose}
                isDisabled={isClosing}
              >
                Annuler
              </Button>
              <Button 
                color="warning" 
                onPress={handleClose}
                isLoading={isClosing}
                isDisabled={!canClose}
              >
                {isClosing ? 'Fermeture en cours...' : '🔒 Confirmer la fermeture'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}