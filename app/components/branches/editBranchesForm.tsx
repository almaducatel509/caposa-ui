"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Button,
  Spinner,
} from "@nextui-org/react";
import { BranchData, OpeningHour, Holiday, ErrorMessages, branchSchema } from "./validations";
import { fetchOpeningHours, fetchHolidays, updateBranch, fetchBranches, getBranchById } from "@/app/lib/api/branche";
import BranchFormFields from "./BranchFormFields";

interface EditBranchProps {
  branchId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditBranch: React.FC<EditBranchProps> = ({ branchId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<BranchData>({
    branch_name: "",
    branch_address: "",
    branch_phone_number: "",
    branch_email: "",
    number_of_posts: 0,
    number_of_tellers: 0,
    number_of_clerks: 0,
    number_of_credit_officers: 0,
    opening_date: "",
    opening_hour: "",
    holidays: [],
  });

  const [errors, setErrors] = useState<ErrorMessages<BranchData>>({});
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calcul dynamique du nombre de postes
  const calculateTotalPosts = (tellers: number, clerks: number, creditOfficers: number) => {
    return tellers + clerks + creditOfficers;
  };

  // Mettre à jour le nombre de postes chaque fois que les sous-valeurs changent
  useEffect(() => {
    if (!isLoading) {  // N'exécuter que si le chargement est terminé
      const totalPosts = calculateTotalPosts(
        formData.number_of_tellers,
        formData.number_of_clerks,
        formData.number_of_credit_officers
      );
      
      setFormData(prev => ({
        ...prev,
        number_of_posts: totalPosts
      }));
    }
  }, [formData.number_of_tellers, formData.number_of_clerks, formData.number_of_credit_officers, isLoading]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [hours, days, existingBranches, branchData] = await Promise.all([
          fetchOpeningHours(),
          fetchHolidays(),
          fetchBranches(),
          getBranchById(branchId),
        ]);
        
        setOpeningHours(hours);
        setHolidays(days);
        setBranches(existingBranches);
        
        // Format the holidays array properly from branch data
        if (branchData && branchData.holidays) {
          // Définir un type pour les éléments de holidays
          type HolidayItem = string | { id: string };
          
          // Ensure holidays is an array of strings (IDs)
          const holidayIds = Array.isArray(branchData.holidays) 
            ? branchData.holidays.map((h: HolidayItem) => typeof h === 'object' ? h.id : h)
            : [];
          
          // Mettre à jour les données avec le total calculé
          const updatedData = {
            ...branchData,
            holidays: holidayIds
          };
          
          // Calculer le nombre de postes total
          updatedData.number_of_posts = calculateTotalPosts(
            updatedData.number_of_tellers,
            updatedData.number_of_clerks,
            updatedData.number_of_credit_officers
          );
          
          setFormData(updatedData);
        } else {
          setFormData(branchData || formData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setApiError("Impossible de charger les données de la branche.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (branchId) {
      loadData();
    }
  }, [branchId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = [
      "number_of_tellers",
      "number_of_clerks",
      "number_of_credit_officers"
    ];
    
    // Remarquez que nous avons retiré "number_of_posts" des champs numériques
    // car il est maintenant calculé automatiquement
    
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
    // Exclude the current branch from duplicate checks
    const found = branches.find(
      (b: BranchData) =>
        b.id !== branchId && // Important: exclude the branch being edited
        (b.branch_name === formData.branch_name ||
        b.branch_email === formData.branch_email ||
        b.branch_phone_number === formData.branch_phone_number)
    );

    if (found) {
      return `Une autre branche utilise déjà ce nom, cet email ou ce numéro.`;
    }

    return null;
  };

  const validate = () => {
    // S'assurer que number_of_posts est correctement calculé avant validation
    const updatedFormData = {
      ...formData,
      number_of_posts: calculateTotalPosts(
        formData.number_of_tellers,
        formData.number_of_clerks,
        formData.number_of_credit_officers
      )
    };
    
    const result = branchSchema.safeParse(updatedFormData);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    const duplicate = isDuplicateBranch();
    if (duplicate) {
      setApiError(duplicate);
      setIsSubmitting(false);
      return;
    }

    try {
      // S'assurer que number_of_posts est correctement calculé avant envoi
      const updatedFormData = {
        ...formData,
        number_of_posts: calculateTotalPosts(
          formData.number_of_tellers,
          formData.number_of_clerks,
          formData.number_of_credit_officers
        )
      };
      
      await updateBranch(branchId, updatedFormData);
      setSuccessMessage("La branche a été modifiée avec succès !");
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setApiError("Une erreur est survenue lors de la modification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {apiError}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <BranchFormFields
        formData={formData}
        errors={errors}
        openingHours={openingHours}
        holidays={holidays}
        handleChange={handleChange}
        handleChangeDate={handleChangeDate}
        handleHolidaySelection={handleHolidaySelection}
        isSubmitting={isSubmitting}
      />

      <div className="flex justify-end gap-2">
        <Button
          color="danger"
          variant="light"
          onPress={onClose}
          isDisabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          color="success"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
        </Button>
      </div>
    </div>
  );
};

export default EditBranch;