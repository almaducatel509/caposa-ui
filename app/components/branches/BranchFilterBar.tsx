import React from 'react';
import { Input, Select, SelectItem, Chip, Button } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa6";
import { FiSearch } from 'react-icons/fi';
import { CiExport } from "react-icons/ci";

interface BranchFilterBarProps {
  filterValue: string;
  selectedFilter: string;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onFilterChange: (key: string) => void;
  onAdd: () => void;
  onExport: () => void;
  totalCount: number;
}

const BranchFilterBar: React.FC<BranchFilterBarProps> = ({
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
    { key: 'all', label: 'Toutes les branches' },
    { key: 'large', label: 'Grandes (20+ employés)' },
    { key: 'medium', label: 'Moyennes (10-19 employés)' },
    { key: 'small', label: 'Petites (< 10 employés)' },
  ];

  return (
    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
      <div className="flex gap-2 items-center">
        <Input
          isClearable
          size="sm"
          placeholder="Rechercher une branche..."
          value={filterValue}
          startContent={<FiSearch />}
          onClear={onClear}
          onValueChange={onSearchChange}
          className="w-64"
          aria-label="Rechercher dans les branches"
          classNames={{
            input: "text-sm",
            inputWrapper: "h-10"
          }}
        />
        
        <Select
          size="sm"
          placeholder="Filtrer par taille"
          selectedKeys={selectedFilter ? [selectedFilter] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0]?.toString();
            if (selected) {
              onFilterChange(selected);
            }
          }}
          className="w-48"
          aria-label="Filtrer par taille de branche"
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

        <Chip 
          size="sm" 
          variant="flat" 
          className="h-8 px-3 bg-[#34963d]/10 text-[#34963d] border border-[#34963d]/20"
        >
          {totalCount} {totalCount <= 1 ? 'branche' : 'branches'}
        </Chip>
      </div>

      <div className="flex gap-2">
        <Button 
          color="success" 
          startContent={<FaPlus size={14} />} 
          onPress={onAdd} 
          className="border-2 border-[#34963d] bg-[#34963d] text-white hover:bg-[#1e7367] transition-colors h-10 px-4"
          size="sm"
        >
          Nouvelle Branche
        </Button>
        
        <Button 
          color="success" 
          className="bg-[#1e7367] hover:bg-[#34963d] text-white h-10 px-4 transition-colors" 
          startContent={<CiExport size={16} />} 
          variant="flat" 
          onPress={onExport}
          size="sm"
        >
          Exporter
        </Button>
      </div>
    </div>
  );
};

export default BranchFilterBar;