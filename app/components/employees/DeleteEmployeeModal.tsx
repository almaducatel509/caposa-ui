"use client";

import React, { useState } from 'react';
import { Modal } from "@/app/components/ui/Modal";
import { X } from "lucide-react";
import { FaUserTimes, FaExclamationTriangle } from 'react-icons/fa';
import UserAvatar from '@/app/components/core/UserAvatar';
import { EmployeeData } from './validations';
import { deleteEmployee } from '@/app/lib/api/employee';

interface DeleteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId?: string) => void;
  employee: EmployeeData | null;
}

const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee
}) => {
  if (!employee) return null;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!employee.id) {
      setApiError("ID de l'employé manquant");
      return;
    }

    setIsDeleting(true);
    setApiError(null);

    try {
      await deleteEmployee(employee.id);
      onSuccess(employee.id);
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      if (error.response?.status === 404) {
        setApiError("Cet employé n'existe plus.");
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
            <h3 className="text-lg font-bold">Supprimer l'employé</h3>
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
              Êtes-vous sûr de vouloir supprimer cet employé ? Toutes les données associées seront perdues.
            </p>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <UserAvatar
                user={employee}
                size="md"
                type="employee"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800">
                  {employee.first_name} {employee.last_name}
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {employee.user?.email}
                </p>
                <div className="text-xs text-red-600 mt-2 space-y-1">
                  <div>Téléphone: {employee.phone_number}</div>
                  <div>Référence: {employee.payment_ref}</div>
                  <div>ID: {employee.id?.substring(0, 16)}...</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-100 border border-gray-200 rounded">
            <p className="text-sm text-gray-700">
              ⚠️ Cette opération est définitive. Assurez-vous d'avoir sauvegardé toutes les informations nécessaires avant de continuer.
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

export default DeleteEmployeeModal;