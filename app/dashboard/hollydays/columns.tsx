import React from "react";
import {
   User, 
   Chip, 
   Tooltip,
  } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";

export type Holyday = {
    holyday_date: string;
    holyday_description: string;
  }
  
  
export const columns = [
    {
      key: "holyday_date",
      label: "Date",
    },
    
    {
      key: "holyday_description",
      label: "Description",
    }, 
    {
      key: "actions",
      label: "Actions",
    },
  ];

const statusColorMap = {
active: "success",
paused: "danger",
vacation: "warning",
};

export const renderCell = (holyday:Holyday, columnKey: React.Key) => {
  const cellValue = holyday[columnKey as keyof Holyday];

  switch (columnKey) {
    case "holyday_date":
      return (
        <div>
          <strong>{holyday.holyday_date}</strong> {/* Affichage en gras de la date */}
        </div>
      );

    case "holyday_description":
      return (
        <div>
          <p>{holyday.holyday_description}</p> {/* Affichage simple de la description */}
        </div>
      );
    
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit user">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete user">
            <span className="text-lg text-danger cursor-pointer active:opacity-50">
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
}

 

