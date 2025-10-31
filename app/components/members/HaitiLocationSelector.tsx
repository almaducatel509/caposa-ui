import React, { useEffect, useState } from "react";
import { HAITI_DEPARTMENTS, getCitiesByDepartment, type DepartmentCode } from "@/app/data/haitiLocations";

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
        <select
          value={departmentCode}
          onChange={(e) => onDepartmentChange(e.target.value as DepartmentCode | "")}
          className="w-full p-2 border rounded"
        >
          <option value="">Sélectionnez un département</option>
          {HAITI_DEPARTMENTS.map(d => (
            <option key={d.code} value={d.code}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!departmentCode}
          className="w-full p-2 border rounded disabled:bg-gray-100"
        >
          <option value="">{departmentCode ? "Sélectionnez une ville" : "Choisissez d'abord un département"}</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};
