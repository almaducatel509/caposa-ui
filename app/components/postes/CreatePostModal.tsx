import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { LuPlus } from "react-icons/lu";
import RegisterForm from "./register-form";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <LuPlus />
          <div>
            <h3 className="text-lg font-bold">Nouveau Poste</h3>
            <p className="text-sm opacity-90">Créer un nouveau poste de travail</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-6">
          <RegisterForm onRefresh={handleSuccess} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreatePostModal;