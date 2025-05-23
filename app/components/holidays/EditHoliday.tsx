"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Spinner
} from "@nextui-org/react";
import { fetchHolidays, updateHoliday, HolidayAPI } from "@/app/lib/api/holiday";
import { FiEdit } from "react-icons/fi";
import HolidayFormFields from "./HolidayFormFields";
import { holidaySchema } from "./validations";
import { Holiday, convertToHoliday } from "@/app/dashboard/holidays/columns";

interface EditHolidayProps {
  holiday: Holiday;
  onSuccess?: () => void;
  onClose: () => void;
}

const EditHoliday: React.FC<EditHolidayProps> = ({ holiday, onSuccess }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<Holiday>({
    id: holiday.id || "",
    date: holiday.date || "",
    description: holiday.description || "",
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existingHolidays, setExistingHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    // Charger la liste des jours fériés pour les vérifications de duplication
    const loadHolidays = async () => {
      try {
        const apiHolidays = await fetchHolidays();
        // Convertir HolidayAPI[] en Holiday[]
        const holidays = apiHolidays.map(apiHoliday => convertToHoliday(apiHoliday));
        setExistingHolidays(holidays);
      } catch (error) {
        console.error("Erreur lors de la récupération des jours fériés:", error);
      }
    };

    if (isOpen) {
      loadHolidays();
      // Réinitialiser le formulaire avec les données du jour férié
      setFormData({
        id: holiday.id || "",
        date: holiday.date || "",
        description: holiday.description || "",
      });
    }
  }, [isOpen, holiday]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Version simplifiée et fiable pour l'Input de type "date"
const handleChangeDate = (dateValue: string) => {
  // Si la valeur est déjà au format YYYY-MM-DD (cas le plus courant avec Input type="date")
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    console.log("Date reçue (format ISO):", dateValue);
    setFormData(prev => ({ ...prev, date: dateValue }));
    return;
  }
  
  // Cas de secours (ne devrait presque jamais se produire avec Input type="date")
  console.warn("Format de date inattendu:", dateValue);
  try {
    // Si c'est un autre format de chaîne, tenter de le convertir
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
      console.log("Date convertie:", formattedDate);
      setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  } catch (error) {
    console.error("Erreur lors du traitement de la date:", error);
  }
};
  const validate = (): boolean => {
    const result = holidaySchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: any = {};
      result.error.errors.forEach((error) => {
        const key = error.path[0] as keyof Holiday;
        newErrors[key] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const isDuplicateHoliday = (newHoliday: Holiday): string | null => {
    const duplicate = existingHolidays.find(
      (h) => 
        h.id !== newHoliday.id && // Exclure l'élément actuel
        (h.date === newHoliday.date || h.description === newHoliday.description)
    );

    if (duplicate) {
      return duplicate.date === newHoliday.date
        ? `Un jour férié pour la date ${newHoliday.date} existe déjà.`
        : `Un jour férié avec la description "${newHoliday.description}" existe déjà.`;
    }

    return null;
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    const duplicateMessage = isDuplicateHoliday(formData);
    if (duplicateMessage) {
      setApiError(duplicateMessage);
      setIsSubmitting(false);
      return;
    }

    try {
      // S'assurer que l'ID est disponible
      if (!formData.id) {
        throw new Error("ID du jour férié manquant");
      }
      
      console.log("Sending update for holiday:", formData);
      
      // Convertir Holiday en HolidayAPI pour l'API
      const apiHoliday: HolidayAPI = {
        date: formData.date,
        description: formData.description
      };
      
      // Utiliser updateHoliday avec l'ID explicite
      await updateHoliday(formData.id, apiHoliday);
      
      setSuccessMessage("Le jour férié a été modifié avec succès !");
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setApiError("Une erreur est survenue lors de la modification. Vérifiez la console pour plus de détails.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Button
        isIconOnly
        variant="light"
        onPress={onOpen}
        className="text-default-400 cursor-pointer"
      >
        <FiEdit className="text-lg" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        backdrop="blur"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <div>
              <ModalHeader className="flex items-center gap-2">
                <FiEdit className="text-primary" />
                Modifier un jour férié
              </ModalHeader>
              
              <ModalBody>
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
                
                <HolidayFormFields
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                  handleChangeDate={handleChangeDate}
                  isSubmitting={isSubmitting}
                />
              </ModalBody>
              
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? "Mise à jour..." : "Enregistrer"}
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default EditHoliday;