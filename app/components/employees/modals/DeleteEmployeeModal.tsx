"use client";

import React, { useState } from 'react';
import { Modal } from "@/app/components/ui/Modal";
import { X, AlertTriangle, Archive, Loader2, UserX } from 'lucide-react';
import UserAvatar from '@/app/components/core/UserAvatar';
import { EmployeeData } from '../validations';
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
  employee,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError]     = useState<string | null>(null);

  if (!employee) return null;

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
      if (error.response?.status === 404) {
        setApiError("Cet employé n'existe plus.");
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Une erreur est survenue lors de l'archivage.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={isDeleting ? () => {} : onClose} size="lg">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Archiver l'employé</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {employee.first_name} {employee.last_name}
            </p>
          </div>
        </div>
        {!isDeleting && (
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5 flex flex-col gap-4">

        {/* Erreur API */}
        {apiError && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium">{apiError}</p>
          </div>
        )}

        {/* Info employé */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#F9F9F6] rounded-xl border border-gray-100">
          <UserAvatar user={employee} size="md" type="employee" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {employee.first_name} {employee.last_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{employee.user?.email}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{employee.payment_ref}</p>
          </div>
        </div>

        {/* Message soft delete */}
        <div className="flex items-start gap-3 px-4 py-3 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl">
          <Archive className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#1B5E20]">Archivage sécurisé</p>
            <p className="text-xs text-[#2E7D32] mt-0.5">
              Le profil sera archivé et non supprimé définitivement.
              Un enregistrement sera conservé dans le système d'archives.
            </p>
          </div>
        </div>

        {/* Avertissement confirmation */}
        <div className="flex items-start gap-2 px-3 py-2.5 bg-yellow-50 border border-yellow-100 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700 font-medium">
            L'employé n'aura plus accès au système après cette action.
            Confirmez avant de continuer.
          </p>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose} disabled={isDeleting}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
          Annuler
        </button>
        <button onClick={handleDelete} disabled={isDeleting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isDeleting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Archivage…</>
            : <><Archive className="w-4 h-4" /> Archiver l'employé</>
          }
        </button>
      </div>

    </Modal>
  );
};

export default DeleteEmployeeModal;