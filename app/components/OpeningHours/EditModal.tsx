import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@nextui-org/react';
import RegisterForm from './register_form';
import { OpeningHrs } from '@/app/dashboard/opening_hours/columns';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: OpeningHrs | null;
  isEditMode: boolean;
}

export default function EditModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditMode,
}: EditModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xl font-semibold">
              {isEditMode ? 'Modifier' : 'Ajouter'}
            </h3>
            <Button isIconOnly variant="light" onPress={onClose}>
              ✕
            </Button>
          </div>
        </ModalHeader>
        <ModalBody>
          <RegisterForm
            initialData={initialData}
            isEditMode={isEditMode}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}