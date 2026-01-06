"use client";

import React, { useState } from 'react';
import { Modal } from "@/app/components/ui/Modal";
import { X } from "lucide-react";
import { FaUserTimes, FaExclamationTriangle } from 'react-icons/fa';
import UserAvatar from '@/app/components/core/UserAvatar';
import { MemberData } from './validations';
import { deleteMember } from '@/app/lib/api/members';

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: MemberData | null;
}

const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  member
}) => {
  if (!member) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!member.id_member) {
      setApiError("ID du membre manquant");
      return;
    }

    setIsDeleting(true);
    setApiError(null);

    try {
      const idStr = String(member.id_member);
      await deleteMember(idStr);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      if (error.response?.status === 404) {
        setApiError("Ce membre n'existe plus.");
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Une erreur est survenue lors de la suppression.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={isDeleting ? () => {} : onClose} size="md">
      {/* Header */}
      <div className="bg-linear-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl relative">
        {!isDeleting && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        )}
        
        <div className="flex items-center gap-2">
          <FaUserTimes />
          <div>
            <h3 className="text-lg font-bold">Supprimer le membre</h3>
            <p className="text-sm opacity-90">Cette action est irréversible</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {apiError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
            {apiError}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <FaExclamationTriangle className="text-xl shrink-0" />
            <p className="text-sm">
              Êtes-vous sûr de vouloir supprimer ce membre ? Toutes les données associées seront perdues.
            </p>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <UserAvatar
                user={member}
                size="md"
                type="member"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800">
                  {member.first_name} {member.last_name}
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {member.email || 'Email non disponible'}
                </p>
                <div className="text-xs text-red-600 mt-2 space-y-1">
                  <div>Téléphone: {member.phone_number}</div>
                  <div>Ville: {member.city}</div>
                  <div>ID: {String(member.id_member).substring(0, 16)}...</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800 font-medium">
              ⚠️ Vérifications avant suppression :
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Tous les soldes doivent être à 0</li>
              <li>Tous les comptes doivent être fermés</li>
              <li>Aucune transaction en attente</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2 italic">
              Note: Cette action archive le membre plutôt que de le supprimer définitivement.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t p-4 flex justify-end gap-3 rounded-b-2xl">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="px-6 py-2 text-[#2c2e2f] hover:bg-gray-100 rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isDeleting && (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          )}
          {isDeleting ? "Suppression..." : "Supprimer"}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteMemberModal;