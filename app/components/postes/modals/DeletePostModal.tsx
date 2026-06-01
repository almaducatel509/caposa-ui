"use client";

import React, { useState } from "react";
import { X, Archive, AlertTriangle, Loader2, ShieldCheck, Eye, EyeOff, User } from "lucide-react";
import { PostData } from "../validations";

/*
 * Soft delete — archive le poste (status: "inactive").
 * L'utilisateur doit entrer son ID employé.
 * Le système vérifie que cet ID appartient à un directeur ou à la maintenance.
 * Si non autorisé → erreur, le poste n'est pas archivé.
 */

/* ─── Modal générique ────────────────────────────────────────────────────── */

const Modal: React.FC<{
  isOpen: boolean; onClose: () => void; children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface DeletePostModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  post:      PostData | null;
  /**
   * Appelé quand l'utilisateur soumet son ID.
   * Le backend vérifie si cet employé a le rôle directeur ou maintenance.
   * Doit lever une erreur si l'ID n'est pas autorisé.
   */
  onArchive: (postId: string, employeeId: string) => Promise<void>;
}

/* ─── Composant principal ────────────────────────────────────────────────── */

const DeletePostModal: React.FC<DeletePostModalProps> = ({
  isOpen, onClose, onSuccess, post, onArchive,
}) => {
  const [employeeId,  setEmployeeId]  = useState("");
  const [showId,      setShowId]      = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);

  if (!post || !isOpen) return null;

  const handleClose = () => {
    if (isArchiving) return;
    setEmployeeId("");
    setApiError(null);
    onClose();
  };

  const handleArchive = async () => {
    if (!employeeId.trim()) {
      setApiError("Veuillez entrer votre ID employé.");
      return;
    }
    if (!post?.id) return;

    setIsArchiving(true);
    setApiError(null);

    try {
      await onArchive(post.id, employeeId.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      /*
       * Le backend retourne une erreur si l'ID n'appartient pas
       * à un directeur ou à la maintenance.
       */
      setApiError(
        err?.message ||
        "ID non autorisé. Seuls le directeur et la maintenance peuvent archiver un poste."
      );
    } finally {
      setIsArchiving(false);
    }
  };

  const permissions = [
    post.deposit    && { label: "Dépôt",     color: "#2E7D32", bg: "#DDEAD5" },
    post.withdrawal && { label: "Retrait",   color: "#D4AF37", bg: "#FFF4D6" },
    post.transfer  && { label: "Transfert", color: "#355C7D", bg: "#E6F1FB" },
  ].filter(Boolean) as { label: string; color: string; bg: string }[];

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>

      {/* ── Header blanc ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Archive className="text-amber-600" size={15} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Archiver le poste</h3>
            <p className="text-xs text-amber-600 mt-0.5">Action réversible — soft delete</p>
          </div>
        </div>
        <button onClick={handleClose} disabled={isArchiving}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40">
          <X size={18} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-6 space-y-4">

        {/* Erreur */}
        {apiError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {apiError}
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Archive className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Ce poste sera désactivé et déplacé dans les{" "}
            <span className="font-semibold">Archives</span>. L'historique est conservé
            et l'action est réversible.
          </p>
        </div>

        {/* Infos du poste */}
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
          <p className="text-sm font-semibold text-gray-900">{post.name}</p>
          <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>
          {permissions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {permissions.map(({ label, color, bg }) => (
                <span key={label}
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: bg, color }}>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Zone d'autorisation ── */}
        <div className="p-4 bg-white border-2 border-[#2E7D32]/20 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#2E7D32]">
              Autorisation requise
            </p>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Entrez votre <span className="font-semibold text-gray-700">ID employé</span>.
            Seuls les employés avec le rôle{" "}
            <span className="font-semibold text-gray-700">Directeur</span> ou{" "}
            <span className="font-semibold text-gray-700">Maintenance</span> sont autorisés.
          </p>

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">
              ID employé <span className="text-red-500">*</span>
            </p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type={showId ? "text" : "password"}
                value={employeeId}
                onChange={(e) => { setEmployeeId(e.target.value); setApiError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleArchive()}
                placeholder="Votre ID employé…"
                disabled={isArchiving}
                className="w-full h-10 pl-9 pr-10 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowId((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showId ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-gray-100 bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl">
        <button onClick={handleClose} disabled={isArchiving}
          className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50">
          Annuler
        </button>
        <button
          onClick={handleArchive}
          disabled={isArchiving || !employeeId.trim()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm">
          {isArchiving
            ? <><Loader2 className="w-4 h-4 animate-spin" />Archivage…</>
            : <><Archive size={14} />Archiver le poste</>
          }
        </button>
      </div>
    </Modal>
  );
};

export default DeletePostModal;