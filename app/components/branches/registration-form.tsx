"use client";

import React, { useEffect, useState, ChangeEvent, useMemo } from "react";
import { 
  Input, 
  Button, 
  Select, 
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Chip,
  Divider,
  Spinner,
  useDisclosure,
  DateInput
} from "@nextui-org/react";
import { BranchData, branchSchema, ErrorMessages, Holiday } from "./validations";
import { fetchOpeningHours, fetchHolidays, createBranch, fetchBranches } from "@/app/lib/api/branche";
import { useRouter } from "next/navigation";
import TitleDetails from "./title-details";
import { today, parseDate } from "@internationalized/date";
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle
} from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { debounce } from 'lodash';

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
    opening_date: new Date().toISOString().split("T")[0], // ← aujourd'hui
    opening_hour: "",
    holidays: [],
  });

  const [errors, setErrors] = useState<ErrorMessages<BranchData>>({});
  const [openingHours, setOpeningHours] = useState<any[]>([]);
  // const [holidays, setHolidays] = useState<any[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [checking, setChecking] = useState({ email: false, phone: false });
  const router = useRouter();

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
    
    setFormData(prev => ({
      ...prev,
      number_of_posts: totalPosts
    }));
  }, [formData.number_of_tellers, formData.number_of_clerks, formData.number_of_credit_officers]);

   useEffect(() => {
    const loadData = async () => {
      try {
        const [hours, days] = await Promise.all([
          fetchOpeningHours(),
          fetchHolidays(),
        ]);
        setOpeningHours(hours);
        setHolidays(days);
        setLoadingHolidays(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setLoadingHolidays(false);
      }
    };
    loadData();
  }, []);

// Vérification d'unicité
  const checkUniqueness = async (field: 'email' | 'phone', value: string) => {
    try {
      setChecking(prev => ({ ...prev, [field]: true }));
      
      const response = await fetch(`/api/branches/check-unique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: field === 'email' ? 'branch_email' : 'branch_phone_number',
          value
        })
      });
      const { isUnique } = await response.json();
      if (!isUnique) {
        setErrors(prev => ({
          ...prev,
          [field === 'email' ? 'branch_email' : 'branch_phone_number']: 
            `Ce ${field === 'email' ? 'courriel' : 'numéro'} existe déjà`
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field === 'email' ? 'branch_email' : 'branch_phone_number'];
          return newErrors;
        });
      }

      return isUnique;
    } catch (error) {
      console.error(`Erreur vérification:`, error);
      return false;
    } finally {
      setChecking(prev => ({ ...prev, [field]: false }));
    }
  };
 const debouncedCheckEmail = useMemo(
    () => debounce((value: string) => checkUniqueness('email', value), 500),
    []
  );

  const debouncedCheckPhone = useMemo(
    () => debounce((value: string) => checkUniqueness('phone', value), 500),
    []
  );

  // const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   const numericFields = [
  //     "number_of_tellers",
  //     "number_of_clerks",
  //     "number_of_credit_officers"
  //   ];
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: numericFields.includes(name) ? Number(value) : value,
  //   }));
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Vérification d'unicité
    if (name === 'branch_email' && value.includes('@')) {
      debouncedCheckEmail(value);
    }
    if (name === 'branch_phone_number' && value.length >= 10) {
      debouncedCheckPhone(value);
    }
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
    // setApiError(null);
    setApiError('');

    setSuccessMessage(null);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }
// Vérifier l'unicité avant soumission
    const [emailUnique, phoneUnique] = await Promise.all([
      checkUniqueness('email', formData.branch_email),
      checkUniqueness('phone', formData.branch_phone_number)
    ]);

    if (!emailUnique || !phoneUnique) {
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
      opening_date: new Date().toISOString().split('T')[0],
      opening_hour: '',
      holidays: [],
    });
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
    onClose();
  };

   return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header moderne */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl">
            <FaBuilding className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nouvelle Branche</h1>
            <p className="text-gray-500">Remplissez les informations de votre branche</p>
          </div>
        </div>
      </div>

      {/* Formulaire par sections */}
      <div className="space-y-6">
        {/* Section Informations générales */}
        <Card className="shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBuilding className="text-emerald-600" />
              <h2 className="text-lg font-semibold">Informations générales</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="branch_name"
                label="Nom de la branche"
                placeholder="Ex: Branche Centre-Ville"
                value={formData.branch_name}
                onChange={handleChange}
                startContent={<FaBuilding className="text-gray-400" />}
                isInvalid={!!errors.branch_name}
                errorMessage={errors.branch_name}
                variant="bordered"
                radius="lg"
              />
              
              <Input
                name="branch_address"
                label="Adresse"
                placeholder="123 Rue Example"
                value={formData.branch_address}
                onChange={handleChange}
                startContent={<FaMapMarkerAlt className="text-gray-400" />}
                isInvalid={!!errors.branch_address}
                errorMessage={errors.branch_address}
                variant="bordered"
                radius="lg"
              />
              
              <Input
                name="branch_phone_number"
                label="Téléphone"
                placeholder="+1 234 567 8900"
                value={formData.branch_phone_number}
                onChange={handleChange}
                startContent={<FaPhone className="text-gray-400" />}
                endContent={checking.phone && <Spinner size="sm" />}
                isInvalid={!!errors.branch_phone_number}
                errorMessage={errors.branch_phone_number}
                variant="bordered"
                radius="lg"
              />
              
              <Input
                name="branch_email"
                label="Email"
                placeholder="branche@example.com"
                value={formData.branch_email}
                onChange={handleChange}
                startContent={<FaEnvelope className="text-gray-400" />}
                endContent={checking.email && <Spinner size="sm" />}
                isInvalid={!!errors.branch_email}
                errorMessage={errors.branch_email}
                variant="bordered"
                radius="lg"
              />
            </div>
          </CardBody>
        </Card>

        {/* Section Personnel */}
        <Card className="shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BsPeopleFill className="text-emerald-600" />
              <h2 className="text-lg font-semibold">Personnel</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                name="number_of_tellers"
                type="number"
                label="Caissiers"
                value={String(formData.number_of_tellers)}
                onChange={handleChange}
                startContent={<FaUsers className="text-gray-400" />}
                isInvalid={!!errors.number_of_tellers}
                errorMessage={errors.number_of_tellers}
                variant="bordered"
                radius="lg"
                min="0"
              />
              
              <Input
                name="number_of_clerks"
                type="number"
                label="Commis"
                value={String(formData.number_of_clerks)}
                onChange={handleChange}
                startContent={<FaUsers className="text-gray-400" />}
                isInvalid={!!errors.number_of_clerks}
                errorMessage={errors.number_of_clerks}
                variant="bordered"
                radius="lg"
                min="0"
              />
              
              <Input
                name="number_of_credit_officers"
                type="number"
                label="Agents de crédit"
                value={String(formData.number_of_credit_officers)}
                onChange={handleChange}
                startContent={<FaUsers className="text-gray-400" />}
                isInvalid={!!errors.number_of_credit_officers}
                errorMessage={errors.number_of_credit_officers}
                variant="bordered"
                radius="lg"
                min="0"
              />
              
              <div className="flex items-end">
                <Card className="w-full bg-emerald-50 border-emerald-200">
                  <CardBody className="py-3 px-4">
                    <p className="text-xs text-emerald-600 mb-1">Total postes</p>
                    <p className="text-2xl font-bold text-emerald-700">{formData.number_of_posts}</p>
                  </CardBody>
                </Card>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Section Horaires */}
        <Card className="shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaClock className="text-emerald-600" />
              <h2 className="text-lg font-semibold">Horaires et dates</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Date d'ouverture
                </label>
                <DateInput
                  value={parseDate(formData.opening_date)}
                  isReadOnly
                  variant="bordered"
                  radius="lg"
                  description="Automatiquement définie à aujourd'hui"
                />
              </div>
              
              <Select
                label="Heures d'ouverture"
                selectedKeys={formData.opening_hour ? [formData.opening_hour] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFormData({ ...formData, opening_hour: value });
                }}
                variant="bordered"
                radius="lg"
              >
                {openingHours.map((hour) => (
                  <SelectItem key={hour.id} value={hour.id}>
                    {hour.schedule}
                  </SelectItem>
                ))}
              </Select>
              
              <Select
                label="Jours fériés"
                selectionMode="multiple"
                selectedKeys={new Set(formData.holidays)}
                onSelectionChange={handleHolidaySelection}
                variant="bordered"
                radius="lg"
                isLoading={loadingHolidays}
                placeholder="Sélectionnez les jours"
                renderValue={(items) => {
                  return (
                    <div className="flex gap-1">
                      <Chip size="sm" variant="flat" color="success">
                        {items.length} sélectionné(s)
                      </Chip>
                    </div>
                  );
                }}
              >
                {holidays
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((holiday) => (
                    <SelectItem key={holiday.id} value={holiday.id}>
                      {new Date(holiday.date).toLocaleDateString('fr-FR')}
                    </SelectItem>
                  ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="light"
            radius="lg"
            onPress={() => router.push("/dashboard/branches")}
          >
            Annuler
          </Button>
          <Button
            color="success"
            radius="lg"
            isLoading={isSubmitting}
            onPress={handleSubmit}
            startContent={!isSubmitting && <FaCheckCircle />}
          >
            {isSubmitting ? "Création..." : "Créer la branche"}
          </Button>
        </div>
      </div>

      {/* Modal de résultat */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} radius="lg">
        <ModalContent>
          <ModalHeader>
            {successMessage ? (
              <div className="flex items-center gap-2 text-green-600">
                <FaCheckCircle />
                <span>Succès!</span>
              </div>
            ) : (
              <span className="text-red-600">Erreur</span>
            )}
          </ModalHeader>
          <ModalBody>
            <p className={successMessage ? "text-green-700" : "text-red-600"}>
              {successMessage || apiError}
            </p>
          </ModalBody>
          <ModalFooter>
            {successMessage ? (
              <>
                <Button variant="light" onPress={handleCreateAnother}>
                  Créer une autre
                </Button>
                <Button 
                  color="success" 
                  onPress={() => router.push("/dashboard/branches")}
                >
                  Voir les branches
                </Button>
              </>
            ) : (
              <Button color="danger" variant="light" onPress={onClose}>
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
