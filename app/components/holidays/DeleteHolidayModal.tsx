"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { X, Calendar, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { HolidayData } from "./validations";
import { deleteHoliday } from "@/app/lib/api/holiday";

interface DeleteHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holiday: HolidayData;
}

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

export default function DeleteHolidayModal({
  isOpen, onClose, onSuccess, holiday,
}: DeleteHolidayModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError]     = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setApiError(null);
    try {
      await deleteHoliday(holiday.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setApiError("Impossible de supprimer le jour férié.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 rounded-t-2xl relative flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Supprimer le jour férié</h3>
          <p className="text-sm text-red-100 mt-0.5">Cette action est irréversible</p>
        </div>
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/20 text-white transition-all disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-4">
        {/* API error */}
        {apiError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        <p className="text-sm text-gray-600">
          Êtes-vous sûr de vouloir supprimer ce jour férié ?
        </p>

        {/* Holiday card */}
        <div className="flex items-start gap-3 px-4 py-4 bg-red-50 rounded-xl border border-red-100">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800 capitalize">
              {formatDate(holiday.date)}
            </p>
            <p className="text-sm text-red-700 mt-0.5">{holiday.description}</p>
            {holiday.id && (
              <p className="text-xs text-red-400 mt-1 font-mono">
                ID: {holiday.id.substring(0, 16)}…
              </p>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 px-4 py-3 bg-yellow-50 rounded-xl border border-yellow-200">
          <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Attention :</span> Ce jour férié sera
            définitivement supprimé et ne pourra pas être récupéré.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200
                     text-gray-700 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                     bg-gradient-to-r from-red-500 to-red-600 text-white
                     shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Suppression…</>
          ) : (
            <><Trash2 className="w-4 h-4" /> Supprimer</>
          )}
        </button>
      </div>
    </Modal>
  );
}