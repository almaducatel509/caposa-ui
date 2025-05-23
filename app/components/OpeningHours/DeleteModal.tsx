import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { OpeningHrs } from '@/app/dashboard/opening_hours/columns';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: OpeningHrs | null;
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onSuccess,
  item,
  onDelete,
}: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(item.id);
      onSuccess();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold text-red-600">Supprimer</h3>
        </ModalHeader>
        <ModalBody>
          <p>Voulez-vous vraiment supprimer cet horaire ?</p>
          <p className="text-sm text-gray-600">ID: {item.id}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button 
            color="danger" 
            onPress={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}