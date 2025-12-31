"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { X } from "lucide-react";

import { FaEdit, FaPlus } from "react-icons/fa";
import { BranchData, ErrorMessages, branchBaseSchema, branchActivationSchema, BranchFormData } from "./validations";
import { fetchOpeningHours, fetchHolidays, updateBranch, createBranch, fetchBranches, getBranchById } from "@/app/lib/api/branche";
import BranchFormFields from "./BranchFormFields";
import type { Branch, Holiday, OpeningHour } from "@/types/branche";

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch: Branch | null;
  isEditMode: boolean;
  mode?: "create" | "edit"; 
  holidays?: Holiday[];
}

const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch,
  isEditMode,
  mode = "create",
  holidays: passedHolidays = [],
}) => {
  console.log('🎯 BranchEditModal render:', {
    isOpen,
    branchName: branch?.branch_name,
    holidaysCount: passedHolidays.length,
    isEditMode,
    mode 
  });
    const [formData, setFormData] = useState<BranchFormData>({
    branch_name: "",
    branch_address: "",
    branch_phone_number: "",
    branch_email: "",
    department_code: "OUEST",
    city: "",
    number_of_posts: 0,
    number_of_tellers: 0,
    number_of_clerks: 0,
    number_of_credit_officers: 0,
    opening_date: "",
    opening_hour: undefined,
    holidays: [],
    status: "inactive", // reste pour le backend mais n'est plus géré comme "activate"
  });

  const [errors, setErrors] = useState<ErrorMessages<BranchData>>({});
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [localHolidays, setLocalHolidays] = useState<Holiday[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const holidaysToUse = passedHolidays.length > 0 ? passedHolidays : localHolidays;

  console.log('🎯 DEBUG holidays:', {
    passedHolidaysCount: passedHolidays.length,
    localHolidaysCount: localHolidays.length,
    holidaysToUseCount: holidaysToUse.length,
    usingPassedHolidays: passedHolidays.length > 0
  });

  // Calcul dynamique du nombre de postes
  const calculateTotalPosts = (tellers: number, clerks: number, creditOfficers: number) => {
    return tellers + clerks + creditOfficers;
  };

  // Mettre à jour le nombre de postes chaque fois que les sous-valeurs changent
 useEffect(() => {
    const totalPosts = calculateTotalPosts(
      formData.number_of_tellers,
      formData.number_of_clerks,
      formData.number_of_credit_officers
    );
    setFormData((prev) => ({ ...prev, number_of_posts: totalPosts }));
  }, [formData.number_of_tellers, formData.number_of_clerks, formData.number_of_credit_officers]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [hours, days, existingBranches] = await Promise.all([
          fetchOpeningHours(),
          fetchHolidays(),
          fetchBranches(),
        ]);
        setOpeningHours(hours);
        setLocalHolidays(days);
        setBranches(existingBranches);

        if (isEditMode && branch) {
          const branchDataFromApi = branch.id ? await getBranchById(branch.id) : branch;

          const holidayIds = Array.isArray(branchDataFromApi.holidays)
            ? branchDataFromApi.holidays.map((h: Holiday) => (typeof h === "object" ? h.id : h))
            : [];

          setFormData({
            branch_name: branchDataFromApi.branch_name,
            branch_address: branchDataFromApi.branch_address,
            branch_phone_number: branchDataFromApi.branch_phone_number,
            branch_email: branchDataFromApi.branch_email,
            department_code: branchDataFromApi.department_code ?? "OUEST",
            city: branchDataFromApi.city ?? "",
            number_of_tellers: branchDataFromApi.number_of_tellers,
            number_of_clerks: branchDataFromApi.number_of_clerks,
            number_of_credit_officers: branchDataFromApi.number_of_credit_officers,
            number_of_posts: calculateTotalPosts(
              branchDataFromApi.number_of_tellers,
              branchDataFromApi.number_of_clerks,
              branchDataFromApi.number_of_credit_officers
            ),
            opening_date: branchDataFromApi.opening_date,
            opening_hour: branchDataFromApi.opening_hour,
            holidays: holidayIds,
            status: branchDataFromApi.status ?? "inactive",
          });
        }
      } catch (error) {
        console.error(error);
        setApiError("Impossible de charger les données de la branche.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) loadData();
  }, [isOpen, isEditMode, branch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = [
      "number_of_tellers",
      "number_of_clerks",
      "number_of_credit_officers"
    ];
    
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleChangeDate = (date: any) => {
    setFormData((prev) => ({
      ...prev,
      opening_date: date.toString(),
    }));
  };

  const handleHolidaySelection = (selected: any) => {
    const ids = Array.from(selected) as string[];
    setFormData((prev) => ({ ...prev, holidays: ids }));
  };

  const isDuplicateBranch = (): string | null => {
    const found = branches.find(
      (b: BranchData) =>
        b.id !== branch?.id &&
        (b.branch_name === formData.branch_name ||
        b.branch_email === formData.branch_email ||
        b.branch_phone_number === formData.branch_phone_number)
    );

    if (found) {
      return `Une autre branche utilise déjà ce nom, cet email ou ce numéro.`;
    }

    return null;
  };

  // 👇 VALIDATION ADAPTÉE AU MODE
   const validate = () => {
    const result = branchBaseSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ErrorMessages<BranchData> = {};
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof BranchData;
        fieldErrors[key] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // const handleSubmit = async () => {
  //   setIsSubmitting(true);
  //   setApiError(null);
  //   setSuccessMessage(null);

  //   if (!validate()) {
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   const duplicate = isDuplicateBranch();
  //   if (duplicate) {
  //     setApiError(duplicate);
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   try {
  //     const updatedFormData = {
  //       ...formData,
  //       number_of_posts: calculateTotalPosts(
  //         formData.number_of_tellers,
  //         formData.number_of_clerks,
  //         formData.number_of_credit_officers
  //       ),
  //       status: mode === 'activate' ? 'active' : formData.status, // 👈 AJOUT
  //     };
      
  //     if (isEditMode && branch?.id) {
  //       await updateBranch(branch.id, updatedFormData);
  //       setSuccessMessage(
  //         mode === 'activate' 
  //           ? "La branche a été activée avec succès !" 
  //           : "La branche a été modifiée avec succès !"
  //       );
  //     } else {
  //       await createBranch(updatedFormData);
  //       setSuccessMessage("La branche a été créée avec succès !");
  //     }
      
  //     if (onSuccess) {
  //       setTimeout(() => {
  //         onSuccess();
  //         onClose();
  //       }, 1500);
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de la sauvegarde :", error);
  //     setApiError(
  //       `Une erreur est survenue lors de ${
  //         mode === 'activate' ? "l'activation" : isEditMode ? 'la modification' : 'la création'
  //       }.`
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

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
        city: formData.city,
        status: formData.status,
      };

      if (isEditMode && branch?.id) await updateBranch(branch.id, payload);
      else await createBranch(payload);

      setSuccessMessage(isEditMode ? "Branche modifiée avec succès !" : "Branche créée avec succès !");
      onSuccess && setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (error) {
      console.error(error);
      setApiError("Une erreur est survenue lors de la sauvegarde de la branche.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading) 
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center gap-3">
            <div className="flex justify-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
              <span className="text-[#34963d]">Chargement...</span>
            </div>
          </div>
      </Modal>
    );
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <div className="bg-linear-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl relative">
          <button 
          onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
          <h3 className="text-xl font-bold">{isEditMode ? "Modifier la branche" : "Nouvelle branche"}</h3>
          <p className="text-sm opacity-90 mt-1">
            {isEditMode ? "Mettre à jour les informations de la branche" : "Créer un nouvelle branche"}
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {apiError && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{apiError}</div>}
          {successMessage && <div className="p-3 bg-red-100 border border-green-400 text-green-700 rounded">{successMessage}</div>}

          <BranchFormFields
            formData={formData}
            errors={errors}
            openingHours={openingHours}
            holidays={holidaysToUse}
            handleChange={handleChange}
            handleChangeDate={handleChangeDate}
            handleHolidaySelection={handleHolidaySelection}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            branch={branch}
            mode={mode}
          />
        </div>

        <div className="border-t bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium">Annuler</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">
            {isSubmitting ? "En cours..." : isEditMode ? "Modifier" : "Créer"}
          </button>
        </div>
      </Modal>
    );
};

export default EditBranchModal;