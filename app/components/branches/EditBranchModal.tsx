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
} from "@heroui/react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { BranchData, OpeningHour, Holiday, ErrorMessages, branchBaseSchema, branchActivationSchema } from "./validations";
import { fetchOpeningHours, fetchHolidays, updateBranch, createBranch, fetchBranches, getBranchById } from "@/app/lib/api/branche";
import BranchFormFields from "./BranchFormFields";

// Interface Branch
interface Branch extends BranchData {
  id: string;
  branch_code: string;
}

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch: Branch | null;
  isEditMode: boolean;
  mode?: 'create' | 'edit' | 'activate'; // 👈 AJOUT
  holidays?: Holiday[];    
}

const EditBranchModal: React.FC<EditBranchModalProps> = ({ 
  isOpen,
  onClose, 
  onSuccess,
  branch,
  isEditMode,
  mode = 'create', // 👈 AJOUT avec valeur par défaut
  holidays: passedHolidays = [],
}) => {
  console.log('🎯 BranchEditModal render:', {
    isOpen,
    branchName: branch?.branch_name,
    holidaysCount: passedHolidays.length,
    isEditMode,
    mode // 👈 AJOUT au log
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
    status: 'inactive', // 👈 AJOUT
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
        
        const [hours, days, existingBranches] = await Promise.all([
          fetchOpeningHours(),
          fetchHolidays(),
          fetchBranches(),
        ]);
        
        setOpeningHours(hours);
        setLocalHolidays(days);
        setBranches(existingBranches);
        
        if (isEditMode && branch) {
          let branchData;
          
          if (branch.id) {
            branchData = await getBranchById(branch.id);
          } else {
            branchData = branch;
          }
          
          if (branchData && branchData.holidays) {
            type HolidayItem = string | { id: string };
            
            const holidayIds = Array.isArray(branchData.holidays) 
              ? branchData.holidays.map((h: HolidayItem) => typeof h === 'object' ? h.id : h)
              : [];
            
            const updatedData = {
              ...branchData,
              holidays: holidayIds,
              status: mode === 'activate' ? 'active' : (branchData.status || 'inactive'), // 👈 AJOUT
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
          // Mode création
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
            status: 'inactive', // 👈 AJOUT
          });
        }
        
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setApiError("Impossible de charger les données de la branche.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      loadData();
    }
  }, [isOpen, isEditMode, branch, mode]); // 👈 AJOUT mode dans les dépendances

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
    const updatedFormData = {
      ...formData,
      number_of_posts: calculateTotalPosts(
        formData.number_of_tellers,
        formData.number_of_clerks,
        formData.number_of_credit_officers
      ),
      status: mode === 'activate' ? 'active' : formData.status,
    };
    
    // 👇 CHOIX DU SCHÉMA SELON LE MODE
    const schema = mode === 'activate' ? branchActivationSchema : branchBaseSchema;
    const result = schema.safeParse(updatedFormData);
    
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
        ),
        status: mode === 'activate' ? 'active' : formData.status, // 👈 AJOUT
      };
      
      if (isEditMode && branch?.id) {
        await updateBranch(branch.id, updatedFormData);
        setSuccessMessage(
          mode === 'activate' 
            ? "La branche a été activée avec succès !" 
            : "La branche a été modifiée avec succès !"
        );
      } else {
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
      setApiError(
        `Une erreur est survenue lors de ${
          mode === 'activate' ? "l'activation" : isEditMode ? 'la modification' : 'la création'
        }.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // 👇 TITRE DYNAMIQUE SELON LE MODE
  const getModalTitle = () => {
    if (mode === 'activate') return "Activer la branche";
    if (isEditMode) return "Modifier la branche";
    return "Nouvelle branche";
  };

  const getModalSubtitle = () => {
    if (mode === 'activate') return "Configurer les horaires et activer";
    if (isEditMode) return "Mettre à jour les informations";
    return "Créer une nouvelle branche";
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="5xl"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[95vh]",
        wrapper: "z-[9999]",
        backdrop: "z-[9998]",
        body: "overflow-y-auto max-h-[85vh] px-6 shadow-inner"
      }}
    >
      <ModalContent>
        <ModalHeader 
          className="flex items-center gap-3 bg-linear-to-r from-[#34963d] to-[#1e7367] text-white"
        >
          {mode === 'activate' ? <FaEdit /> : isEditMode ? <FaEdit /> : <FaPlus />}
          <div>
            <h3 className="text-lg font-bold">{getModalTitle()}</h3>
            <p className="text-sm opacity-90">{getModalSubtitle()}</p>
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
            holidays={holidaysToUse}
            handleChange={handleChange}
            handleChangeDate={handleChangeDate}
            handleHolidaySelection={handleHolidaySelection}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            branch={branch}
            mode={mode} // 👈 AJOUT
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
              ? (mode === 'activate' ? "Activation..." : isEditMode ? "Modification..." : "Création...") 
              : (mode === 'activate' ? "Activer" : isEditMode ? "Modifier" : "Créer")
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditBranchModal;