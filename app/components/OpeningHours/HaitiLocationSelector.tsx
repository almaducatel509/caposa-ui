"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Building2 } from "lucide-react";
import { DepartmentCode } from "./validations";
import { HAITI_DEPARTMENTS, getCitiesByDepartment } from "./mock";
import CapSelect from "./CapSelect";

interface HaitiLocationSelectorProps {
  departmentCode: DepartmentCode | "";
  city: string;
  onDepartmentChange: (code: DepartmentCode | "") => void;
  onCityChange: (city: string) => void;
}

export default function HaitiLocationSelector({
  departmentCode, city, onDepartmentChange, onCityChange,
}: HaitiLocationSelectorProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CapSelect
        label="Département"
        value={departmentCode}
        icon={<MapPin className="w-4 h-4" />}
        onChange={v => onDepartmentChange(v as DepartmentCode | "")}
      >
        <option value="">Tous les départements</option>
        {HAITI_DEPARTMENTS.map(d => (
          <option key={d.code} value={d.code}>{d.name}</option>
        ))}
      </CapSelect>

      <CapSelect
        label="Ville"
        value={city}
        disabled={!departmentCode}
        icon={<Building2 className="w-4 h-4" />}
        onChange={onCityChange}
      >
        <option value="">
          {departmentCode ? "Toutes les villes" : "Choisissez d'abord un département"}
        </option>
        {cities.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </CapSelect>
    </div>
  );
}