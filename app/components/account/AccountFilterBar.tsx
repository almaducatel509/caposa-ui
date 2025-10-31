'use client';
import React from 'react';
import { Button } from "@nextui-org/react";
import { FaPlus, FaSync, FaFileImport, FaFileExport } from "react-icons/fa";

interface AccountFilterBarProps {
  search: string;
  type: string;
  status: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onClear?: () => void;
  totalCount: number;
}

const AccountFilterBar: React.FC<AccountFilterBarProps> = ({
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onAdd,
  onRefresh,
  onImport,
  onExport,
  onClear,
  totalCount,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou numéro..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border rounded-md px-3 py-2"
        />
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="all">Tous les types</option>
          <option value="epargne">Épargne</option>
          <option value="cheques">Chèques</option>
          <option value="terme">Terme</option>
        </select>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="ferme">Fermé</option>
          <option value="suspendu">Suspendu</option>
        </select>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-gray-600">{totalCount} compte(s) trouvé(s)</p>
        <div className="flex flex-wrap gap-2">
          {onClear && (
            <Button onPress={onClear} variant="light" className="text-gray-700">
              Réinitialiser
            </Button>
          )}
          {onImport && (
            <Button onPress={onImport} variant="bordered" startContent={<FaFileImport />}>
              Importer
            </Button>
          )}
          {onExport && (
            <Button onPress={onExport} variant="bordered" startContent={<FaFileExport />}>
              Exporter
            </Button>
          )}
          <Button onPress={onRefresh} variant="bordered" color="default" startContent={<FaSync />}>
            Actualiser
          </Button>
          <Button 
            color="primary" 
            startContent={<FaPlus size={14} />}
            onPress={onAdd}
            className="border-2 border-green-600 h-10 px-4"
            size="sm"
          > Nouveau Compte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountFilterBar;
