"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaPlus,
  FaUpload,
  FaDownload,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdKeyboardArrowDown, MdOutlineSavings } from "react-icons/md";
import { CiFilter, CiMoneyCheck1 } from "react-icons/ci";
import { RiLuggageDepositLine } from "react-icons/ri";

// ============= DROPDOWN COMPONENT =============
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[200px]">
          {children}
        </div>
      )}
    </div>
  );
};

// ============= CHIP COMPONENT =============
interface ChipProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ 
  children, 
  size = 'md', 
  color = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const colorClasses = {
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-purple-100 text-purple-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    default: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`inline-flex items-center rounded-xl font-semibold ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};

// ============= BUTTON COMPONENT =============
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  variant?: 'solid' | 'bordered' | 'flat';
  color?: 'primary' | 'success' | 'default';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  startContent,
  endContent,
  variant = 'solid',
  color = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {startContent}
          <span>{children}</span>
          {endContent}
        </>
      )}
    </button>
  );
};

// ============= MAIN COMPONENT =============
interface AccountFilterBarProps {
  filterValue: string;
  selectedType: string;
  selectedStatus: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onTypeChange: (key: string) => void;
  onStatusChange: (key: string) => void;
  onAdd: () => void;
  onImport?: () => void;
  onExport?: () => void;
  totalCount: number;
  importLoading?: boolean;
}

const AccountFilterBar: React.FC<AccountFilterBarProps> = ({
  filterValue,
  selectedType,
  selectedStatus,
  onSearchChange,
  onClear,
  onTypeChange,
  onStatusChange,
  onAdd,
  onImport,
  onExport,
  totalCount,
  importLoading = false,
}) => {
  const typeOptions = [
    { key: "all", label: "Tous les types", icon: CiFilter },
    { key: "epargne", label: "Épargne", icon: MdOutlineSavings },
    { key: "cheques", label: "Chèques", icon: CiMoneyCheck1 },
    { key: "terme", label: "Terme", icon: RiLuggageDepositLine },
  ];

  const statusOptions = [
    { key: "all", label: "Tous les statuts" },
    { key: "actif", label: "Actifs" },
    { key: "ferme", label: "Fermés" },
    { key: "suspendu", label: "Suspendus" },
  ];

  const getTypeLabel = () => 
    typeOptions.find((o) => o.key === selectedType)?.label || "Type";
  
  const getStatusLabel = () => 
    statusOptions.find((o) => o.key === selectedStatus)?.label || "Statut";

  const activeFiltersCount = [
    selectedType !== "all",
    selectedStatus !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header avec recherche et actions principales */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative w-full lg:max-w-xl">
          <FiSearch
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={filterValue}
            placeholder="Rechercher un membre par nom, email, téléphone..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full h-12 pl-12 pr-12
              rounded-xl text-sm
              bg-white shadow-sm
              border border-gray-200
              hover:border-blue-300
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
              transition-all
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
                p-1.5 rounded-lg
                text-gray-400
                hover:text-gray-600
                hover:bg-gray-100
                transition-all
              "
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions - Flat Design */}
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            startContent={<FaPlus size={16} />}
            onClick={onAdd}
            className="flex-1 lg:flex-none bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-sm h-12"
          >
            Ajouter
          </Button>
          <Button
            startContent={<FaUpload size={16} />}
            onClick={onImport}
            loading={importLoading}
            disabled={importLoading}
            className="flex-1 lg:flex-none bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300 h-12"
          >
            {importLoading ? "Import..." : "Importer"}
          </Button>
          <Button
            startContent={<FaDownload size={16} />}
            onClick={onExport}
            className="flex-1 lg:flex-none bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm h-12"
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres avancés - Flat Design */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge nombre de résultats */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Résultats:</span>
            <Chip size="lg" color="secondary" className="font-bold">
              {totalCount}
            </Chip>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* Filtres dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtre type */}
            <Dropdown
              trigger={
                <button
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${
                    selectedType !== 'all'
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <FaCalendarAlt className="text-green-600" size={16} />
                  <span>{getTypeLabel()}</span>
                  <MdKeyboardArrowDown size={18} />
                </button>
              }
            >
              {typeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => onTypeChange(option.key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors ${
                      selectedType === option.key ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    <Icon className="text-green-600" size={18} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </Dropdown>

            {/* Filtre statut */}
            <Dropdown
              trigger={
                <button
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${
                    selectedStatus !== 'all'
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <FaCheckCircle className="text-blue-600" size={16} />
                  <span>{getStatusLabel()}</span>
                  <MdKeyboardArrowDown size={18} />
                </button>
              }
            >
              {statusOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onStatusChange(option.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors ${
                    selectedStatus === option.key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <FaCheckCircle className="text-blue-600" size={16} />
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </Dropdown>

            {/* Badge filtres actifs */}
            {activeFiltersCount > 0 && (
              <>
                <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                <Chip size="sm" color="warning" className="font-semibold">
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                </Chip>
                <button
                  onClick={() => {
                    onTypeChange('all');
                    onStatusChange('all');
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Réinitialiser
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountFilterBar;