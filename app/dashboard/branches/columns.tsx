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
  branch_id: string;  
  branch_name: string; 
  branch_email: string; 
  branch_code: string; 
  branch_phone_number: string,
  branch_manager_id:string
};
  
  
export const columns = [
  {
    key: "branch_name",
    label: "NAME", 
  },
  {
    key: "branch_code",
    label: "Branch Code", 
  },
  {
    key: "branch_phone_number",
    label: "Phone Number", 
  },
  {
    key: "branch_manager_id",
    label: "Manager", 
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

export const renderCell = (branch: Branch, columnKey: React.Key) => {
  const cellValue = branch[columnKey as keyof Branch];

  switch (columnKey) {
    case "name":
      return (
        <div className="flex items-center">
         <div>
            <p className="font-semibold">{branch.branch_name}</p> 
            <p className="text-sm text-gray-500">{branch.branch_email}</p> 
          </div>
        </div>
      );

    case "branch_code":
      return <p>{branch.branch_code}</p>; 

    case "phone_number":
      return <p>{branch.branch_phone_number}</p>; 
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


