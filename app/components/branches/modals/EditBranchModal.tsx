"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { FaEdit, FaPlus } from "react-icons/fa";

import {
  BranchData,
  ErrorMessages,
  branchBaseSchema,
  BranchFormData,
} from "../validations";
import {
  fetchBranches,
  updateBranch,
  createBranch,
  getBranchById,
} from "@/app/lib/api/branche";
import BranchFormFields from "../BranchFormFields";
import type { Branch, Holiday } from "@/types/branche";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch: Branch | null;
  isEditMode: boolean;
  mode?: "create" | "edit";
  holidays?: Holiday[];
}

/* ─── Modal générique ────────────────────────────────────────────────────── */

const SIZES: Record<string, string> = {
  sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg",
  xl: "max-w-xl", "2xl": "max-w-2xl", "3xl": "max-w-3xl", "4xl": "max-w-4xl",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: keyof typeof SIZES;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = "lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative ${SIZES[size]} w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        {children}
      </div>
    </div>
  );
};

/* ─── Valeurs initiales ──────────────────────────────────────────────────── */

const INITIAL_FORM: BranchFormData = {
  branch_name: "", branch_address: "", branch_phone_number: "", branch_email: "",
  department_code: "OUEST", city: "",
  number_of_posts: 0, number_of_tellers: 0, number_of_clerks: 0, number_of_credit_officers: 0,
  opening_date: "", opening_hour: undefined, holidays: [], status: "inactive",
};

/* ─── Composant principal ────────────────────────────────────────────────── */

const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen, onClose, onSuccess, branch, isEditMode, mode = "create",
}) => {
  const [formData, setFormData]             = useState<BranchFormData>(INITIAL_FORM);
  const [errors, setErrors]                 = useState<ErrorMessages<BranchData>>({});
  const [branches, setBranches]             = useState<BranchData[]>([]);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isLoading, setIsLoading]           = useState(true);
  const [apiError, setApiError]             = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* ── Auto total postes ── */
  useEffect(() => {
    const total = formData.number_of_tellers + formData.number_of_clerks + formData.number_of_credit_officers;
    setFormData((prev) => ({ ...prev, number_of_posts: total }));
  }, [formData.number_of_tellers, formData.number_of_clerks, formData.number_of_credit_officers]);

  /* ── Chargement ── */
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const existingBranches = await fetchBranches();
        setBranches(existingBranches);

        if (isEditMode && branch) {
          const data = branch.id ? await getBranchById(branch.id) : branch;
          const holidayIds = Array.isArray(data.holidays)
            ? data.holidays.map((h: Holiday) => typeof h === "object" ? h.id : h)
            : [];
          setFormData({
            branch_name: data.branch_name, branch_address: data.branch_address,
            branch_phone_number: data.branch_phone_number, branch_email: data.branch_email,
            department_code: data.department_code ?? "OUEST", city: data.city ?? "",
            number_of_tellers: data.number_of_tellers, number_of_clerks: data.number_of_clerks,
            number_of_credit_officers: data.number_of_credit_officers,
            number_of_posts: data.number_of_tellers + data.number_of_clerks + data.number_of_credit_officers,
            opening_date: data.opening_date, opening_hour: data.opening_hour,
            holidays: holidayIds, status: data.status ?? "inactive",
          });
        } else if (!isEditMode) {
          setFormData(INITIAL_FORM);
        }
      } catch (err) {
        console.error(err);
        setApiError("Impossible de charger les données.");
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) loadData();
  }, [isOpen, isEditMode, branch]);

  /* ── Handler ── */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numeric = ["number_of_tellers", "number_of_clerks", "number_of_credit_officers"];
    setFormData((prev) => ({ ...prev, [name]: numeric.includes(name) ? Number(value) : value }));
  };

  /* ── Validation ── */
  const isDuplicateBranch = (): string | null => {
    const found = branches.find((b: BranchData) =>
      b.id !== branch?.id &&
      (b.branch_name === formData.branch_name || b.branch_email === formData.branch_email || b.branch_phone_number === formData.branch_phone_number)
    );
    return found ? "Une autre branche utilise déjà ce nom, cet email ou ce numéro." : null;
  };

  const validate = (): boolean => {
    const result = branchBaseSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ErrorMessages<BranchData> = {};
      result.error.errors.forEach((e) => { fieldErrors[e.path[0] as keyof BranchData] = e.message; });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);
    if (!validate()) { setIsSubmitting(false); return; }
    const duplicate = isDuplicateBranch();
    if (duplicate) { setApiError(duplicate); setIsSubmitting(false); return; }
    try {
      const payload: BranchData = {
        ...formData,
        id: branch?.id ?? crypto.randomUUID(),
        branch_code: branch?.branch_code ?? "",
        number_of_posts: formData.number_of_posts ?? 0,
        opening_hour: formData.opening_hour ?? "",
        created_at: branch?.created_at,
        updated_at: new Date().toISOString(),
        department_code: formData.department_code,
        city: formData.city, status: formData.status,
      };
      if (isEditMode && branch?.id) await updateBranch(branch.id, payload);
      else await createBranch(payload);
      setSuccessMessage(isEditMode ? "Branche modifiée avec succès !" : "Branche créée avec succès !");
      if (onSuccess) setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      console.error(err);
      setApiError("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  /* ── Loading ── */
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#2E7D32]" />
          <span className="text-sm text-gray-500">Chargement…</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">

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
              {isEditMode ? "Modifier la branche" : "Nouvelle branche"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEditMode
                ? "Mettre à jour les informations de la branche"
                : "Créer une nouvelle branche"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
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
        <BranchFormFields
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          branch={branch}
          mode={mode}
          onOpeningHourChange={(id) =>
            setFormData((prev) => ({ ...prev, opening_hour: id || undefined }))
          }
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

export default EditBranchModal;