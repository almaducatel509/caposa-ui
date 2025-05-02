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
import { FaRegEye } from "react-icons/fa6";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
// Type des horaires d'ouverture
export type OpeningHrs = {
  [x: string]: string | null | (readonly string[] & string) | undefined;
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
 { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

// Fonction pour rendre les cellules
export const renderCell = (
  item: OpeningHrs,
  columnKey: React.Key,
  ) => {

  switch (columnKey) {
    case "created_at":
      return new Date(item.created_at).toLocaleString(); // Format date
    case "status":
      return (
        <Chip className="capitalize" color={statusColorMap[item.status]} size="sm" variant="flat">
          {item.status}
        </Chip>
      );
    case "actions":
      return (
        <div className="flex items-center gap-2">
          <Tooltip content="Details">
            <span
              className="text-lg text-default-400 cursor-pointer"
              onClick={() => console.log("View details")}
            >
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit employee">
            <span
              className="text-lg text-default-400 cursor-pointer"
              onClick={() => console.log("Edit employee:")}
            >
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete employee">
            <span
              className="text-lg text-danger cursor-pointer"
              onClick={() => console.log("Delete employee:")}
            >
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );

    default:
      return null;
  }
};

