'use client';

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { FaCalendarAlt } from 'react-icons/fa';
import { HolidayData } from './validations';
// import { deleteHoliday } from '@/api/holidays'; // à activer si tu as une API

interface DeleteHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holiday: HolidayData;
}

const DeleteHolidayModal: React.FC<DeleteHolidayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  holiday
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setApiError(null);

    try {
      // await deleteHoliday(holiday.id);
      console.log('Suppression holiday:', holiday.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setApiError("Impossible de supprimer le jour férié.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <FaCalendarAlt />
          <div>
            <h3 className="text-lg font-bold">Supprimer le jour férié</h3>
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
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer ce jour férié ?
            </p>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCalendarAlt className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 capitalize">
                    {formatDate(holiday.date)}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {holiday.description}
                  </p>
                  <div className="text-xs text-red-600 mt-2">
                    ID: {holiday.id.substring(0, 16)}...
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Attention :</strong> Cette action supprimera définitivement ce jour férié.
                Il ne pourra plus être récupéré.
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

export default DeleteHolidayModal;
