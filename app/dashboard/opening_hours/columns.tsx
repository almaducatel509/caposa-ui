'use client';

import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, ChipProps, Chip } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { FaRegTrashCan, FaRegEye } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";

// Définition du type des horaires d'ouverture
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
  status: "active" | "paused" | "vacation";  // Ajout du champ status
};

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

// Définition des colonnes du tableau
export const columns = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "created_at", label: "Created At" },
  { key: "status", label: "Status" },  // Colonne pour le statut
  { key: "actions", label: "Actions" },
];
// Fonction pour rendre le contenu des cellules
export const renderCell = (item: OpeningHrs, columnKey: React.Key) => {
  const cellValue = item[columnKey as keyof OpeningHrs];

  switch (columnKey) {
    case "created_at":
      return new Date(item.created_at).toLocaleString(); // Affiche la date de création formatée
    case "status":
      return (
        <Chip className="capitalize" color={statusColorMap[item.status]} size="sm" variant="flat">
          {cellValue}
        </Chip>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit Hours">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete Hours">
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );
    default:
      return item[columnKey as keyof OpeningHrs]; // Retourne les horaires pour chaque jour
  }
};
