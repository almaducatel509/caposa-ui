"use client";

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";
import { FaUserTimes, FaExclamationTriangle } from 'react-icons/fa';
import UserAvatar from '@/app/components/core/UserAvatar';
import { EmployeeData } from './validations';
import { deleteEmployee } from '@/app/lib/api/employee';

// ============= INTERFACE AVEC | null =============
interface DeleteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId?: string) => void; // ← Peut envoyer l'ID ou rien
  employee: EmployeeData | null; // ← Accepte null
}

const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee
}) => {
  // ⚠️ PROTECTION OBLIGATOIRE contre null
  if (!employee) return null;

  // ✅ À partir d'ici, TypeScript sait que employee n'est plus null
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!employee.id) {
      setApiError("ID de l'employé manquant");
      return;
    }

    setIsDeleting(true);
    setApiError(null);

    try {
      await deleteEmployee(employee.id);
      onSuccess(employee.id); // ← Envoie l'ID supprimé
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      if (error.response?.status === 404) {
        setApiError("Cet employé n'existe plus.");
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Une erreur est survenue lors de la suppression.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      placement="center"
      isDismissable={!isDeleting}
      hideCloseButton={isDeleting}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-linear-to-r from-red-500 to-red-600 text-white">
          <FaUserTimes />
          <div>
            <h3 className="text-lg font-bold">Supprimer l'employé</h3>
            <p className="text-sm opacity-90">Cette action est irréversible</p>
          </div>
        </ModalHeader>

        <ModalBody className="p-6">
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {apiError}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <FaExclamationTriangle className="text-xl shrink-0" />
              <p className="text-sm">
                Êtes-vous sûr de vouloir supprimer cet employé ? Toutes les données associées seront perdues.
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <UserAvatar
                  user={employee}
                  size="md"
                  type="employee"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">
                    {employee.first_name} {employee.last_name}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {employee.user?.email}
                  </p>
                  <div className="text-xs text-red-600 mt-2 space-y-1">
                    <div>Téléphone: {employee.phone_number}</div>
                    <div>Référence: {employee.payment_ref}</div>
                    <div>ID: {employee.id?.substring(0, 16)}...</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-100 border border-gray-200 rounded">
              <p className="text-sm text-gray-700">
                ⚠️ Cette opération est définitive. Assurez-vous d'avoir sauvegardé toutes les informations nécessaires avant de continuer.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="bg-gray-50 border-t">
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={isDeleting}
            className="text-[#2c2e2f]"
          >
            Annuler
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={isDeleting}
            isDisabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteEmployeeModal;