"use client";

import React, { useState } from "react";
import { FaRegTrashCan, FaBuilding } from "react-icons/fa6";
import { MdLocationOn } from "react-icons/md";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { deleteBranch } from "@/app/lib/api/branche";

interface Branch {
  id: string;
  branch_name: string;
  branch_address: string;
  branch_code: string;
  number_of_tellers: number;
  number_of_clerks: number;
  number_of_credit_officers: number;
}

interface DeleteBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch: Branch;
}

const DeleteBranchModal: React.FC<DeleteBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalEmployees =
    branch.number_of_tellers +
    branch.number_of_clerks +
    branch.number_of_credit_officers;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteBranch(branch.id);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de la branche. Veuillez réessayer.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 p-5 bg-red-50 border-b border-red-100">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <FaRegTrashCan className="text-red-600 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-red-700">Supprimer la branche</h3>
            <p className="text-xs text-red-500 mt-0.5">Action irréversible</p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-4">

          {/* Erreur API */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <p className="text-sm text-gray-700">
            Êtes-vous sûr de vouloir supprimer définitivement cette branche ?
          </p>

          {/* Card branche */}
          <div className="flex items-start gap-3 p-4 bg-red-50/50 border border-red-100 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <FaBuilding className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm">{branch.branch_name}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MdLocationOn className="shrink-0" />
                <span className="truncate">{branch.branch_address}</span>
              </div>
              <div className="flex gap-3 mt-1.5 text-xs">
                <span className="text-gray-500">
                  Code :{" "}
                  <span className="font-mono font-medium text-gray-700">
                    {branch.branch_code}
                  </span>
                </span>
                <span className="text-gray-500">
                  Personnel :{" "}
                  <span className="font-medium text-gray-700">{totalEmployees} employés</span>
                </span>
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 mb-1">
                Attention : cette action est irréversible
              </p>
              <ul className="text-amber-700 space-y-0.5 text-xs">
                <li>• Toutes les données de la branche seront perdues</li>
                <li>• Les associations avec les employés seront supprimées</li>
                <li>• L'historique des transactions sera affecté</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-60 shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Suppression…
              </>
            ) : (
              <>
                <FaRegTrashCan />
                Supprimer définitivement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBranchModal;