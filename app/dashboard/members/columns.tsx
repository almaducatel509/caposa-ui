import React from "react";
import {
   User, 
   Chip, 
   Tooltip,
  } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";

export type User = {
    id: string;
    name: string;
    email: string;
    image: string;
  }
  
  
export const columns = [
    {
      key: "name",
      label: "NAME",
    },
    
    {
      key: "lastSeen",
      label: "Last Seen",
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

export const renderCell = (user:User, columnKey: React.Key) => {
  const cellValue = user[columnKey as keyof User];

  switch (columnKey) {
    case "name":
      return (
        <User
          avatarProps={{radius: "lg", src: user.image}}
          description={user.email}
          name={cellValue}
        >
          {user.email}
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

 

