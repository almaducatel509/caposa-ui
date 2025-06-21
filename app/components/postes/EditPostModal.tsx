"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Checkbox,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react";
import { FiEdit } from "react-icons/fi";
import { Post, postSchema } from "./validations";
import { updatePost } from "@/app/lib/api/post"; // Vous devez créer cette fonction

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post: Post | null;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  post,
}) => {
  const [formData, setFormData] = useState<Post>({
    name: "",
    description: "",
    deposit: false,
    withdrawal: false,
    transfer: false,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les données du post quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && post) {
      setFormData({
        name: post.name || "",
        description: post.description || "",
        deposit: post.deposit || false,
        withdrawal: post.withdrawal || false,
        transfer: post.transfer || false,
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, post]);

  const validateStep = (): boolean => {
    const result = postSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Partial<Record<keyof Post, string>> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length) {
          const key = error.path[0] as keyof Post;
          newErrors[key] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!post?.id) return;

    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!validateStep()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePost(post.id, formData);
      setSuccessMessage("Post modifié avec succès !");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setApiError("Une erreur est survenue lors de la modification du post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof Post, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const getSelectedPermissions = () => {
    const permissions = [];
    if (formData.deposit) permissions.push({ key: 'deposit', label: 'Dépôt', icon: '💰', color: 'success' as const });
    if (formData.withdrawal) permissions.push({ key: 'withdrawal', label: 'Retrait', icon: '💸', color: 'warning' as const });
    if (formData.transfer) permissions.push({ key: 'transfer', label: 'Transfert', icon: '🔄', color: 'primary' as const });
    return permissions;
  };

  if (!post) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <FiEdit />
          <div>
            <h3 className="text-lg font-bold">Modifier le Poste</h3>
            <p className="text-sm opacity-90">Mettre à jour les informations du poste</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6 p-6">
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Section 1: Informations de Base */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Informations de Base</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Nom du poste */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="text-lg">🏷️</span>
                    Nom du Poste
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    variant="bordered"
                    size="sm"
                    placeholder="Ex: Caissier Principal, Agent Commercial..."
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "border-gray-200 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    Description du Poste
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    isInvalid={!!errors.description}
                    errorMessage={errors.description}
                    variant="bordered"
                    size="sm"
                    placeholder="Décrivez les responsabilités et tâches de ce poste..."
                    minRows={3}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "border-gray-200 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Section 2: Permissions */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Permissions et Autorisations</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez les opérations que ce poste est autorisé à effectuer :
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Permission Dépôt */}
                  <div className="space-y-2">
                    <Checkbox
                      isSelected={formData.deposit}
                      onValueChange={(checked) => handleCheckboxChange("deposit", checked)}
                      classNames={{
                        wrapper: "before:border-green-300 data-[selected=true]:bg-green-500 data-[selected=true]:border-green-500"
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        <span className="font-medium text-green-700">Dépôt</span>
                      </div>
                    </Checkbox>
                    <p className="text-xs text-gray-500 ml-6">
                      Autoriser les opérations de dépôt d'argent
                    </p>
                  </div>

                  {/* Permission Retrait */}
                  <div className="space-y-2">
                    <Checkbox
                      isSelected={formData.withdrawal}
                      onValueChange={(checked) => handleCheckboxChange("withdrawal", checked)}
                      classNames={{
                        wrapper: "before:border-orange-300 data-[selected=true]:bg-orange-500 data-[selected=true]:border-orange-500"
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💸</span>
                        <span className="font-medium text-orange-700">Retrait</span>
                      </div>
                    </Checkbox>
                    <p className="text-xs text-gray-500 ml-6">
                      Autoriser les opérations de retrait d'argent
                    </p>
                  </div>

                  {/* Permission Transfert */}
                  <div className="space-y-2">
                    <Checkbox
                      isSelected={formData.transfer}
                      onValueChange={(checked) => handleCheckboxChange("transfer", checked)}
                      classNames={{
                        wrapper: "before:border-blue-300 data-[selected=true]:bg-blue-500 data-[selected=true]:border-blue-500"
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔄</span>
                        <span className="font-medium text-blue-700">Transfert</span>
                      </div>
                    </Checkbox>
                    <p className="text-xs text-gray-500 ml-6">
                      Autoriser les opérations de transfert d'argent
                    </p>
                  </div>
                </div>

                {/* Aperçu des permissions sélectionnées */}
                {getSelectedPermissions().length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Permissions sélectionnées :
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedPermissions().map((permission) => (
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
            </CardBody>
          </Card>
        </ModalBody>
        
        <ModalFooter className="bg-gray-50">
          <Button 
            variant="light" 
            onPress={onClose}
            isDisabled={isSubmitting}
            className="text-gray-600"
          >
            Annuler
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {isSubmitting ? "Modification..." : "Modifier le Poste"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPostModal;