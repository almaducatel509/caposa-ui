// app/components/account/modals/EditAccountModal.tsx
'use client';
import React, { useState, useEffect } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button 
} from "@nextui-org/react";
import { FaEdit, FaPlus } from "react-icons/fa";
import type { AccountData, AccountFormData } from "../validationsaccount";
import { toAccountFormData } from "../validationsaccount";
import { updateAccount, createAccount } from "@/app/lib/api/accounts";
import AccountFormFields from "../CompteFormFields";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: AccountData) => void;  // ← Toujours retourne AccountData
  account: AccountData | null;  // null = CREATE, object = EDIT
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  account 
}) => {
  // ✅ Mode automatiquement déduit (COMME EMPLOYEE)
  const isEditMode = !!account;
  
  console.log('🎯 Modal opened:', {
    mode: isEditMode ? 'EDIT' : 'CREATE',
    account: account ? account.noCompte : 'none'
  });

  // ✅ États - Initialize with proper structure (COMME EMPLOYEE)
  const [formData, setFormData] = useState<AccountFormData>({
    noCompte: '',
    idMembre: '',
    idEmployee: undefined,
    typeCompte: '',  // Empty string initially
    statutCompte: 'actif',
    dateOuverture: new Date().toISOString().slice(0, 10),  // Date du jour par défaut
    dateFermeture: undefined,
    soldeActuel: 0,
    depotInitial: 0,
    tauxInteret: undefined,
    limiteTrait: undefined,
    fraisServiceMensuel: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Initialisation (COMME EMPLOYEE)
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        
        // ✅ Initialisation du formulaire
        if (isEditMode && account) {
          // Mode EDIT: pré-remplir avec données existantes
          const editFormData = toAccountFormData(account);
          setFormData(editFormData);
          console.log('📝 Form pre-filled for edit:', editFormData);
        } else {
          // Mode CREATE: formulaire vide (déjà dans useState)
          console.log('📝 Empty form for create mode');
        }
        
      } catch (error) {
        console.error("❌ Error loading data:", error);
        setApiError("Impossible de charger les données");
      } finally {
        setIsLoading(false);  // ✅ TOUJOURS mis à false
      }
    };

    loadData();
  }, [isOpen, account, isEditMode]);

  // ✅ Handler pour mise à jour du formulaire (COMME EMPLOYEE)
  const handleFormUpdate = (data: Partial<AccountFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...data };
      return updated;
    });
    
    // Clear errors for updated fields
    if (Object.keys(data).length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(data).forEach(key => {
          delete newErrors[key];
        });
        return newErrors;
      });
    }
  };

  // ✅ Soumission (COMME EMPLOYEE)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);
    setErrors({});

    try {
      if (isEditMode && account?.id) {
        // ========== MODE EDIT ==========
        const payload = {
          idCompte: account.id,
          noCompte: formData.noCompte,
          member_id: formData.idMembre,
          typeCompte: formData.typeCompte,
          statutCompte: formData.statutCompte,
          dateOuverture: formData.dateOuverture,
          soldeActuel: formData.soldeActuel,
          dateFermeture: formData.dateFermeture,
          tauxInteret: formData.tauxInteret,
          limiteTrait: formData.limiteTrait,
          fraisServiceMensuel: formData.fraisServiceMensuel,
        };

        console.log('📤 Updating account:', payload);
        const updated = await updateAccount(account.id, payload);
        console.log('✅ Account updated:', updated);
        
        onSuccess(updated);  // ← Une seule fois, avec AccountData
        onClose();
        return;
      }

      // ========== MODE CREATE ==========
      const payload = {
        noCompte: formData.noCompte,
        member_id: formData.idMembre,
        typeCompte: formData.typeCompte,
        statutCompte: formData.statutCompte,
        dateOuverture: formData.dateOuverture,
        soldeActuel: formData.soldeActuel,
        tauxInteret: formData.tauxInteret,
        limiteTrait: formData.limiteTrait,
        fraisServiceMensuel: formData.fraisServiceMensuel,
      };

      console.log('📤 Creating account:', payload);
      const created = await createAccount(payload);
      console.log('✅ Account created:', created);
      
      onSuccess(created);  // ← Toujours avec l'objet complet
      onClose();

    } catch (err: any) {
      console.error('❌ Submit error:', err);
      const errorMsg = err?.message || 'Erreur inconnue';
      setApiError(`Erreur lors de ${isEditMode ? 'la modification' : 'la création'}: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Early return (COMME EMPLOYEE)
  if (!isOpen) return null;  // ← Vérifie isOpen, PAS account!

  return (
    <Modal 
      isDismissable={false}
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[95vh]",
        wrapper: "z-[9999]",
        backdrop: "z-[9998]",
        body: "overflow-y-auto max-h-[85vh] px-6"
      }}
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white">
          {/* Icon */}
          {isEditMode && account ? (
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">💰</span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaPlus className="text-white" />
            </div>
          )}
          
          {isEditMode && <FaEdit />}
          
          <div>
            <h3 className="text-lg font-bold">
              {isEditMode ? 'Modifier le Compte' : 'Créer un Compte'}
            </h3>
            <p className="text-sm opacity-90">
              {isEditMode && account 
                ? `Mise à jour du compte ${account.noCompte}`
                : 'Ajouter un nouveau compte membre'
              }
            </p>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-6">
          {/* Messages d'erreur */}
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {apiError}
            </div>
          )}

          {/* Loading ou formulaire */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34963d] mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : (
            <AccountFormFields
              formData={formData}
              setFormData={handleFormUpdate}
              errors={errors}
              setErrors={setErrors}
              isEditMode={isEditMode}
            />
          )}
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 border-t">
          <Button 
            variant="light" 
            onPress={onClose}
            isDisabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            className="bg-[#34963d] text-white hover:bg-[#1e7367]"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting || isLoading}
          >
            {isSubmitting 
              ? (isEditMode ? "Mise à jour..." : "Création...") 
              : (isEditMode ? "Mettre à jour" : "Créer")
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditAccountModal;