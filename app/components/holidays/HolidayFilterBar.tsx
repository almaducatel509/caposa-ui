import React from 'react';
import { Input, Select, SelectItem, Chip, Button } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa6";
import { FiSearch } from 'react-icons/fi';
import { CiExport } from "react-icons/ci";

interface HolidayFilterBarProps {
  filterValue: string;
  selectedFilter: string;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onFilterChange: (key: string) => void;
  onAdd: () => void;
  onExport: () => void;
  totalCount: number;
}

const HolidayFilterBar: React.FC<HolidayFilterBarProps> = ({
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
    { key: 'all', label: 'Tous' },
    { key: 'upcoming', label: 'À venir' },
    { key: 'past', label: 'Passés' },
    { key: 'thisYear', label: 'Cette année' },
  ];

  return (
    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
      <div className="flex gap-2 items-center">
        <Input
          isClearable
          size="sm"
          placeholder="Rechercher dans les jours fériés..."
          value={filterValue}
          startContent={<FiSearch />}
          onClear={onClear}
          onValueChange={onSearchChange}
          className="w-64"
          aria-label="Rechercher dans les jours fériés"
          classNames={{
            input: "text-sm",
            inputWrapper: "h-10"
          }}
        />
        
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

        {/* <Chip 
          size="sm" 
          variant="flat" 
          color="primary"
          className="h-8 px-3"
        >
          {totalCount} {totalCount <= 1 ? 'jour férié' : 'jours fériés'}
        </Chip> */}
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
  );
};

export default HolidayFilterBar;