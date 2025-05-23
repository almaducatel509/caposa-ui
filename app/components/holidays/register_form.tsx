"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Holiday, holidaySchema, ErrorMessages } from "./validations";
import { fetchHolidays, createHoliday, HolidayAPI } from "@/app/lib/api/holiday";
import { useRouter } from "next/navigation"; 
import HolidayFormFields from "./HolidayFormFields";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<Holiday>({
    date: "",
    description: "",
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ErrorMessages<Holiday>>({});
  const [existingHolidays, setExistingHolidays] = useState<HolidayAPI[]>([]);
  
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const holidays = await fetchHolidays();
        setExistingHolidays(holidays);
      } catch (error) {
        console.error("Erreur lors de la récupération des jours fériés :", error);
      }
    };

    loadHolidays();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction optimisée pour éviter le décalage de fuseau horaire
// Version simplifiée pour Input type="date"
const handleChangeDate = (dateValue: any) => {
  // Si c'est une chaîne au format YYYY-MM-DD (cas normal avec Input type="date")
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    setFormData(prev => ({ ...prev, date: dateValue }));
    return;
  }
  
  // Cas de secours (si dateValue n'est pas au format attendu)
  try {
    // Si c'est un autre format de chaîne ou un objet Date
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
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
      const newErrors: ErrorMessages<Holiday> = {};
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
      (holiday) =>
        holiday.date === newHoliday.date || holiday.description === newHoliday.description
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
      onOpen();
      setIsSubmitting(false);
      return;
    }

    try {
      // Créer l'objet à envoyer à l'API
      const apiData: HolidayAPI = {
        date: formData.date,
        description: formData.description
      };
      
      console.log("Données à envoyer à l'API:", apiData);
      
      // Appeler la fonction API
      await createHoliday(apiData);
      
      setSuccessMessage("Le jour férié a été créé avec succès !");
      onOpen();

      const updatedHolidays = await fetchHolidays();
      setExistingHolidays(updatedHolidays);
      setFormData({ date: "", description: "" });
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setApiError("Une erreur est survenue lors de la création.");
      onOpen();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setFormData({ date: "", description: "" });
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="space-y-6">
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
      
      {/* Utilisation du composant HolidayFormFields avec date au format ISO */}
      <HolidayFormFields
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleChangeDate={handleChangeDate}
        isSubmitting={isSubmitting}
      />

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <Button
          color="primary"
          className="font-medium"
          onClick={handleSubmit}
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Envoi..." : "Soumettre"}
        </Button>
      </div>

      {/* Modal */}
      {typeof window !== "undefined" && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <div>
                <ModalHeader>{successMessage ? "Succès!" : "Erreur!"}</ModalHeader>
                <ModalBody>
                  {successMessage ? (
                    <p>{successMessage}</p>
                  ) : (
                    <p className="text-red-500">{apiError}</p>
                  )}
                </ModalBody>
                <ModalFooter>
                  {successMessage ? (
                    <div>
                      <Button color="primary" onPress={handleCreateAnother}>
                        Créer un autre
                      </Button>
                      <Button color="success" onPress={() => router.push("/dashboard/holidays")}>
                        Voir tout
                      </Button>
                    </div>
                  ) : (
                    <Button color="danger" onPress={onClose}>
                      Fermer
                    </Button>
                  )}
                </ModalFooter>
              </div>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default RegisterForm;