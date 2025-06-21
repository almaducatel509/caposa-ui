"use client";

import React, { useState } from "react";
import {
  Input,
  Textarea,
  Checkbox,
  Card,
  CardBody,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/react";
import { Post, postSchema } from "./validations";
import { createPost } from "@/app/lib/api/post";
import { useRouter } from "next/navigation";

const RegisterForm: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
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
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();

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
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!validateStep()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await createPost(formData);
      setSuccessMessage("Post créé avec succès !");
      if (onRefresh) {
        onRefresh();
      }
      onOpen();
    } catch (error) {
      setApiError("Une erreur est survenue lors de la création du post.");
      onOpen();
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

  const handleCreateAnother = () => {
    setFormData({
      name: "",
      description: "",
      deposit: false,
      withdrawal: false,
      transfer: false,
    });
    setApiError(null);
    setSuccessMessage(null);
    onClose();
  };

  const getSelectedPermissions = () => {
    const permissions = [];
    if (formData.deposit) permissions.push({ key: 'deposit', label: 'Dépôt', icon: '💰', color: 'success' as const });
    if (formData.withdrawal) permissions.push({ key: 'withdrawal', label: 'Retrait', icon: '💸', color: 'warning' as const });
    if (formData.transfer) permissions.push({ key: 'transfer', label: 'Transfert', icon: '🔄', color: 'primary' as const });
    return permissions;
  };

  return (
    <div className="space-y-6">
      {/* En-tête stylisé */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-3"></div>
          <h2 className="text-xl font-semibold text-gray-800">Créer un Nouveau Poste</h2>
        </div>
        <p className="text-sm text-gray-600">Définissez les informations et permissions du poste</p>
      </div>

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
                value={formData.name || ""}
                onChange={handleChange}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                isDisabled={isSubmitting}
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
                value={formData.description || ""}
                onChange={handleChange}
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                isDisabled={isSubmitting}
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
                  isDisabled={isSubmitting}
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
                  isDisabled={isSubmitting}
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
                  isDisabled={isSubmitting}
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

      {/* Bouton de soumission */}
      <div className="flex justify-end pt-4">
        <Button
          className="bg-gradient-to-r from-green-500 to-green-600 text-white font-medium px-8"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? "Création en cours..." : "Créer le Poste"}
        </Button>
      </div>

      {/* Modal de succès/erreur */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          <ModalHeader className={`${successMessage ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            <span className="flex items-center gap-2">
              {successMessage ? '✅' : '❌'}
              {successMessage ? "Succès !" : "Erreur !"}
            </span>
          </ModalHeader>
          <ModalBody className="py-6">
            {successMessage ? (
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-lg font-medium text-green-700 mb-2">{successMessage}</p>
                <p className="text-sm text-gray-600">
                  Le poste "{formData.name}" a été créé avec succès !
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-4">😞</div>
                <p className="text-red-600">{apiError}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {successMessage ? (
              <div className="flex gap-2">
                <Button color="primary" onPress={handleCreateAnother} variant="bordered">
                  Créer un autre
                </Button>
                <Button 
                  className="bg-green-500 text-white" 
                  onPress={() => router.push('/dashboard/postes')}
                >
                  Voir tous les postes
                </Button>
              </div>
            ) : (
              <Button color="danger" onPress={onClose}>
                Fermer
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegisterForm;