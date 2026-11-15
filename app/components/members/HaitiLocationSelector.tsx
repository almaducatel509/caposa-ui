import React, { useEffect, useState } from "react";
import { HAITI_DEPARTMENTS, getCitiesByDepartment, type DepartmentCode } from "@/app/data/haitiLocations";
import SearchableSelect from "@/app/components/ui/SearchableSelect";

type Props = {
  departmentCode: DepartmentCode | "";
  city: string;
  onDepartmentChange: (code: DepartmentCode | "") => void;
  onCityChange: (city: string) => void;
};

export const HaitiLocationSelector: React.FC<Props> = ({
  departmentCode,
  city,
  onDepartmentChange,
  onCityChange,
}) => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (departmentCode) {
      const list = getCitiesByDepartment(departmentCode as DepartmentCode);
      setCities(list);
      if (city && !list.includes(city)) onCityChange("");
    } else {
      setCities([]);
      onCityChange("");
    }
  }, [departmentCode]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Département *</label>
        <SearchableSelect
          options={HAITI_DEPARTMENTS.map(d => ({ value: d.code, label: d.name }))}
          value={departmentCode}
          onChange={(val) => onDepartmentChange(val as DepartmentCode | "")}
          placeholder="Sélectionnez un département"
          searchPlaceholder="Rechercher un département..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
        <SearchableSelect
          options={cities.map(c => ({ value: c, label: c }))}
          value={city}
          onChange={(val) => onCityChange(val)}
          disabled={!departmentCode}
          placeholder={departmentCode ? "Sélectionnez une ville" : "Choisissez d'abord un département"}
          searchPlaceholder="Rechercher une ville..."
        />
      </div>
    </div>
  );
};
