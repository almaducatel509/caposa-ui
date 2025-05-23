import React from 'react';
import {
  Input,
  Button,
  Select,
  SelectItem,
  Chip,
} from '@nextui-org/react';
import { FiSearch } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa6';
import { CiExport } from "react-icons/ci";

interface FilterBarProps {
  filterValue: string;
  selectedFilter: string;
  onSearchChange: (value?: string) => void;
  onClear: () => void;
  onFilterChange: (key: string) => void;
  onAdd: () => void;
  onExport: () => void;
  totalCount: number;
}

export default function FilterBar({
  filterValue,
  selectedFilter,
  onSearchChange,
  onClear,
  onFilterChange,
  onAdd,
  onExport,
  totalCount,
}: FilterBarProps) {
  const filterOptions = [
    { key: 'all', label: 'Tous' },
    { key: 'current', label: 'En cours' },
    { key: 'upcoming', label: 'À venir' },
    { key: 'expired', label: 'Expirés' },
    { key: 'withHolidays', label: 'Avec jours fériés' },
  ];

  return (
    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
      <div className="flex gap-2 items-center">
       <Input
          isClearable
          size="sm"
          placeholder="Rechercher..."
          value={filterValue}
          startContent={<FiSearch />}
          onClear={onClear}
          onValueChange={onSearchChange}
          className="w-64"
          aria-label="Rechercher dans les horaires" // ✅ Ajoutez ceci pour evite que composant Input n'a pas d'attribut d'accessibilité.
       />
        <Select
          size="sm"
          placeholder="Filtrer"
          selectedKeys={[selectedFilter]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0]?.toString();
            if (selected) {
              onFilterChange(selected);
            }
          }}
          className="w-40"
          aria-label="Filtrer par statut des horaires" // ✅ Ajoutez ceci pour evite que composant Select n'a pas d'attribut d'accessibilité. 
        >
          {filterOptions.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
        <Chip size="sm" variant="flat" color="primary">
          {totalCount} items
        </Chip>
      </div>

      <div className="flex gap-2">
        <Button    aria-label="Ajouter un élément" color="primary" startContent={<FaPlus />} onPress={onAdd} className='border-2 border-green-500'>
          Ajouter
        </Button>
        <Button color="primary"   aria-label="Exporter la plage" className='bg-green-500 text-white' startContent={<CiExport />} variant="flat" onPress={onExport}>
          Exporter
        </Button>
      </div>
    </div>
  );
}