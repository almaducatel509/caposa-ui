import React from "react";
import { Tooltip, Avatar, User, ChipProps, Chip } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";
 
export type Employee = {
  [x: string]: string | null | (readonly string[] & string) | undefined;
  user: any;
  first_name: string;
  last_name: string;
  gender: string | null | undefined;
  date_of_birthday: any;
  phone_number: string | (readonly string[] & string) | undefined;
  address: string | (readonly string[] & string) | undefined; 
  id: string;
  username: string;
  role: string;
  email: string;
  photo_profil: string;
  status: string;
};
const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

export const columns = [
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "role",
    label: "Role", 
  },
  {
    key: "status",
    label: "Status", 
  },
  {
    key: "actions",
    label: "Actions", // Les boutons (Détail, Éditer, Supprimer)
  },
];

export const renderCell = (employee: Employee, columnKey: React.Key) => {
  const cellValue = employee[columnKey as keyof Employee];
  console.log("Avatar URL:", employee.photo_profil || "/default-avatar.png");

  switch (columnKey) {
    case "name":
      return (
        <div className="flex items-center">
          <img
            src={employee.photo_profil}
            alt={`${employee.first_name} ${employee.last_name}`}
            className="w-8 h-8 rounded mr-3" // Image ronde (avatar)
          />
          <div>
            <p className="text-sm">
              {employee.first_name} <span className="font-bold">{employee.last_name}</span>
            </p> {/* Affichage du prénom et du nom en gras pour last_name */}
            <p className="text-xs text-gray-500">{employee.email}</p> {/* Email en dessous */}
          </div>
        </div>
      );

    case "role":
      return (
        <div className="flex flex-col">
          <p className="text-bold text-small capitalize">{cellValue}</p>
          <p className="text-tiny text-gray-400 capitalize">{employee.role || "No Department"}</p>
        </div>
      );

    case "status":
      return (
        <Chip
          className="capitalize"
          color={statusColorMap[employee.status] || "default"}
          size="sm"
          variant="flat"
        >
          {cellValue || "Unknown"}
        </Chip>
      );

    case "actions":
      return (
        <div className="flex items-center gap-2">
          <Tooltip content="Details">
            <span
              className="text-lg text-default-400 cursor-pointer"
              onClick={() => console.log("View details:", employee.id)}
            >
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit employee">
            <span
              className="text-lg text-default-400 cursor-pointer"
              onClick={() => console.log("Edit employee:", employee.id)}
            >
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete employee">
            <span
              className="text-lg text-danger cursor-pointer"
              onClick={() => console.log("Delete employee:", employee.id)}
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
