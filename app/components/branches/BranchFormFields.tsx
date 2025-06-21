"use client";

import React from "react";
import {
  Input,
  DateInput,
  Listbox,
  ListboxItem,
  Card,
  CardBody,
  Divider
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { appConfig } from "@/app/lib/actions";
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
  isEditMode?: boolean;    
  branch?: BranchData| null;       
}

const BranchFormFields: React.FC<BranchFormFieldsProps> = ({
  formData,
  errors,
  openingHours,
  holidays,
  handleChange,
  handleChangeDate,
  handleHolidaySelection,
  isSubmitting,
  isEditMode,
  branch
}) => {
  const isEdit = isEditMode && !!branch;

  const isDateEditable = !isEdit || (
    branch?.created_at &&
    new Date().getTime() - new Date(branch.created_at).getTime() <= 24 * 60 * 60 * 1000
  );

  const selectedHolidayKeys = React.useMemo(() => {
    let holidaysToProcess = formData.holidays;
    
    if (isEdit && (!formData.holidays || formData.holidays.length === 0) && branch?.holidays) {
      holidaysToProcess = branch.holidays;
    }

    if (!holidaysToProcess || !Array.isArray(holidaysToProcess)) {
      return new Set<string>();
    }
    
    const converted = holidaysToProcess.map(id => String(id));
    return new Set(converted);
  }, [formData.holidays, branch?.holidays, isEdit]);

  return (
    <div className="space-y-6">
      {/* Section 1: Informations de Base */}
      <Card className="shadow-md border border-gray-100">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">Informations de Base</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "branch_name", label: "Nom de la Branche", icon: "🏢" },
              { name: "branch_address", label: "Adresse Complète", icon: "📍" },
              { name: "branch_phone_number", label: "Numéro de Téléphone", icon: "📞" },
              { name: "branch_email", label: "Adresse Email", icon: "✉️" },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-lg">{field.icon}</span>
                  {field.label}
                </label>
                <Input
                  name={field.name}
                  value={(formData as any)[field.name] || ""}
                  onChange={handleChange}
                  isInvalid={!!errors[field.name as keyof BranchData]}
                  errorMessage={errors[field.name as keyof BranchData]}
                  isDisabled={isSubmitting}
                  variant="bordered"
                  size="sm"
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-gray-200 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Section 2: Personnel et Postes */}
      <Card className="shadow-md border border-gray-100">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">Personnel et Postes</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total automatique */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <span className="text-lg">📊</span>
                Total des Postes
              </label>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formData.number_of_posts}</div>
                <div className="text-xs text-green-500 mt-1">Calculé automatiquement</div>
              </div>
            </div>

            {/* Champs numériques */}
            {[
              { name: "number_of_tellers", label: "Caissiers", icon: "💰", color: "text-yellow-600" },
              { name: "number_of_clerks", label: "Personnel", icon: "👥", color: "text-blue-600" },
              { name: "number_of_credit_officers", label: "Agents de Crédit", icon: "💼", color: "text-purple-600" },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className={`text-sm font-medium text-gray-700 flex items-center gap-2`}>
                  <span className="text-lg">{field.icon}</span>
                  {field.label}
                </label>
                <Input
                  name={field.name}
                  type="number"
                  value={String((formData as any)[field.name] || 0)}
                  onChange={handleChange}
                  isInvalid={!!errors[field.name as keyof BranchData]}
                  errorMessage={errors[field.name as keyof BranchData]}
                  isDisabled={isSubmitting}
                  variant="bordered"
                  size="sm"
                  min="0"
                  classNames={{
                    input: "text-sm text-center font-medium",
                    inputWrapper: "border-gray-200 hover:border-green-400 focus-within:border-green-500"
                  }}
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Section 3: Configuration et Horaires */}
      <Card className="shadow-md border border-gray-100">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">Configuration et Horaires</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date d'ouverture */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">📅</span>
                Date d'Ouverture
                {!isDateEditable && (
                  <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full font-medium border border-red-200">
                    Non modifiable après 24h
                  </span>
                )}
              </label>
              <DateInput
                value={parseDate(formData.opening_date || appConfig.defaultDate)}
                onChange={handleChangeDate}
                isDisabled={!isDateEditable || isSubmitting}
                variant="bordered"
                size="sm"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-gray-200 hover:border-purple-400 focus-within:border-purple-500"
                }}
              />
            </div>

            {/* Heures d'ouverture */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <span className="text-lg">🕒</span>
                Heures d'Ouverture
              </label>
              <Card className="border border-gray-200 shadow-sm">
                <CardBody className="p-3">
                  <Listbox
                    selectionMode="single"
                    selectedKeys={formData.opening_hour ? new Set([String(formData.opening_hour)]) : new Set()}
                    onSelectionChange={(keys) => {
                      const selectedArray = Array.from(keys);
                      const selectedValue = selectedArray.length > 0 ? selectedArray[0] : "";
                      handleChange({ 
                        target: { 
                          name: "opening_hour", 
                          value: selectedValue 
                        } 
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    classNames={{
                      base: "w-full",
                      list: "max-h-[180px] overflow-y-auto",
                    }}
                    emptyContent="Aucun horaire disponible"
                  >
                    {openingHours.map((h) => (
                      <ListboxItem 
                        key={String(h.id)} 
                        textValue={h.schedule.split('\n')[0]}
                        className="py-2"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-800">
                            {h.schedule.split('\n')[0]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {h.schedule.split('\n').slice(1, 3).join(' • ')}
                          </div>
                        </div>
                      </ListboxItem>
                    ))}
                  </Listbox>
                </CardBody>
              </Card>
            </div>

            {/* Jours fériés */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <span className="text-lg">🎉</span>
                Jours Fériés
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {selectedHolidayKeys.size} sélectionné(s)
                </span>
              </label>
              <Card className="border border-gray-200 shadow-sm">
                <CardBody className="p-3">
                  <Listbox
                    selectionMode="multiple"
                    selectedKeys={selectedHolidayKeys}
                    onSelectionChange={handleHolidaySelection}
                    classNames={{
                      base: "w-full",
                      list: "max-h-[180px] overflow-y-auto",
                    }}
                    emptyContent="Aucun jour férié disponible"
                  >
                    {holidays.map((holiday) => (
                      <ListboxItem 
                        key={holiday.id} 
                        textValue={`${holiday.date} - ${holiday.description}`}
                        className="py-2"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-800">
                            {holiday.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            {holiday.description}
                          </div>
                        </div>
                      </ListboxItem>
                    ))}
                  </Listbox>
                </CardBody>
              </Card>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default BranchFormFields;