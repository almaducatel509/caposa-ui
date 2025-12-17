"use client";

import React from 'react';
import { Input, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FaPlus, FaUpload, FaDownload, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { FiSearch } from 'react-icons/fi';
import { MdKeyboardArrowDown } from 'react-icons/md';

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
  importLoading?: boolean;
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
  totalCount,
  importLoading = false,
}) => {
  const filterOptions = [
    { key: 'all', label: 'Tous', icon: FaFilter },
    { key: 'recent', label: 'Récents (30j)', icon: FaCalendarAlt },
    { key: 'thisMonth', label: 'Ce mois', icon: FaCalendarAlt },
    { key: 'thisYear', label: 'Cette année', icon: FaCalendarAlt },
  ];

  const branchOptions = [
    { key: 'all', label: 'Toutes les branches' },
    ...branches.map(b => ({ key: b.id, label: b.branch_name }))
  ];

  const statusOptions = [
    { key: 'all', label: 'Tous les statuts', color: 'default' },
    { key: 'active', label: 'Actifs', color: 'success' },
    { key: 'inactive', label: 'Inactifs', color: 'warning' },
    { key: 'suspended', label: 'Suspendus', color: 'danger' },
  ];

  const getFilterLabel = () => filterOptions.find(opt => opt.key === selectedFilter)?.label || 'Période';
  const getBranchLabel = () => branches.find(b => b.id === selectedBranch)?.branch_name || 'Toutes les branches';
  const getStatusLabel = () => statusOptions.find(opt => opt.key === selectedStatus)?.label || 'Tous les statuts';

  const activeFiltersCount = [
    selectedFilter !== 'all',
    selectedBranch !== 'all',
    selectedStatus !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header avec recherche et actions principales */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Recherche */}
        <div className="flex-1 w-full lg:max-w-xl">
          <Input
            isClearable
            size="lg"
            placeholder="Rechercher un employé par nom, email, téléphone..."
            value={filterValue}
            startContent={<FiSearch className="text-gray-400" size={20} />}
            onClear={onClear}
            onValueChange={onSearchChange}
            classNames={{
              base: "w-full",
              inputWrapper: "bg-white shadow-sm border-2 border-transparent hover:border-blue-200 focus-within:border-blue-500 transition-colors h-12",
              input: "text-sm"
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            color="success"
            startContent={<FaPlus size={16} />}
            onPress={onAdd}
            className="flex-1 lg:flex-none bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all h-12 px-6"
          >
            Ajouter
          </Button>
          <Button
            variant="bordered"
            startContent={<FaUpload size={16} />}
            onPress={onImport}
            isLoading={importLoading}
            isDisabled={importLoading}
            className="flex-1 lg:flex-none border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-medium h-12 px-6 transition-all"
          >
            {importLoading ? "Import..." : "Importer"}
          </Button>
          <Button
            variant="bordered"
            startContent={<FaDownload size={16} />}
            onPress={onExport}
            className="flex-1 lg:flex-none border-2 border-green-600 text-green-600 hover:bg-blue-50 font-medium h-12 px-6 transition-all"
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge nombre de résultats */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Résultats:</span>
            <Chip 
              size="lg" 
              variant="flat" 
              color="primary"
              className="font-bold text-base px-4"
            >
              {totalCount}
            </Chip>
          </div>

          <div className="h-8 w-px bg-gray-300 hidden sm:block" />

          {/* Filtres dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtre période */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  size="md"
                  startContent={<FaCalendarAlt className="text-blue-600" />}
                  endContent={<MdKeyboardArrowDown />}
                  className={`${
                    selectedFilter !== 'all' 
                      ? 'bg-blue-100 border-2 border-blue-400 text-blue-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-blue-300'
                  } transition-all`}
                >
                  {getFilterLabel()}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedFilter]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0]?.toString();
                  if (selected) onFilterChange(selected);
                }}
                selectionMode="single"
              >
                {filterOptions.map((option) => (
                  <DropdownItem 
                    key={option.key}
                    startContent={<option.icon className="text-blue-600" />}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Filtre branche */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  size="md"
                  startContent={<FaMapMarkerAlt className="text-green-600" />}
                  endContent={<MdKeyboardArrowDown />}
                  className={`${
                    selectedBranch !== 'all' 
                      ? 'bg-indigo-100 border-2 border-indigo-400 text-green-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                  } transition-all`}
                >
                  {getBranchLabel()}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedBranch]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0]?.toString();
                  if (selected) onBranchChange(selected);
                }}
                selectionMode="single"
              >
                {branchOptions.map((option) => (
                  <DropdownItem 
                    key={option.key}
                    startContent={<FaMapMarkerAlt className="text-indigo-600" />}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Filtre statut */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  size="md"
                  startContent={<FaCheckCircle className="text-green-600" />}
                  endContent={<MdKeyboardArrowDown />}
                  className={`${
                    selectedStatus !== 'all' 
                      ? 'bg-green-100 border-2 border-green-400 text-green-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-green-300'
                  } transition-all`}
                >
                  {getStatusLabel()}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0]?.toString();
                  if (selected) onStatusChange(selected);
                }}
                selectionMode="single"
              >
                {statusOptions.map((option) => (
                  <DropdownItem 
                    key={option.key}
                    startContent={<FaCheckCircle className="text-green-600" />}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Badge filtres actifs */}
            {activeFiltersCount > 0 && (
              <>
                <div className="h-8 w-px bg-gray-300 hidden sm:block" />
                <Chip 
                  size="sm" 
                  variant="flat" 
                  color="warning"
                  className="font-semibold"
                >
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                </Chip>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => {
                    onFilterChange('all');
                    onBranchChange('all');
                    onStatusChange('all');
                  }}
                  className="font-medium"
                >
                  Réinitialiser
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilterBar;