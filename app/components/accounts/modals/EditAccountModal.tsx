'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import CompteFormFields from '../CompteFormFields';

import { createAccountSchema, updateAccountSchema } from '../validationsaccount';
import type { AccountData } from '../validationsaccount';

// ⬇️ On importe maintenant UNIQUEMENT les fonctions API
import { createAccount, updateAccount } from '@/app/lib/api/accounts';

// ============= TYPES =============
interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountData | null; 
  onSuccess: (account: AccountData) => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess
}) => {
  const isEditMode = !!account;

  // ============= FORM STATE =============
  const [formData, setFormData] = useState({
    id_membre: "",
    typeCompte: "" as "epargne" | "cheques" | "terme" | "",
    statutCompte: "actif" as "actif" | "ferme" | "suspendu",
    dateOuverture: new Date().toISOString().split('T')[0],
    dateFermeture: null as string | null,
    tauxInteret: null as number | null,
    limiteTrait: null as number | null,
    fraisServiceMensuel: null as number | null,
    member_details: undefined as any,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ============= INIT FORM DATA =============
  useEffect(() => {
    if (account) {
      setFormData({
        id_membre: account.id_membre || account.member || "",
        typeCompte: account.typeCompte || "",
        statutCompte: account.statutCompte || "actif",
        dateOuverture: account.dateOuverture || account.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        dateFermeture: account.dateFermeture || null,
        tauxInteret: account.tauxInteret || null,
        limiteTrait: account.limiteTrait || null,
        fraisServiceMensuel: account.fraisServiceMensuel || null,
        member_details: account.member_details,
      });
    } else {
      setFormData({
        id_membre: "",
        typeCompte: "",
        statutCompte: "actif",
        dateOuverture: new Date().toISOString().split('T')[0],
        dateFermeture: null,
        tauxInteret: null,
        limiteTrait: null,
        fraisServiceMensuel: null,
        member_details: undefined,
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [account, isOpen]);

  // ============= HANDLERS =============
  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setSubmitError(null);

    // Effacer l'erreur uniquement du champ modifié
    const updatedField = Object.keys(updates)[0];
    if (updatedField) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[updatedField];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      if (isEditMode) {
        // ============= MODE EDIT =============
        const payload = {
          statutCompte: formData.statutCompte,
          tauxInteret: formData.tauxInteret,
          limiteTrait: formData.limiteTrait,
          fraisServiceMensuel: formData.fraisServiceMensuel,
          dateFermeture: formData.dateFermeture,
        };

        const validation = updateAccountSchema.safeParse(payload);
        if (!validation.success) {
          const zodErrors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
            if (err.path[0]) zodErrors[err.path[0] as string] = err.message;
          });
          setErrors(zodErrors);
          return;
        }

        // ⬇️ appel API via accounts.ts
        const updated = await updateAccount(account.id, validation.data);
        onSuccess(updated);

      } else {
        // ============= MODE CREATE =============
        const payload = {
          id_membre: formData.id_membre,
          typeCompte: formData.typeCompte,
          statutCompte: formData.statutCompte,
          dateOuverture: formData.dateOuverture,
          tauxInteret: formData.tauxInteret,
          limiteTrait: formData.limiteTrait,
          fraisServiceMensuel: formData.fraisServiceMensuel,
        };

        const validation = createAccountSchema.safeParse(payload);
        if (!validation.success) {
          const zodErrors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
            if (err.path[0]) zodErrors[err.path[0] as string] = err.message;
          });
          setErrors(zodErrors);
          return;
        }

        // ⬇️ appel API propre
        const created = await createAccount(validation.data);
        onSuccess(created);
      }

    } catch (error: any) {
      console.error("❌ Erreur soumission:", error);

      if (error?.errors) {
        // Erreurs Zod renvoyées par accounts.ts
        const zodErrors: Record<string, string> = {};
        error.errors.forEach((e: any) => {
          if (e.path?.[0]) zodErrors[e.path[0]] = e.message;
        });
        setErrors(zodErrors);
      } else {
        setSubmitError(error.message || "Erreur lors de la soumission.");
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  // ============= RENDER =============
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      size="4xl"
      scrollBehavior="outside"
      isDismissable={!isSubmitting}
      hideCloseButton={isSubmitting}
      classNames={{
        base: "bg-white",
        //backdrop: "bg-black/50 backdrop-blur-sm",
      }}
      backdrop="opaque"

    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "✏️ Modifier le Compte" : "🆕 Créer un Nouveau Compte"}
          </h2>
          <p className="text-sm text-gray-600">
            {isEditMode 
              ? `Modification du compte ${account.account_number}` 
              : "Suivez les étapes pour créer un nouveau compte"}
          </p>
        </ModalHeader>

        <ModalBody className="py-6">
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">❌ Erreur</p>
              <p className="text-red-700 text-sm mt-1">{submitError}</p>
            </div>
          )}

          <CompteFormFields
            formData={formData}
            setFormData={handleFormDataChange}
            errors={errors}
            setErrors={setErrors}
            mode={isEditMode ? "edit" : "create"}
          />
        </ModalBody>

        <ModalFooter className="border-t pt-4">
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
          >
            {isSubmitting
              ? isEditMode ? "Modification..." : "Création..."
              : isEditMode ? "💾 Modifier" : "✅ Créer le Compte"
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditAccountModal;