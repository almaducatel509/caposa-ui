"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { X, Calendar, AlertTriangle } from "lucide-react";
import { HolidayData } from "./validations";
import { deleteHoliday } from "@/app/lib/api/holiday";

interface DeleteHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holiday: HolidayData;
}

const DeleteHolidayModal: React.FC<DeleteHolidayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  holiday,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setApiError(null);

    try {
      await deleteHoliday(holiday.id);
      console.log("Suppression holiday:", holiday.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setApiError("Impossible de supprimer le jour férié.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-linear-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl relative">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 disabled:opacity-50"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Calendar size={24} />
          <div>
            <h3 className="text-xl font-bold">Supprimer le jour férié</h3>
            <p className="text-sm opacity-90 mt-1">Cette action est irréversible</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {apiError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
            {apiError}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer ce jour férié ?
          </p>

          {/* Card du jour férié à supprimer */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Calendar className="text-red-600" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 capitalize">
                  {formatDate(holiday.date)}
                </h4>
                <p className="text-sm text-red-700 mt-1">{holiday.description}</p>
                {holiday.id && (
                  <div className="text-xs text-red-600 mt-2">
                    ID: {holiday.id.substring(0, 16)}...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-yellow-800">
              <strong>Attention :</strong> Cette action supprimera définitivement ce
              jour férié. Il ne pourra plus être récupéré.
            </p>
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
            "Supprimer"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteHolidayModal;