import React, { useEffect } from "react";
import { Tooltip, ChipProps, Chip } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";
import Image from 'next/image'

export type Employee = {
  [x: string]: string | null | (readonly string[] & string) | undefined;
  user: any;
  first_name: string;
  last_name: string;
  gender: string | null | undefined;
  date_of_birthday: any;
  address: string | (readonly string[] & string) | undefined; 
  id: string;
  username: string;
  posts: string;
  branch: string;
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
    key: "posts",
    label: "Poste", 
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
  console.log("photo: ", employee.photo_profil);
  console.log("Employee Branch:", employee.branch);
  console.log("Employee Data:", employee);

  const profileImageUrl = employee.photo_profil
  ? employee.photo_profil.startsWith("http") 
    ? employee.photo_profil 
    : `http://localhost:8000${employee.photo_profil}` 
  : "/default-avatar.png";

console.log("Profile Image URL:", employee.photo_profil);

  switch (columnKey) {
    case "name":
      return (
        <div className="flex flex-row items-center">
           <>
              <Image
                  src={ "http://localhost:8000/media/profile_photos/board.png"}
                  alt={`${employee.first_name} ${employee.last_name}`}
                  width={40} // Taille adaptée
                  height={40}
                  className="w-8 h-8 rounded object-cover mr-3"
              />  
           </>
             
          <div>
            <div className="text-black"> 
              <strong>{employee.name}</strong>
            </div>
            <span className="text-sm font-light"> {employee.email} </span>
          </div>
        </div>
      );

    case "posts":
      return (
        <div className="flex flex-col">
          <p className="text-bold text-small capitalize">{employee.branch}</p>
          <p className="text-tiny text-gray-400 capitalize">{employee.posts || "No Department"}</p>
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
