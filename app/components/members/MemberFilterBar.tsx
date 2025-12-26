"use client";

import React from 'react';
import { Input, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FaPlus, FaUpload, FaDownload, FaFilter, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { FiSearch } from 'react-icons/fi';
import { MdKeyboardArrowDown } from 'react-icons/md';

interface MemberFilterBarProps {
  filterValue: string;
  selectedFilter: string;
  selectedStatus: string;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onFilterChange: (key: string) => void;
  onStatusChange: (key: string) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  totalCount: number;
  importLoading?: boolean;
}

const MemberFilterBar: React.FC<MemberFilterBarProps> = ({
  filterValue,
  selectedFilter,
  selectedStatus,
  onSearchChange,
  onClear,
  onFilterChange,
  onStatusChange,
  onAdd,
  onImport,
  onExport,
  totalCount,
  importLoading = false,
}) => {
  // Options de filtre par période
  const filterOptions = [
    { key: 'all', label: 'Tous', icon: FaFilter },
    { key: 'recent', label: 'Récents (30j)', icon: FaCalendarAlt },
    { key: 'thisMonth', label: 'Ce mois', icon: FaCalendarAlt },
    { key: 'thisYear', label: 'Cette année', icon: FaCalendarAlt },
  ];

  // Options de filtre par statut
  const statusOptions = [
    { key: 'all', label: 'Tous les statuts', color: 'default' },
    { key: 'active', label: 'Actifs', color: 'success' },
    { key: 'inactive', label: 'Inactifs', color: 'warning' },
    { key: 'suspended', label: 'Suspendus', color: 'danger' },
  ];

  const getFilterLabel = 
  () => filterOptions.find(opt => opt.key === selectedFilter)?.label || 'Période';
  const getStatusLabel = 
  () => statusOptions.find(opt => opt.key === selectedStatus)?.label || 'Tous les statuts';

  const activeFiltersCount = [
    selectedFilter !== 'all',
    selectedStatus !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header avec recherche et actions principales */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        
         <div className="relative w-full lg:max-w-xl">
                  {/* Search icon (always visible) */}
            <FiSearch
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
  
            {/* Input */}
            <input
              type="text"
              value={filterValue}
              placeholder="Rechercher un membre par nom, email, téléphone..."
              onChange={(e) => onSearchChange(e.target.value)}
              className="
                w-full h-12 pl-12 pr-12
                rounded-xl text-sm
                bg-white shadow-sm
                border-2 border-transparent
                hover:border-blue-200
                focus:border-blue-500 focus:outline-none
                transition-colors
              "
            />
  
            {/* Clear button (only when text exists) */}
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
                  transition
                "
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

        {/* Actions */}
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            color="success"
            startContent={<FaPlus size={16} />}
            onPress={onAdd}
            className="flex-1 lg:flex-none 
              bg-linear-to-r from-green-600 to-green-700
             text-white 
              font-semibold 
              shadow-lg 
              hover:shadow-xl 
              transition-all h-12 px-6
              rounded-md
            "
          >
            Ajouter
          </Button>
          <Button
            variant="bordered"
            startContent={<FaUpload size={16} />}
            onPress={onImport}
            isLoading={importLoading}
            isDisabled={importLoading}
            className="rounded-md
              flex-1 lg:flex-none 
              border-2 
              border-slate-300 
              hover:border-slate-400 
              hover:bg-slate-50 
              font-medium 
              h-12 
              px-6 
              transition-all"
          >
            {importLoading ? "Import..." : "Importer"}
          </Button>
          <Button
            variant="bordered"
            startContent={<FaDownload size={16} />}
            onPress={onExport}
            className="              
             rounded-md
              flex-1 lg:flex-none 
              border-2 
              border-green-600
              text-green-600 
              hover:bg-green-50
              font-medium 
              h-12
              px-6
              transition-all"
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-linear-to-r from-purple-50 via-white to-pink-50 rounded-xl p-4 shadow-sm border border-purple-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge nombre de résultats */}
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

          {/* Filtres dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtre période */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  size="md"
                  startContent={<FaCalendarAlt className="text-green-600" />}
                  endContent={<MdKeyboardArrowDown />}
                  className={` bg-amber-300 ${
                    selectedFilter !== 'all' 
                      ? 'bg-green-700 border-2 rounded-md border-gray-400 text-green-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
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
                className='bg-white rounded-md'

              >
                {filterOptions.map((option) => (
                  <DropdownItem 
                    key={option.key}
                    startContent={<option.icon className="text-green-600" />}
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
                      ? 'bg-green-100 border-2 border-gray-400 text-green-700 font-semibold' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
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
                className='bg-white rounded-md'
              >
                {statusOptions.map((option) => (
                  <DropdownItem 
                  className=' p-1.5'
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

export default MemberFilterBar;
