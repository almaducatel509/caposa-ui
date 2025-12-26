"use client";

import React from "react";
import {
  Input,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { FiSearch } from "react-icons/fi";
import { FaPlus, FaClock } from "react-icons/fa6";
import { CiExport } from "react-icons/ci";
import { MdKeyboardArrowDown } from "react-icons/md";

interface ScheduleFilterBarProps {
  filterValue: string;
  selectedFilter: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onFilterChange: (key: string) => void;
  onAdd: () => void;
  onExport: () => void;
  totalCount: number;
}

const ScheduleFilterBar: React.FC<ScheduleFilterBarProps> = ({
  filterValue,
  selectedFilter,
  onSearchChange,
  onClear,
  onFilterChange,
  onAdd,
  onExport,
  totalCount,
}) => {
  const filterOptions = [
    { key: "all", label: "Tous" },
    { key: "current", label: "En cours" },
    { key: "upcoming", label: "À venir" },
    { key: "expired", label: "Expirés" },
    { key: "withHolidays", label: "Avec jours fériés" },
  ];

  const getFilterLabel =
    () => filterOptions.find((f) => f.key === selectedFilter)?.label || "Filtrer";

  const isFiltered = selectedFilter !== "all";

  return (
    <div className="space-y-4">
      {/* ===== HEADER : SEARCH + ACTIONS ===== */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="flex-1 w-full lg:max-w-xl">
          <Input
            isClearable
            size="lg"
            value={filterValue}
            placeholder="Rechercher un horaire..."
            startContent={<FiSearch size={20} className="text-gray-400" />}
            onClear={onClear}
            onValueChange={onSearchChange}
            classNames={{
              base: "w-full",
              inputWrapper:
                "bg-white shadow-sm border-2 border-transparent hover:border-emerald-200 focus-within:border-emerald-500 h-12 transition-colors",
              input: "text-sm",
            }}
            aria-label="Rechercher dans les horaires"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            color="success"
            startContent={<FaPlus size={16} />}
            onPress={onAdd}
            className="flex-1 lg:flex-none bg-linear-to-r from-green-600 to-green-700 text-white font-semibold shadow-lg hover:shadow-xl h-12 px-6"
          >
            Ajouter
          </Button>

          <Button
            variant="bordered"
            startContent={<CiExport size={18} />}
            onPress={onExport}
            className="flex-1 lg:flex-none h-12 px-6 border-green-600 text-green-600"
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="bg-linear-to-r from-emerald-50 via-white to-teal-50 rounded-xl p-4 shadow-sm border border-emerald-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Result count */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              Résultats :
            </span>
            <Chip
              size="lg"
              variant="flat"
              color="success"
              className="font-bold px-4"
            >
              {totalCount}
            </Chip>
          </div>

          <div className="h-8 w-px bg-gray-300 hidden sm:block" />

          {/* Filter dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                startContent={<FaClock className="text-emerald-600" />}
                endContent={<MdKeyboardArrowDown />}
                className={`${
                  isFiltered
                    ? "bg-emerald-100 border-2 border-emerald-400 text-emerald-700 font-semibold"
                    : "bg-white border-2 border-gray-200 hover:border-emerald-300"
                }`}
              >
                {getFilterLabel()}
              </Button>
            </DropdownTrigger>

            <DropdownMenu
              selectedKeys={[selectedFilter]}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0]?.toString();
                if (key) onFilterChange(key);
              }}
            >
              {filterOptions.map((option) => (
                <DropdownItem key={option.key}>
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Active filter indicator */}
          {isFiltered && (
            <>
              <div className="h-8 w-px bg-gray-300 hidden sm:block" />
              <Chip size="sm" color="warning" variant="flat">
                1 filtre actif
              </Chip>
              <Button
                size="sm"
                variant="light"
                color="danger"
                onPress={() => onFilterChange("all")}
              >
                Réinitialiser
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilterBar;
