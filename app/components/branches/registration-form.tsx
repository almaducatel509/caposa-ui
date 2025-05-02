"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Input,
  Button,
  DateInput,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { BranchData, branchSchema, ErrorMessages } from "./validations";
import { fetchOpeningHours, fetchHolidays, createBranch, fetchBranches } from "@/app/lib/api/branche";
import { useRouter } from "next/navigation";
import TitleDetails from "./title-details";

const RegisterForm = () => {
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
  const [openingHours, setOpeningHours] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hours, days, existingBranches] = await Promise.all([
          fetchOpeningHours(),
          fetchHolidays(),
          fetchBranches(),
        ]);
        setOpeningHours(hours);
        setHolidays(days);
        setBranches(existingBranches);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    loadData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = [
      "number_of_posts",
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
      (b) =>
        b.branch_name === formData.branch_name ||
        b.branch_email === formData.branch_email ||
        b.branch_phone_number === formData.branch_phone_number
    );

    if (found) {
      return `Une branche avec ce nom, téléphone ou courriel existe déjà.`;
    }

    return null;
  };

  const validate = () => {
    const result = branchSchema.safeParse(formData);
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
      onOpen();
      setIsSubmitting(false);
      return;
    }

    try {
      await createBranch(formData);
      setSuccessMessage("La branche a été créée avec succès !");
      onOpen();
    } catch {
      setApiError("Une erreur est survenue lors de la création.");
      onOpen();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
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
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="space-y-8">
      <TitleDetails text1="Branch Information" text2="Provide your branch details" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: "branch_name", label: "Branch Name" },
          { name: "branch_address", label: "Branch Address" },
          { name: "branch_phone_number", label: "Phone Number" },
          { name: "branch_email", label: "Email" },
        ].map((field) => (
          <Input
            key={field.name}
            name={field.name}
            label={field.label}
            value={(formData as any)[field.name]}
            onChange={handleChange}
            isInvalid={!!errors[field.name as keyof BranchData]}
            errorMessage={errors[field.name as keyof BranchData]}
          />
        ))}

        {[
          { name: "number_of_posts", label: "Number of Posts" },
          { name: "number_of_tellers", label: "Number of Tellers" },
          { name: "number_of_clerks", label: "Number of Clerks" },
          { name: "number_of_credit_officers", label: "Credit Officers" },
        ].map((field) => (
          <Input
            key={field.name}
            name={field.name}
            type="number"
            label={field.label}
            value={String((formData as any)[field.name])}
            onChange={handleChange}
            isInvalid={!!errors[field.name as keyof BranchData]}
            errorMessage={errors[field.name as keyof BranchData]}
          />
        ))}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Opening Date</label>
          <DateInput
            value={parseDate(formData.opening_date || "2024-01-01")}
            onChange={handleChangeDate}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Opening Hours</label>
          <select
            name="opening_hour"
            value={formData.opening_hour}
            onChange={(e) => setFormData({ ...formData, opening_hour: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select...</option>
            {openingHours.map((h) => (
              <option key={h.id} value={h.id}>
                {h.schedule}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-3">
          <label className="text-sm font-medium text-gray-700">Holidays</label>
          <Select
            selectionMode="multiple"
            selectedKeys={new Set(formData.holidays)}
            onSelectionChange={handleHolidaySelection}
            className="w-full"
          >
            {holidays.map((h) => (
              <SelectItem key={h.id}>
                {h.date} - {h.description}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-green-600 text-white"
          isDisabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Envoi..." : "Soumettre"}
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>{successMessage ? "Succès!" : "Erreur!"}</ModalHeader>
          <ModalBody>
            {successMessage ? (
              <p>{successMessage}</p>
            ) : (
              <p className="text-red-600">{apiError}</p>
            )}
          </ModalBody>
          <ModalFooter>
            {successMessage ? (
              <>
                <Button color="primary" onPress={handleCreateAnother}>
                  Créer un autre
                </Button>
                <Button color="success" onPress={() => router.push("/dashboard/branches")}>
                  Voir tout
                </Button>
              </>
            ) : (
              <Button color="danger" onPress={onClose}>
                Fermer
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegisterForm;
