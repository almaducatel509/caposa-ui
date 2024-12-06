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
  id: string;
  name: string;
  description: string;
  deposit: boolean;
  withdrawal: boolean;
  transfer: boolean;
};

export const columns = [
  {
    key: "name",  // Correspond à 'post_name' dans le JSON
    label: "Post",
  },
  {
    key: "description",  // Correspond à 'post_description' dans le JSON
    label: "Description",
  },
  {
    key: "deposit",  // Ajoutez des propriétés comme 'deposit', 'withdrawal', etc. si nécessaire
    label: "Deposit",
  },
  {
    key: "withdrawal",  // Ajoutez des propriétés comme 'withdrawal', etc. si nécessaire
    label: "Withdrawal",
  },
  {
    key: "transfer",  // Ajoutez des propriétés comme 'transfer', etc. si nécessaire
    label: "Transfer",
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

export const renderCell = (post: Post, columnKey: React.Key) => {
  const cellValue = post[columnKey as keyof Post];

  switch (columnKey) {
    case "name":
      return (
        <div>
          <strong>{post.name}</strong>  {/* Correspond à 'post_name' */}
        </div>
      );

    case "description":
      return (
        <div>
          <p>{post.description}</p>  {/* Correspond à 'post_description' */}
        </div>
      );

    case "deposit":
      return (
        <div>
          <p>{post.deposit ? 'Yes' : 'No'}</p>  {/* Affiche 'Yes' ou 'No' */}
        </div>
      );

    case "withdrawal":
      return (
        <div>
          <p>{post.withdrawal ? 'Yes' : 'No'}</p>  {/* Affiche 'Yes' ou 'No' */}
        </div>
      );

    case "transfer":
      return (
        <div>
          <p>{post.transfer ? 'Yes' : 'No'}</p>  {/* Affiche 'Yes' ou 'No' */}
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
          <Tooltip content="Edit post">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete post">
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

 

