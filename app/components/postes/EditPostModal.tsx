"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { X } from "lucide-react";
import { PostData, postSchema, ErrorMessages } from "./validations";
import { updatePost, createPost, getPostById } from "@/app/lib/api/post";
import PostFormFields from "./PostFormFields";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post: PostData | null;
  isEditMode: boolean;
  mode?: "create" | "edit";
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  post,
  isEditMode,
  mode = "create",
}) => {
  const [formData, setFormData] = useState<PostData>({
    id: "",
    name: "",
    description: "",
    deposit: false,
    withdrawal: false,
    transfert: false,
  });

  const [errors, setErrors] = useState<ErrorMessages<PostData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        if (isEditMode && post) {
          // Charger les données du post depuis l'API si nécessaire
          const postDataFromApi = post.id ? await getPostById(post.id) : post;

          setFormData({
            id: postDataFromApi.id,
            name: postDataFromApi.name || "",
            description: postDataFromApi.description || "",
            deposit: postDataFromApi.deposit || false,
            withdrawal: postDataFromApi.withdrawal || false,
            transfert: postDataFromApi.transfert || false,
          });
        } else if (!isEditMode) {
          // Mode création : réinitialiser le formulaire
          setFormData({
            id: "",
            name: "",
            description: "",
            deposit: false,
            withdrawal: false,
            transfert: false,
          });
        }

        setErrors({});
        setSuccessMessage(null);
      } catch (error) {
        console.error(error);
        setApiError("Impossible de charger les données du poste.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, isEditMode, post]);

  const validate = () => {
    const result = postSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ErrorMessages<PostData> = {};
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof PostData;
        fieldErrors[key] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode && post?.id) {
        await updatePost(post.id, formData);
        setSuccessMessage("Post modifié avec succès !");
      } else {
        await createPost(formData);
        setSuccessMessage("Post créé avec succès !");
      }
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setApiError(
        `Une erreur est survenue lors de ${isEditMode ? "la modification" : "la création"} du post.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof PostData) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const getSelectedPermissions = () => {
    const permissions = [];
    if (formData.deposit) permissions.push({ label: 'Dépôt', icon: '💰', color: 'bg-green-100 text-green-700' });
    if (formData.withdrawal) permissions.push({ label: 'Retrait', icon: '💸', color: 'bg-orange-100 text-orange-700' });
    if (formData.transfert) permissions.push({ label: 'Transfert', icon: '🔄', color: 'bg-blue-100 text-blue-700' });
    return permissions;
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex justify-center items-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex justify-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
            <span className="text-green-600">Chargement...</span>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <div className="bg-linear-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold">{isEditMode ? "Modifier le Poste" : "Nouveau Poste"}</h3>
        <p className="text-sm opacity-90 mt-1">
          {isEditMode ? "Mettre à jour les informations du poste" : "Créer un nouveau poste"}
        </p>
      </div>

      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
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

        <PostFormFields
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleCheckboxChange={handleCheckboxChange}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          post={post}
          mode={mode}
        />
      </div>

      <div className="border-t bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "En cours..." : isEditMode ? "Modifier" : "Créer"}
        </button>
      </div>
    </Modal>
  );
};

export default EditPostModal;