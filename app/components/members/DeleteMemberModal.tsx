"use client";

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@nextui-org/react';
import { FaUserTimes, FaExclamationTriangle } from 'react-icons/fa';
import UserAvatar from '@/app/components/core/UserAvatar';
import { MemberData } from './validations';
import { deleteMember } from '@/app/lib/api/member';

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: MemberData;
}

const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  member
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!member.id) {
      setApiError("ID du membre manquant");
      return;
    }

    setIsDeleting(true);
    setApiError(null);

    try {
      await deleteMember(member.id);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      if (error.response?.status === 404) {
        setApiError("Ce membre n'existe plus.");
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Une erreur est survenue lors de la suppression.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      placement="center"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <FaUserTimes />
          <div>
            <h3 className="text-lg font-bold">Supprimer le membre</h3>
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
              <FaExclamationTriangle className="text-xl flex-shrink-0" />
              <p className="text-sm">
                Êtes-vous sûr de vouloir supprimer ce membre ? Toutes les données associées seront perdues.
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <UserAvatar
                  user={member}
                  size="md"
                  type="member"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">
                    {member.first_name} {member.last_name}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {member.email || 'Email non disponible'}
                  </p>
                  <div className="text-xs text-red-600 mt-2 space-y-1">
                    <div>Téléphone: {member.phone_number}</div>
                    <div>Ville: {member.city}</div>
                    <div>ID: {member.id?.substring(0, 16)}...</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-100 border border-gray-200 rounded">
              <p className="text-sm text-gray-700">
                ⚠️ Cette opération est définitive. Assurez-vous d’avoir sauvegardé toutes les informations nécessaires avant de continuer.
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

export default DeleteMemberModal;
