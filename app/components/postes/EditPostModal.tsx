"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { PostData, postSchema, ErrorMessages } from "./validations";
import { updatePost, createPost, getPostById } from "@/app/lib/api/post";
import PostFormFields from "./PostFormFields";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface EditPostModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  onSuccess:   () => void;
  post:        PostData | null;
  isEditMode:  boolean;
  mode?:       "create" | "edit";
}

/* ─── Modal générique ────────────────────────────────────────────────────── */

const Modal: React.FC<{
  isOpen: boolean; onClose: () => void; children: React.ReactNode; size?: string;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {children}
      </div>
    </div>
  );
};

/* ─── Composant principal ────────────────────────────────────────────────── */

const INITIAL: PostData = {
  id: "", name: "", description: "",
  deposit: false, withdrawal: false, transfert: false,
};

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen, onClose, onSuccess, post, isEditMode, mode = "create",
}) => {
  const [formData,       setFormData]       = useState<PostData>(INITIAL);
  const [errors,         setErrors]         = useState<ErrorMessages<PostData>>({});
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [apiError,       setApiError]       = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        if (isEditMode && post) {
          const data = post.id ? await getPostById(post.id) : post;
          setFormData({
            id: data.id, name: data.name || "",
            description: data.description || "",
            deposit: data.deposit || false,
            withdrawal: data.withdrawal || false,
            transfert: data.transfert || false,
          });
        } else {
          setFormData(INITIAL);
        }
        setErrors({});
        setSuccessMessage(null);
      } catch {
        setApiError("Impossible de charger les données du poste.");
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) load();
  }, [isOpen, isEditMode, post]);

  const validate = () => {
    const result = postSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ErrorMessages<PostData> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as keyof PostData] = e.message;
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
    if (!validate()) { setIsSubmitting(false); return; }
    try {
      if (isEditMode && post?.id) await updatePost(post.id, formData);
      else await createPost(formData);
      setSuccessMessage(isEditMode ? "Poste modifié avec succès !" : "Poste créé avec succès !");
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch {
      setApiError(`Une erreur est survenue lors de ${isEditMode ? "la modification" : "la création"} du poste.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof PostData) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name as keyof PostData] }));
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2E7D32]" />
          <span className="text-sm text-gray-500">Chargement…</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>

      {/* ── Header blanc ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            {isEditMode
              ? <FaEdit className="text-[#2E7D32]" size={15} />
              : <FaPlus className="text-[#2E7D32]" size={15} />
            }
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isEditMode ? "Modifier le poste" : "Nouveau poste"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEditMode ? "Mettre à jour les informations du poste" : "Créer un nouveau poste"}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-6 space-y-4 overflow-y-auto flex-1">
        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{apiError}</div>
        )}
        {successMessage && (
          <div className="p-3 bg-[#DDEAD5] border border-[#2E7D32]/20 text-[#1B5E20] rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />{successMessage}
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

      {/* ── Footer ── */}
      <div className="border-t border-gray-100 bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl shrink-0">
        <button onClick={onClose} disabled={isSubmitting}
          className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
          Annuler
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />En cours…</>
          ) : isEditMode ? (
            <><FaEdit size={13} />Modifier</>
          ) : (
            <><FaPlus size={13} />Créer</>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default EditPostModal;