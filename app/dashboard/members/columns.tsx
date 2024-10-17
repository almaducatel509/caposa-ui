
import React from "react";
import { Tooltip } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";

export type Member = {
  id_number: string;
  first_name: string;
  last_name: string;
  email: string;
  photo_url: string;
  current_balance: string;
};

export const columns = [
  {
    key: "first_name",
    label: "NAME", // Affichage du prénom, nom et email
  },
  {
    key: "current_balance",
    label: "Current Balance", // Balance actuelle du membre
  },
  {
    key: "actions",
    label: "Actions", // Les boutons (Détail, Éditer, Supprimer)
  },
];

export const renderCell = (member: Member, columnKey: React.Key) => {
  switch (columnKey) {
    case "first_name":
      return (
        <div className="flex items-center">
          <img
            src={member.photo_url}
            alt={`${member.first_name} ${member.last_name}`}
            className="w-8 h-8 rounded-full mr-3" // Image ronde (avatar)
          />
          <div>
            <p className="text-sm">
              {member.first_name} <span className="font-bold">{member.last_name}</span>
            </p> {/* Affichage du prénom et du nom en gras pour last_name */}
            <p className="text-xs text-gray-500">{member.email}</p> {/* Email en dessous */}
          </div>
        </div>
      );

    case "current_balance":
      return <p>{member.current_balance}</p>; // Balance actuelle du membre

    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit member">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete member">
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );

    default:
      return null; // Si la colonne ne correspond pas, retourne null
  }
};
