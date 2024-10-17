import React from "react";
import {
   User, 
   Chip, 
   Tooltip,
  } from "@nextui-org/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";

export type Post = {
    post_id: string;
    post_name: string;
    post_description: string;
    responsibilities: string;
  }
  
  
export const columns = [
    {
      key: "post_name",
      label: "NAME",
    },
    
    {
      key: "responsibilities",
      label: "Responsibilities",
    },
    {
      key: "post_description",
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

export const renderCell = (post:Post, columnKey: React.Key) => {
  const cellValue = post[columnKey as keyof Post];

  switch (columnKey) {
    case "post_name":
      return (
        <div>
          <strong>{post.post_name}</strong> 
        </div>
      );

    case "responsibilities":
      return (
        <div>
          <p>{post.responsibilities}</p> 
        </div>
      );

    case "post_description":
      return (
        <div>
          <p>{post.post_description}</p>
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

 

