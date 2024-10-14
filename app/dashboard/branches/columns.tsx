import React from "react";
import {
   User, 
   Chip, 
   Tooltip,
  } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";


export type Branch = {
  id: string; // Identifiant de la branche
  name: string; // Nom de la branche
  email: string; // Email de la branche ou du gestionnaire
  avatar: string; // Image/avatar (par exemple, du gestionnaire)
  branch_code: string; // Code de la branche
  phone_number: string; // Numéro de téléphone
};
  
  
export const columns = [
  {
    key: "name",
    label: "NAME", // Avatar, nom complet et email
  },
  {
    key: "branch_code",
    label: "Branch Code", // Code de la branche
  },
  {
    key: "phone_number",
    label: "Phone Number", // Numéro de téléphone de la branche
  },
  {
    key: "actions",
    label: "Actions", // Les boutons (Détail, Éditer, Supprimer)
  },
];

  

const statusColorMap = {
active: "success",
paused: "danger",
vacation: "warning",
};

export const renderCell = (branch: Branch, columnKey: React.Key) => {
  const cellValue = branch[columnKey as keyof Branch];

  switch (columnKey) {
    case "name":
      return (
        <User
          avatarProps={{ radius: "lg", src: branch.avatar }}
          description={branch.email}
          name={branch.name}
        >
          {branch.email}
        </User>
      );

    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit Branch">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete Branch">
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );

    default:
      return cellValue;
  }
};


