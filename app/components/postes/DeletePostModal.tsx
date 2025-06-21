"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { Post } from "./validations";
import { deletePost } from "@/app/lib/api/post"; // Vous devez créer cette fonction

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post: Post | null;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  post,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!post?.id) return;

    setIsDeleting(true);
    setApiError(null);

    try {
      await deletePost(post.id);
      onSuccess();
      onClose();
    } catch (error) {
      setApiError("Une erreur est survenue lors de la suppression du post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPermissionChips = () => {
    if (!post) return [];
    const permissions = [];
    if (post.deposit) permissions.push({ key: 'deposit', label: 'Dépôt', icon: '💰', color: 'success' as const });
    if (post.withdrawal) permissions.push({ key: 'withdrawal', label: 'Retrait', icon: '💸', color: 'warning' as const });
    if (post.transfer) permissions.push({ key: 'transfer', label: 'Transfert', icon: '🔄', color: 'primary' as const });
    return permissions;
  };

  if (!post) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <FaRegTrashCan />
          <div>
            <h3 className="text-lg font-bold">Supprimer le Poste</h3>
            <p className="text-sm opacity-90">Cette action est irréversible</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6 p-6">
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="text-6xl">⚠️</div>
            
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Êtes-vous sûr de vouloir supprimer ce poste ?
              </h4>
              <p className="text-gray-600">
                Cette action supprimera définitivement le poste et ne peut pas être annulée.
              </p>
            </div>
          </div>

          {/* Informations du poste à supprimer */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-600">Nom du poste :</div>
                <div className="text-lg font-semibold text-red-700">{post.name}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-600">Description :</div>
                <div className="text-sm text-gray-800">{post.description}</div>
              </div>

              {getPermissionChips().length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Permissions :</div>
                  <div className="flex flex-wrap gap-2">
                    {getPermissionChips().map((permission) => (
                      <Chip
                        key={permission.key}
                        color={permission.color}
                        variant="flat"
                        size="sm"
                        startContent={<span>{permission.icon}</span>}
                      >
                        {permission.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-amber-500 text-xl">💡</div>
              <div className="text-sm text-amber-800">
                <div className="font-medium mb-1">Conseil :</div>
                <p>
                  Si vous n'êtes pas sûr, vous pouvez modifier le poste au lieu de le supprimer. 
                  Cela vous permettra de conserver l'historique et les données associées.
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter className="bg-gray-50">
          <Button 
            variant="light" 
            onPress={onClose}
            isDisabled={isDeleting}
            className="text-gray-600"
          >
            Annuler
          </Button>
          <Button 
            color="danger"
            onPress={handleDelete}
            isLoading={isDeleting}
            isDisabled={isDeleting}
            className="bg-red-500 text-white"
          >
            {isDeleting ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeletePostModal;