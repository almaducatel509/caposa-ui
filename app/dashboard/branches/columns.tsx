"use client";

import React from 'react';
import { Tooltip, Button } from "@nextui-org/react";
import { FaRegTrashCan, FaRegEye } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { BranchData } from "@/app/components/branches/validations";

// Interface pour Branch qui étend BranchData
export interface Branch extends BranchData {
  id: string;
  branch_code: string;
}

// Définition des colonnes du tableau
export const columns = [
  {
    key: "branch_name",
    label: "Branch Name",
  },
  {
    key: "branch_address",
    label: "Address",
  },
  {
    key: "branch_phone_number",
    label: "Phone Number",
  },
  {
    key: "branch_email",
    label: "Email",
  },
  {
    key: "branch_code",
    label: "Branch Code",
  },
  {
    key: "opening_date",
    label: "Opening Date",
  },
  {
    key: "actions",
    label: "Actions",
  },
];

// Interface pour les props du renderCell
interface RenderCellProps {
  branch: Branch;
  columnKey: React.Key;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

// renderCell est maintenant une fonction qui prend des callbacks pour les actions
export const renderCell = ({ branch, columnKey, onEdit, onView, onDelete }: RenderCellProps) => {
  const cellValue = branch[columnKey as keyof Branch];

  switch (columnKey) {
    case "branch_name":
      return <strong>{branch.branch_name}</strong>;

    case "branch_address":
      return <p>{branch.branch_address}</p>;

    case "branch_phone_number":
      return <p>{branch.branch_phone_number}</p>;

    case "branch_email":
      return <p>{branch.branch_email}</p>;

    case "branch_code":
      return <span>{branch.branch_code}</span>;

    case "opening_date":
      return (
        <div>
          <strong>
            {branch.opening_date 
              ? new Date(branch.opening_date).toLocaleDateString() 
              : "Date non spécifiée"}
          </strong>
        </div>
      );

    case "actions":
      return (
        <div className="relative flex justify-end items-center gap-2">
          <Tooltip content="Détails">
            <Button 
              isIconOnly 
              size="sm" 
              variant="light" 
              color="primary"
              onClick={() => onView(branch.id)}
            >
              {/* je dois remplacer detail */}
              <FaRegEye />
            </Button>
          </Tooltip>
          
          <Tooltip content="Modifier">
            <Button 
              isIconOnly 
              size="sm" 
              variant="light"
              color="default"
              onClick={() => onEdit(branch.id)}
            >
              <FiEdit />
            </Button>
          </Tooltip>
          
          <Tooltip content="Supprimer">
            <Button 
              isIconOnly 
              size="sm" 
              variant="light" 
              color="danger"
              onClick={() => onDelete(branch.id)}
            >
              <FaRegTrashCan />
            </Button>
          </Tooltip>
        </div>
      );

    default:
      return cellValue;
  }
};