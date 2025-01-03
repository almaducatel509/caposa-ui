'use client';

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  ChipProps,
  Chip,
  Tooltip,
  Checkbox,
} from "@nextui-org/react";
import { FaRegTrashCan, FaRegEye } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";

// Type des horaires d'ouverture
export type OpeningHrs = {
  id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string | null;
  sunday: string | null;
  created_at: string;
  updated_at: string;
  status: "active" | "paused" | "vacation";
};

// Map de couleur pour le statut
const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

// Colonnes du tableau
export const columns = [
  { key: "select", label: "" }, // Colonne pour les checkboxes
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "created_at", label: "Created At" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

// Fonction pour rendre les cellules
export const renderCell = (
  item: OpeningHrs,
  columnKey: React.Key,
  selectedRows: Set<string>,
  toggleSelect: (id: string) => void
) => {
  switch (columnKey) {
    case "select":
      return (
        <Checkbox
          isSelected={selectedRows.has(item.id)}
          onChange={() => toggleSelect(item.id)}
          aria-label={`Select row ${item.id}`}
        />
      );
    case "created_at":
      // return new Date(item.created_at).toLocaleString(); // Format date
    case "status":
      return (
        <Chip className="capitalize" color={statusColorMap[item.status]} size="sm" variant="flat">
          {/* {item.status} */}
        </Chip>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-4">
          {/* Actions principales */}
          
        </div>
      );
    default:
      return item[columnKey as keyof OpeningHrs]; // Retourne la valeur par défaut
  }
};

// Composant principal de tableau
const OpeningHoursTable = ({ data }: { data: OpeningHrs[] }) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Fonction pour gérer la sélection/déselection
  const toggleSelect = (id: string) => {
    setSelectedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  return (
    <Table aria-label="Opening Hours Table">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>
                {renderCell(item, columnKey, selectedRows, toggleSelect)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default OpeningHoursTable;
