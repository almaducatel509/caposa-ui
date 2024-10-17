import React from "react";
import { Tooltip } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";

export type Employee = { 
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: string;
};

export const columns = [
  {
    key: "name",
    label: "NAME", // Affichage du nom, rôle et email
  },
  {
    key: "status",
    label: "Status", // Affichage du statut de l'employé
  },
  {
    key: "actions",
    label: "Actions", // Les boutons (Détail, Éditer, Supprimer)
  },
];

export const renderCell = (employee: Employee, columnKey: React.Key) => {
  switch (columnKey) {
    case "name":
      return (
        <div className="flex items-center">
          <img
            src={employee.avatar}
            alt={employee.name}
            className="w-8 h-8 rounded-full mr-3" // Image ronde (avatar)
          />
          <div>
            <p className="text-sm font-bold">{employee.name}</p> {/* Affichage du nom en gras */}
            <p className="text-xs text-gray-500">{employee.role}</p> {/* Affichage du rôle */}
            <p className="text-xs text-gray-500">{employee.email}</p> {/* Email en dessous */}
          </div>
        </div>
      );

    case "status":
      return <p>{employee.status}</p>; // Affichage du statut de l'employé

    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit employee">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete employee">
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );

    default:
      return null;
  }
};
