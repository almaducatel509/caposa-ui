"use client";
import React, { useState } from "react";
import {
  Input,
  Textarea,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Post, postSchema } from "./validations";
import { createPost } from "@/app/lib/api/post"; // Ensure this path is correct
import { useRouter } from "next/navigation";
import TitleDetails from "./title-details";

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
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
      onOpen(); // Open success modal
    } catch (error) {
      setApiError("Une erreur est survenue lors de la création du post.");
      onOpen(); // Open error modal
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
    onClose(); // Close the modal
  };

  return (
    <div className="capitalize space-y-6">
        <TitleDetails text1="Remplir les champs nécessaires" text2="Fournir vos informations personnelles" />
  
        {/* Name Field */}
        <div className="space-y-2">
          <Input
            type="text"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div className="text-red-600">{errors.name}</div>}
        </div>
  
        {/* Description Field */}
        <div className="space-y-2">
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          {errors.description && <div className="text-red-600">{errors.description}</div>}
        </div>
  
        {/* Checkboxes */}
        <div className="space-y-2">
          <Checkbox
            isSelected={formData.deposit}
            onChange={(e) => handleCheckboxChange("deposit", e.target.checked)}
          >
            Deposit
          </Checkbox>
          {errors.deposit && <div className="text-red-600">{errors.deposit}</div>}
  
          <Checkbox
            isSelected={formData.withdrawal}
            onChange={(e) => handleCheckboxChange("withdrawal", e.target.checked)}
          >
            Withdrawal
          </Checkbox>
          {errors.withdrawal && <div className="text-red-600">{errors.withdrawal}</div>}
  
          <Checkbox
            isSelected={formData.transfer}
            onChange={(e) => handleCheckboxChange("transfer", e.target.checked)}
          >
            Transfer
          </Checkbox>
          {errors.transfer && <div className="text-red-600">{errors.transfer}</div>}
        </div>
  
        <div className="flex justify-end mt-6">
          <Button
            className="bg-green-600 text-white"
            onClick={handleSubmit}
            isDisabled={isSubmitting}
          >
            {isSubmitting ? "Envoi..." : "Soumettre"}
          </Button>
        </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>{successMessage ? "Succès!" : "Erreur!"}</ModalHeader>
          <ModalBody>
            {successMessage ? (
              <p>{successMessage}</p>
            ) : (
              <p className="text-red-500">{apiError}</p>
            )}
          </ModalBody>
          <ModalFooter>
            {successMessage ? (
              <div>
                <Button color="primary" onPress={handleCreateAnother}>
                  Créer un autre
                </Button>
                  <Button color="success" onPress={() => router.push('/dashboard/postes')}>
                  Voir tout
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
// const isDuplicatePost = (newPost: Post): string | null => {
//   const duplicate = existingPosts.find(
//     (p) => p.name === newPost.name
//   );
//   return duplicate ? `Un poste avec le nom "${newPost.name}" existe déjà.` : null;
// };
