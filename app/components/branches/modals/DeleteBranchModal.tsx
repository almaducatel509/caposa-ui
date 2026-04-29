"use client";

import React, { useState } from "react";
import { FaBuilding } from "react-icons/fa6";
import { MdLocationOn } from "react-icons/md";
import { Archive, AlertTriangle, Loader2, X, Info } from "lucide-react";
// ─── Ancienne version (commentée) ──────────────────────────────────────────
// import { deleteBranch } from "@/app/lib/api/branche";
// ─── Nouvelle version : soft delete via archiveBranch ──────────────────────
import { archiveBranch } from "@/app/lib/api/branche";

// ─── Ancienne version (commentée) : interface Branch dupliquée ─────────────
// interface Branch { id, branch_name, ... }
// ─── Nouvelle version : on utilise BranchData (Dieu = UI) ──────────────────
import { BranchData } from "../validations";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ArchiveBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Reçoit la branche archivée (objet complet renvoyé par l'API) */
  onSuccess: (archived?: any) => void;
  branch: BranchData;
}

/* ─── Composant ──────────────────────────────────────────────────────────── */

const DeleteBranchModal: React.FC<ArchiveBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch,
}) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  if (!isOpen) return null;

  const totalEmployees =
    branch.number_of_tellers +
    branch.number_of_clerks +
    branch.number_of_credit_officers;

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      setError(null);

      // ─── Ancienne version (commentée) : hard delete ──────────────────────
      // await deleteBranch(branch.id);

      // ─── Nouvelle version : soft delete (statusBranche = "archive") ─────
      const archived = await archiveBranch(branch.id);

      onSuccess(archived);
      onClose();
    } catch (err: any) {
      console.error("Erreur lors de l'archivage:", err);
      setError(err?.message || "Erreur lors de l'archivage. Veuillez réessayer.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    /* ── Overlay ── */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isArchiving ? onClose : undefined}
      />

      {/* ── Modal ── */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header CAPOSA (style cohérent avec les autres modaux) ──────── */}
        {/* ─── Ancienne version (commentée) : header rouge agressif ────────
        <div className="flex items-center gap-3 p-5 bg-red-50 border-b border-red-100">
          <div className="w-10 h-10 rounded-xl bg-red-100 ...">
            <FaRegTrashCan className="text-red-600 text-lg" />
          </div>
          <h3 className="text-base font-bold text-red-700">Supprimer la branche</h3>
          <p className="text-xs text-red-500">Action irréversible</p>
        */}

        {/* ─── Nouvelle version : header gris-blanc, ambre, ton doux ───── */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Archive className="text-amber-600 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Archiver la branche</h3>
              <p className="text-xs text-gray-500 mt-0.5">L'opération est réversible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isArchiving}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
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
            Voulez-vous archiver cette branche ? Elle sera déplacée vers l'onglet{" "}
            <span className="font-semibold">Archive</span> et n'apparaîtra plus dans la liste active.
          </p>

          {/* Card branche — style CAPOSA (vert clair) */}
          {/* ─── Ancienne version (commentée) : fond rouge ────────────────
          <div className="flex items-start gap-3 p-4 bg-red-50/50 border border-red-100 ...">
          */}
          {/* ─── Nouvelle version : fond vert CAPOSA neutre ──────────────── */}
          <div className="flex items-start gap-3 p-4 bg-[#DDEAD5]/30 border border-[#DDEAD5] rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <FaBuilding className="text-[#2E7D32]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm">{branch.branch_name}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MdLocationOn className="shrink-0 text-[#2E7D32]" />
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

          {/* Info — ce que l'archivage implique (ambre = avertissement, pas rouge) */}
          {/* ─── Ancienne version (commentée) : "irréversible" mensonger ─
          <div className="bg-amber-50 ... ">
            <p>Attention : cette action est irréversible</p>
            <li>• Toutes les données ... perdues</li>
          */}
          {/* ─── Nouvelle version : info honnête sur les conséquences ───── */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 mb-1">
                Ce qui se passe quand vous archivez
              </p>
              <ul className="text-amber-700 space-y-0.5 text-xs">
                <li>• La branche disparaît de la liste active</li>
                <li>• Les employés ne pourront plus s'y rattacher</li>
                <li>• Les données restent conservées (historique préservé)</li>
                <li>• Vous pourrez la restaurer depuis l'onglet Archive</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Footer CAPOSA (style cohérent) ──────────────────────────── */}
        {/* ─── Ancienne version (commentée) : bouton rouge "Supprimer définitivement"
        <button className="bg-red-600 hover:bg-red-700 ...">
          Supprimer définitivement
        </button>
        */}

        {/* ─── Nouvelle version : bouton ambre "Archiver la branche" ──── */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isArchiving}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleArchive}
            disabled={isArchiving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all disabled:opacity-60 shadow-sm"
          >
            {isArchiving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Archivage…
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Archiver la branche
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBranchModal;