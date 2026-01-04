"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { X, Trash2, AlertTriangle, Lightbulb } from "lucide-react";
import { PostData } from "./validations";
import { deletePost } from "@/app/lib/api/post";

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post: PostData | null;
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
      console.error(error);
      setApiError("Une erreur est survenue lors de la suppression du poste.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPermissionChips = () => {
    if (!post) return [];
    const permissions = [];
    if (post.deposit)
      permissions.push({
        key: "deposit",
        label: "Dépôt",
        icon: "💰",
        color: "bg-green-100 text-green-700 border-green-200",
      });
    if (post.withdrawal)
      permissions.push({
        key: "withdrawal",
        label: "Retrait",
        icon: "💸",
        color: "bg-orange-100 text-orange-700 border-orange-200",
      });
    if (post.transfert)
      permissions.push({
        key: "transfert",
        label: "Transfert",
        icon: "🔄",
        color: "bg-blue-100 text-blue-700 border-blue-200",
      });
    return permissions;
  };

  if (!post || !isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <div className="bg-linear-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl relative">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Trash2 size={24} />
          <div>
            <h3 className="text-xl font-bold">Supprimer le Poste</h3>
            <p className="text-sm opacity-90 mt-1">Cette action est irréversible</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {apiError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {apiError}
          </div>
        )}

        {/* Avertissement principal */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={40} />
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Êtes-vous sûr de vouloir supprimer ce poste ?
            </h4>
            <p className="text-gray-600">
              Cette action supprimera définitivement le poste et ne peut pas être
              annulée.
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
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Permissions :
                </div>
                <div className="flex flex-wrap gap-2">
                  {getPermissionChips().map((permission) => (
                    <span
                      key={permission.key}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 border ${permission.color}`}
                    >
                      <span>{permission.icon}</span>
                      {permission.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conseil */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={24} />
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">Conseil :</div>
              <p>
                Si vous n'êtes pas sûr, vous pouvez modifier le poste au lieu de le
                supprimer. Cela vous permettra de conserver l'historique et les données
                associées.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isDeleting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Suppression...
            </>
          ) : (
            <>
              <Trash2 size={18} />
              Supprimer définitivement
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default DeletePostModal;