"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Button,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { BranchData, OpeningHour, Holiday, ErrorMessages, branchSchema } from "./validations";
import { fetchOpeningHours, fetchHolidays, updateBranch, createBranch, fetchBranches, getBranchById } from "@/app/lib/api/branche";
import BranchFormFields from "./BranchFormFields";

// Interface Branch (ajoutez-la si elle n'existe pas)
interface Branch extends BranchData {
  id: string;
  branch_code: string;
}

// ✅ Props corrigées pour correspondre à l'utilisation dans BranchesTable
interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch: Branch | null;
  isEditMode: boolean;
  holidays?: Holiday[];    
}

const EditBranchModal: React.FC<EditBranchModalProps> = ({ 
  isOpen,
  onClose, 
  onSuccess,
  branch,
  isEditMode,
    holidays: passedHolidays = [],
 
}) => {
  console.log('🎯 BranchEditModal render:', {
    isOpen,
    branchName: branch?.branch_name,
    holidaysCount: passedHolidays.length,
    isEditMode
  });
 
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
   // ✅ RENOMMAGE : holidays → localHolidays pour éviter le conflit
  const [localHolidays, setLocalHolidays] = useState<Holiday[]>([]);
  
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // ✅ LOGIQUE HOLIDAYS AMÉLIORÉE
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
    if (!isLoading) {
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
        
        // Charger les données de base (horaires et jours fériés)
        const [hours, days, existingBranches] = await Promise.all([
          fetchOpeningHours(),
          fetchHolidays(),
          fetchBranches(),
        ]);
        
        setOpeningHours(hours);
        setLocalHolidays(days);
        setBranches(existingBranches);
        
        // ✅ Initialiser les données selon le mode
        if (isEditMode && branch) {
          // Mode édition : charger les données de la branche
          let branchData;
          
          if (branch.id) {
            // Charger les données fraîches depuis l'API
            branchData = await getBranchById(branch.id);
          } else {
            // Utiliser les données passées en props
            branchData = branch;
          }
          
          // Format the holidays array properly from branch data
          if (branchData && branchData.holidays) {
            type HolidayItem = string | { id: string };
            
            const holidayIds = Array.isArray(branchData.holidays) 
              ? branchData.holidays.map((h: HolidayItem) => typeof h === 'object' ? h.id : h)
              : [];
            
            const updatedData = {
              ...branchData,
              holidays: holidayIds
            };
            
            updatedData.number_of_posts = calculateTotalPosts(
              updatedData.number_of_tellers,
              updatedData.number_of_clerks,
              updatedData.number_of_credit_officers
            );
            
            setFormData(updatedData);
          } else {
            setFormData(branchData || formData);
          }
        } else {
          // Mode création : garder les données vides
          setFormData({
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
        }
        
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setApiError("Impossible de charger les données de la branche.");
      } finally {
        setIsLoading(false);
      }
    };
    
    // ✅ Charger les données quand le modal s'ouvre
    if (isOpen) {
      loadData();
    }
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
        b.id !== branch?.id && // ✅ Utiliser branch?.id au lieu de branchId
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
      const updatedFormData = {
        ...formData,
        number_of_posts: calculateTotalPosts(
          formData.number_of_tellers,
          formData.number_of_clerks,
          formData.number_of_credit_officers
        )
      };
      
      if (isEditMode && branch?.id) {
        // ✅ Mode édition
        await updateBranch(branch.id, updatedFormData);
        setSuccessMessage("La branche a été modifiée avec succès !");
      } else {
        // ✅ Mode création
        await createBranch(updatedFormData);
        setSuccessMessage("La branche a été créée avec succès !");
      }
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      setApiError(`Une erreur est survenue lors de la ${isEditMode ? 'modification' : 'création'}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Retourner null si le modal est fermé
  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalBody className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" className="text-[#34963d]" />
              <span className="text-[#34963d]">Chargement...</span>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal 
       isOpen={isOpen} 
      onClose={onClose} 
      size="5xl"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[95vh]",
        body: "overflow-y-auto max-h-[85vh] px-6 shadow-inner"
      }}
      // className="z-[50]" // ✅ Ensure dropdown appears over everything
    >
      <ModalContent>
        <ModalHeader 
          className="flex items-center gap-3 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white"
        >          {isEditMode ? <FaEdit /> : <FaPlus />}
          <div>
            <h3 className="text-lg font-bold">
              {isEditMode ? "Modifier la branche" : "Nouvelle branche"}
            </h3>
            <p className="text-sm opacity-90">
              {isEditMode ? "Mettre à jour les informations" : "Créer une nouvelle branche"}
            </p>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-6 space-y-6 border overflow-y-auto max-h-[85vh]">
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {apiError}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
              {successMessage}
            </div>
          )}

          <BranchFormFields
            formData={formData}
            errors={errors}
            openingHours={openingHours}
            holidays={holidaysToUse} // ✅ ici !
            handleChange={handleChange}
            handleChangeDate={handleChangeDate}
            handleHolidaySelection={handleHolidaySelection}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            branch={branch}  // ← branch est déjà de type BranchData
          />
        </ModalBody>
        
        <ModalFooter className="bg-gray-50">
          <Button 
            variant="light" 
            onPress={onClose}
            isDisabled={isSubmitting}
            className="text-[#2c2e2f]"
          >
            Annuler
          </Button>
          <Button 
            className="bg-[#34963d] text-white hover:bg-[#1e7367] transition-colors"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditMode ? "Modification..." : "Création...") 
              : (isEditMode ? "Modifier" : "Créer")
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditBranchModal;