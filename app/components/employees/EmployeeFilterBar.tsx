"use client";

import React from 'react';
import { Input, Select, SelectItem, Chip, Button } from "@nextui-org/react";
import { FaPlus, FaDownload, FaUpload } from "react-icons/fa6";
import { FiSearch } from 'react-icons/fi';
import { CiExport } from "react-icons/ci";

interface EmployeeFilterBarProps {
  filterValue: string;
  selectedFilter: string;
  selectedBranch: string;
  selectedStatus: string;
  branches: Array<{ id: string; branch_name: string }>;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onFilterChange: (key: string) => void;
  onBranchChange: (key: string) => void;
  onStatusChange: (key: string) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  totalCount: number;
  onTypeChange: (value: string) => void;
  onRefresh: () => void;

}

const EmployeeFilterBar: React.FC<EmployeeFilterBarProps> = ({
  filterValue,
  selectedFilter,
  selectedBranch,
  selectedStatus,
  branches,
  onSearchChange,
  onClear,
  onFilterChange,
  onBranchChange,
  onStatusChange,
  onAdd,
  onImport,
  onExport,
  onRefresh,
  totalCount,
}) => {
  const filterOptions = [
    { key: 'all', label: 'Tous' },
    { key: 'recent', label: 'Récents' },
    { key: 'thisMonth', label: 'Ce mois' },
    { key: 'thisYear', label: 'Cette année' },
  ];

  const statusOptions = [
    { key: 'all', label: 'Tous les statuts' },
    { key: 'active', label: 'Actifs' },
    { key: 'inactive', label: 'Inactifs' },
    { key: 'suspended', label: 'Suspendus' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Première ligne : Recherche et actions */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2 items-center flex-1 max-w-2xl">
          <Input
            isClearable
            size="sm"
            placeholder="Rechercher par nom, email, téléphone..."
            value={filterValue}
            startContent={<FiSearch />}
            onClear={onClear}
            onValueChange={onSearchChange}
            className="w-full max-w-md"
            aria-label="Rechercher dans les employés"
            classNames={{
              input: "text-sm",
              inputWrapper: "h-10"
            }}
          />
          
          <Chip 
            size="sm" 
            variant="flat" 
            color="primary"
            className="h-8 px-3"
          >
            {totalCount} {totalCount <= 1 ? 'employé' : 'employés'}
          </Chip>
        </div>

        <div className="flex gap-2">
          <Button 
            color="primary" 
            startContent={<FaPlus size={14} />}
            onPress={onAdd}
            className="border-2 border-green-600 h-10 px-4"
            size="sm"
          >
            Ajouter
          </Button>
          
          <Button 
            variant="bordered"
            startContent={<FaUpload size={14} />}
            onPress={onImport}
            className="border-2 border-slate-600 text-slate-600 h-10 px-4"
            size="sm"
          >
            Importer
          </Button>
          
          <Button 
            color="primary" 
            className="bg-green-600 text-white h-10 px-4"
            startContent={<CiExport size={16} />}
            variant="flat"
            onPress={onExport}
            size="sm"
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Deuxième ligne : Filtres */}
      <div className="flex gap-2 items-center flex-wrap">
        <Select
          size="sm"
          placeholder="Filtrer par période"
          selectedKeys={selectedFilter ? [selectedFilter] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0]?.toString();
            if (selected) {
              onFilterChange(selected);
            }
          }}
          className="w-44"
          aria-label="Filtrer par période"
          classNames={{
            trigger: "h-10",
          }}
        >
          {filterOptions.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          size="sm"
          placeholder="Filtrer par branche"
          selectedKeys={selectedBranch ? [selectedBranch] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0]?.toString();
            if (selected) {
              onBranchChange(selected);
            }
          }}
          className="w-48"
          aria-label="Filtrer par branche"
          classNames={{
            trigger: "h-10",
          }}
        >
          {[
            <SelectItem key="all" value="all">
              Toutes les branches
            </SelectItem>,
            ...branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.branch_name}
              </SelectItem>
            ))
          ] as any}
        </Select>

        <Select
          size="sm"
          placeholder="Filtrer par statut"
          selectedKeys={selectedStatus ? [selectedStatus] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0]?.toString();
            if (selected) {
              onStatusChange(selected);
            }
          }}
          className="w-44"
          aria-label="Filtrer par statut"
          classNames={{
            trigger: "h-10",
          }}
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          )) as any}
        </Select>
      </div>
    </div>
  );
};

export default EmployeeFilterBar;