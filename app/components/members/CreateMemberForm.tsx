"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { createMember } from "@/app/lib/api/members";
import { memberUiSchema, type MemberUiForm, zodToFieldErrors, type FieldErrors, toMemberApiFormData } from "@/app/components/members/validations";

import { toMemberApiPayload, // ✅ map UI → API (department_code → department name)
  // If your API wrapper requires multipart, you can switch to:
  // toMemberApiFormData
} from "@/app/components/members/validations";

import {
  HAITI_DEPARTMENTS,
  type DepartmentCode,
} from "@/app/data/haitiLocations";

import { HaitiLocationSelector } from "@/app/components/members/HaitiLocationSelector";

// UI draft = allows "" for department_code before submit
type MemberUiFormDraft = Omit<MemberUiForm, "department_code"> & {
  department_code: DepartmentCode | "";
};

function isDepartmentCode(x: string): x is DepartmentCode {
  return HAITI_DEPARTMENTS.some((d) => d.code === x);
}

interface CreateMemberFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const CreateMemberForm: React.FC<CreateMemberFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<MemberUiFormDraft>({
    first_name: "",
    last_name: "",
    id_number: "",
    phone_number: "",
    department_code: "", // draft empty OK
    city: "",
    address: "",         // will be auto-composed from street + city
    gender: "M",
    date_of_birthday: "",
    email: "",
    initial_balance: undefined, // UI-only (not sent unless you choose)
    photo_profil: null,
  });

  const [street, setStreet] = useState<string>(""); // ✅ user types street only

  const [errors, setErrors] = useState<FieldErrors<MemberUiFormDraft>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ✅ Keep address synced as "<street>, <city>"
  useEffect(() => {
    const full = [street.trim(), formData.city.trim()].filter(Boolean).join(", ");
    setFormData((prev) => ({ ...prev, address: full }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [street, formData.city]);

  const handleChange = <K extends keyof MemberUiFormDraft>(field: K, value: MemberUiFormDraft[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const renderError = (field: keyof MemberUiFormDraft) =>
    errors[field] ? <span className="text-red-500 text-sm mt-1">{errors[field]}</span> : null;

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);

    // Guard: need a real department_code before strict validation
    if (!isDepartmentCode(formData.department_code)) {
      setErrors((p) => ({ ...p, department_code: "Département requis" }));
      return;
    }

    setIsSubmitting(true);
    try {
      // Cast to strict UI type (now that department_code is valid)
      const strictForm: MemberUiForm = {
        ...formData,
        department_code: formData.department_code,
      };

      // UI validation
      const parsed = memberUiSchema.parse(strictForm);

      // Map UI → API payload (ensures department NAME, not code)
      const payload = toMemberApiPayload(parsed);

      // If your API expects multipart:
      const fd = toMemberApiFormData(parsed, { includePhoto: false });
      await createMember(fd);


      setSuccessMessage("Membre créé avec succès!");
      setTimeout(onSuccess, 1200);
    } catch (e: any) {
      console.error("Erreur création membre:", e);
      if (e?.issues) setErrors(zodToFieldErrors<MemberUiFormDraft>(e));
      else setApiError(e?.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{apiError}</div>
      )}
      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Infos perso */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informations Personnelles</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              className={`w-full p-2 border rounded ${errors.first_name ? "border-red-500" : "border-gray-300"}`}
              placeholder="Prénom *"
              value={formData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            {renderError("first_name")}
          </div>

          <div>
            <input
              className={`w-full p-2 border rounded ${errors.last_name ? "border-red-500" : "border-gray-300"}`}
              placeholder="Nom *"
              value={formData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
            {renderError("last_name")}
          </div>

          <div>
            <input
              className={`w-full p-2 border rounded ${errors.id_number ? "border-red-500" : "border-gray-300"}`}
              placeholder="Numéro d'identité *"
              value={formData.id_number}
              onChange={(e) => handleChange("id_number", e.target.value)}
            />
            {renderError("id_number")}
          </div>

          <div>
            <input
              className={`w-full p-2 border rounded ${errors.phone_number ? "border-red-500" : "border-gray-300"}`}
              placeholder="Téléphone (chiffres uniquement) *"
              value={formData.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value.replace(/\D/g, ""))} // ✅ digits only
            />
            {renderError("phone_number")}
          </div>

          <div>
            <select
              className={`w-full p-2 border rounded ${errors.gender ? "border-red-500" : "border-gray-300"}`}
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value as MemberUiFormDraft["gender"])}
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
            {renderError("gender")}
          </div>

          <div>
            <input
              className={`w-full p-2 border rounded ${errors.date_of_birthday ? "border-red-500" : "border-gray-300"}`}
              type="date"
              value={formData.date_of_birthday}
              onChange={(e) => handleChange("date_of_birthday", e.target.value)}
            />
            {renderError("date_of_birthday")}
          </div>

          {/* Département / Ville */}
          <HaitiLocationSelector
            departmentCode={formData.department_code}
            city={formData.city}
            onDepartmentChange={(code) => handleChange("department_code", code)}
            onCityChange={(city) => handleChange("city", city)}
          />
        </div>

        {/* Street only — full address is auto composed as "<street>, <city>" */}
        <div>
          <input
            className={`w-full p-2 border rounded ${errors.address ? "border-red-500" : "border-gray-300"}`}
            placeholder="Rue / Adresse (sans ville) *  ex: 35, Tozin"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
            }}
          />
          {/* Live preview of composed address */}
          <p className="text-xs text-gray-500 mt-1">
            Adresse complète envoyée : <strong>{formData.address || "—"}</strong>
          </p>
          {renderError("address")}
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-6 border-t">
        {onCancel && (
          <Button variant="light" onPress={onCancel} isDisabled={isSubmitting}>
            Annuler
          </Button>
        )}
        <Button
          className="bg-[#34963d] text-white hover:bg-[#1e7367]"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          {isSubmitting ? "Création..." : "Créer le membre"}
        </Button>
      </div>
    </div>
  );
};

export default CreateMemberForm;
