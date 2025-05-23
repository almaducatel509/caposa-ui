"use client";

import React from "react";
import {
  Input,
  Select,
  SelectItem,
  DateInput
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { BranchData, OpeningHour, Holiday, ErrorMessages } from "./validations";

interface BranchFormFieldsProps {
  formData: BranchData;
  errors: ErrorMessages<BranchData>;
  openingHours: OpeningHour[];
  holidays: Holiday[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeDate: (date: any) => void;
  handleHolidaySelection: (selected: any) => void;
  isSubmitting: boolean;
}

const BranchFormFields: React.FC<BranchFormFieldsProps> = ({
  formData,
  errors,
  openingHours,
  holidays,
  handleChange,
  handleChangeDate,
  handleHolidaySelection,
  isSubmitting
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Branch Information Fields */}
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
          value={(formData as any)[field.name] || ""}
          onChange={handleChange}
          isInvalid={!!errors[field.name as keyof BranchData]}
          errorMessage={errors[field.name as keyof BranchData]}
          isDisabled={isSubmitting}
        />
      ))}

      {/* Champ en lecture seule pour le nombre total de postes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Number of Posts (Total)</label>
        <div className="w-full px-3 py-2 border rounded-md bg-gray-50">
          {formData.number_of_posts}
        </div>
        <p className="text-xs text-gray-500">Calculé automatiquement</p>
      </div>

      {/* Numeric Fields - Sans number_of_posts */}
      {[
        { name: "number_of_tellers", label: "Number of Tellers" },
        { name: "number_of_clerks", label: "Number of Clerks" },
        { name: "number_of_credit_officers", label: "Credit Officers" },
      ].map((field) => (
        <Input
          key={field.name}
          name={field.name}
          type="number"
          label={field.label}
          value={String((formData as any)[field.name] || 0)}
          onChange={handleChange}
          isInvalid={!!errors[field.name as keyof BranchData]}
          errorMessage={errors[field.name as keyof BranchData]}
          isDisabled={isSubmitting}
        />
      ))}

      {/* Date and Time Fields */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Opening Date</label>
        <DateInput
          value={parseDate(formData.opening_date || "2024-01-01")}
          onChange={handleChangeDate}
          isDisabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Opening Hours</label>
        <select
          name="opening_hour"
          value={formData.opening_hour || ""}
          onChange={(e) => handleChange({ target: { name: "opening_hour", value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting}
        >
          <option value="">Select...</option>
          {openingHours.map((h) => (
            <option key={h.id} value={h.id}>
              {h.schedule}
            </option>
          ))}
        </select>
      </div>

      {/* Holiday Selection */}
      <div className="space-y-2 md:col-span-3">
        <label className="text-sm font-medium text-gray-700">Holidays</label>
        <Select
          selectionMode="multiple"
          selectedKeys={new Set(formData.holidays || [])}
          onSelectionChange={handleHolidaySelection}
          className="w-full"
          isDisabled={isSubmitting}
        >
          {holidays.map((h: Holiday) => (
            <SelectItem key={h.id}>
              {h.date} - {h.description}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default BranchFormFields;