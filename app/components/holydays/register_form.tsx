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
  Textarea,
  DateInput,
} from "@nextui-org/react";
import { Holiday, holidaySchema, ErrorMessages } from "./validations";
import { fetchHolydays, createHoliday } from "@/app/lib/api/holiday";
import { useRouter } from "next/navigation"; 
import TitleDetails from "./title-details";
import { parseDate } from "@internationalized/date";


const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<Holiday>({
    date: "",
    description: "",
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ErrorMessages<Holiday>>({});
  const [existingHolidays, setExistingHolidays] = useState<Holiday[]>([]);
  

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const holidays = await fetchHolydays();
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

  const handleChangeDate = (dateValue: any) => {
    const formattedDate = dateValue.toString();
    setFormData((prev) => ({ ...prev, date: formattedDate }));
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
      await createHoliday(formData);
      setSuccessMessage("Le jour férié a été créé avec succès !");
      onOpen();

      const updatedHolidays = await fetchHolydays();
      setExistingHolidays(updatedHolidays);
      setFormData({ date: "", description: "" });
    } catch (error) {
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
    <div className="border-1 rounded-md shadow-md px-6 mb-6">
      <TitleDetails text1="Informations" text2="Fournir vos informations" />

      <div className=" ">
        {/* Date input */}
          <div className="space-y-1 py-2">
            <label htmlFor="holiday_date" className="text-sm text-gray-700 font-semibold">
              Date
            </label>
            <DateInput
              aria-label="Date"
              description=""
              value={parseDate(formData.date || "1804-01-01")}
              onChange={handleChangeDate}
              className="w-40"
              classNames={{
                base: "bg-white",
                input: "bg-white text-black",
                inputWrapper: "bg-white border border-gray-300 rounded-dm",
              }}
              variant="bordered"
              isInvalid={!!errors.date}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          {/* Description input */}
          <div className="space-y-1 my-2">
            <label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <Textarea
              placeholder="Enter your description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              minRows={3}
              className="w-96"
              variant="bordered"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end my-4">
          <Button
            className="bg-green-600 text-white"
            onClick={handleSubmit}
            isDisabled={isSubmitting}
          >
            {isSubmitting ? "Envoi..." : "Soumettre"}
          </Button>
        </div>

        {/* Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <>
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
                  <>
                    <Button color="primary" onPress={handleCreateAnother}>
                      Créer un autre
                    </Button>
                    <Button color="success" onPress={() => router.push("/dashboard/holydays")}>
                      Voir tout
                    </Button>
                  </>
                ) : (
                  <Button color="danger" onPress={onClose}>
                    Fermer
                  </Button>
                )}
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>
      </div>
    );
  };

export default RegisterForm;
