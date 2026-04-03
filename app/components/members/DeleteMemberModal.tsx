"use client";

import React, { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "../ui/Modal";
import UserAvatar from "@/app/components/core/UserAvatar";
import { MemberData } from "./validations";
import { deleteMember } from "@/app/lib/api/members";

interface DeleteMemberModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  member:    MemberData | null;
}

const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen, onClose, onSuccess, member,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);

  if (!member) return null;

  const handleDelete = async () => {
    if (!member.id_member) { setApiError("ID du membre manquant"); return; }
    setIsDeleting(true);
    setApiError(null);
    try {
      await deleteMember(String(member.id_member));
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.status === 404) setApiError("Ce membre n'existe plus.");
      else setApiError(error.response?.data?.message ?? "Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={isDeleting ? () => {} : onClose} size="md">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-red-100 bg-red-50 rounded-t-2xl">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-700">Supprimer le membre</p>
          <p className="text-xs text-red-500 mt-0.5">Cette action est irréversible</p>
        </div>
        {!isDeleting && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-6 space-y-4">
        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {apiError}
          </div>
        )}

        {/* Warning */}
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Êtes-vous sûr de vouloir supprimer ce membre ? Toutes les données associées seront perdues.
          </p>
        </div>

        {/* Membre card */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <UserAvatar user={{ ...member, photo_profil: member.photo_profil ?? undefined }} size="md" type="member" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">
              {member.first_name} {member.last_name}
            </p>
            <p className="text-xs text-red-600 mt-0.5">{member.email || 'Email non disponible'}</p>
            <div className="text-xs text-red-500 mt-1.5 space-y-0.5">
              <div>Tél : {member.phone_number}</div>
              <div>Ville : {member.city}</div>
              <div>ID : {String(member.id_member).substring(0, 16)}…</div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
          <p className="text-xs font-semibold text-gray-700 mb-2">Vérifications avant suppression :</p>
          <ul className="text-xs text-gray-500 space-y-1 ml-3 list-disc">
            <li>Tous les soldes doivent être à 0</li>
            <li>Tous les comptes doivent être fermés</li>
            <li>Aucune transaction en attente</li>
          </ul>
          <p className="text-xs text-gray-400 mt-2 italic">
            Note : cette action archive le membre plutôt que de le supprimer définitivement.
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {isDeleting ? "Suppression..." : "Supprimer"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteMemberModal;