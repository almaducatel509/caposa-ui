"use client";

import React from "react";
import {
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { FiSearch } from "react-icons/fi";
import {
  FaPlus,
  FaDownload,
  FaFilter,
  FaBuilding,
  FaCheckCircle,
} from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";

interface BranchFilterBarProps {
  filterValue: string;
  selectedSize: string;
  selectedStatus: string;
  totalCount: number;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onSizeChange: (key: string) => void;
  onStatusChange: (key: string) => void;
  onAdd: () => void;
  onExport: () => void;
}

const BranchFilterBar: React.FC<BranchFilterBarProps> = ({
  filterValue,
  selectedSize,
  selectedStatus,
  totalCount,
  onSearchChange,
  onClear,
  onSizeChange,
  onStatusChange,
  onAdd,
  onExport,
}) => {
  /* ================== OPTIONS ================== */

  const sizeOptions = [
    { key: "all", label: "Toutes les tailles" },
    { key: "small", label: "Petites (< 10 employés)" },
    { key: "medium", label: "Moyennes (10–19 employés)" },
    { key: "large", label: "Grandes (20+ employés)" },
  ];

  const statusOptions = [
    { key: "all", label: "Tous les statuts" },
    { key: "active", label: "Actives" },
    { key: "inactive", label: "Inactives" },
  ];

  const getSizeLabel =
    () => sizeOptions.find(o => o.key === selectedSize)?.label || "Taille";

  const getStatusLabel =
    () => statusOptions.find(o => o.key === selectedStatus)?.label || "Statut";

  const activeFiltersCount = [
    selectedSize !== "all",
    selectedStatus !== "all",
  ].filter(Boolean).length;

  /* ================== RENDER ================== */

  return (
    <div className="space-y-4">
      {/* 🔍 Recherche + actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Recherche */}
        <div className="relative w-full lg:max-w-xl">
          <FiSearch
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />

          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher une branche par nom, ville, téléphone..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full h-12 pl-12 pr-12
              rounded-xl text-sm
              bg-white shadow-sm
              border-2 border-transparent
              hover:border-green-200
              focus:border-green-500 focus:outline-none
              transition-colors
            "
          />

          {filterValue && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onClear();
              }}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                p-1 rounded-md
                text-gray-400
                hover:text-gray-600
                hover:bg-gray-100
              "
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            color="success"
            startContent={<FaPlus />}
            onPress={onAdd}
            className="
              flex-1 lg:flex-none
              bg-linear-to-r from-green-600 to-green-700
              text-white font-semibold
              h-12 px-6 rounded-md
            "
          >
            Nouvelle branche
          </Button>

          <Button
            variant="bordered"
            startContent={<FaDownload />}
            onPress={onExport}
            className="
              flex-1 lg:flex-none
              border-2 border-green-600
              text-green-600
              hover:bg-green-50
              h-12 px-6 rounded-md
            "
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* 🎛️ Filtres */}
      <div className="bg-linear-to-r from-purple-50 via-white to-pink-50 rounded-xl p-4 shadow-sm border border-purple-100">
        <div className="flex flex-wrap items-center gap-3">

          {/* Résultats */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Résultats:</span>
            <Chip 
              size="lg" 
              variant="flat" 
              color="secondary"
              className="font-bold text-base px-4"
            >
              {totalCount}
            </Chip>
          </div>

          <div className="h-8 w-px bg-gray-300 hidden sm:block" />

          {/* Taille */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                startContent={<FaBuilding />}
                endContent={<MdKeyboardArrowDown />}
                className={selectedSize !== "all"
                  ? "bg-green-100 border-2 border-green-400 font-semibold"
                  : "bg-white border-2 border-gray-200"}
              >
                {getSizeLabel()}
              </Button>
            </DropdownTrigger>

            <DropdownMenu
              selectedKeys={[selectedSize]}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0]?.toString();
                if (v) onSizeChange(v);
              }}
            >
              {sizeOptions.map(opt => (
                <DropdownItem key={opt.key}>
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Statut */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                startContent={<FaCheckCircle />}
                endContent={<MdKeyboardArrowDown />}
                className={selectedStatus !== "all"
                  ? "bg-green-100 border-2 border-green-400 font-semibold"
                  : "bg-white border-2 border-gray-200"}
              >
                {getStatusLabel()}
              </Button>
            </DropdownTrigger>

            <DropdownMenu
              selectedKeys={[selectedStatus]}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0]?.toString();
                if (v) onStatusChange(v);
              }}
            >
              {statusOptions.map(opt => (
                <DropdownItem key={opt.key}>
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Filtres actifs */}
          {activeFiltersCount > 0 && (
            <>
              <div className="h-8 w-px bg-gray-300 hidden sm:block" />
              <Chip size="sm" color="warning">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""} actif
              </Chip>
              <Button
                size="sm"
                variant="light"
                color="danger"
                onPress={() => {
                  onSizeChange("all");
                  onStatusChange("all");
                }}
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

export default BranchFilterBar;
