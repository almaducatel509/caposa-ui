import React from "react";
import {
  Tooltip,
} from "@nextui-org/react";
import { FaRegTrashCan, FaRegEye } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";

export type Branch = {
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  branch_code: string;
  opening_date: string;
  number_of_posts: number;
  number_of_tellers: number;
  number_of_clerks: number;
  number_of_credit_officers: number;
};

export const columns = [
  {
    key: "branch_name",
    label: "Branch Name",
  },
  {
    key: "branch_address",
    label: "Address",
  },
  {
    key: "branch_phone_number",
    label: "Phone Number",
  },
  {
    key: "branch_email",
    label: "Email",
  },
  {
    key: "branch_code",
    label: "Branch Code",
  },
  {
    key: "opening_date",
    label: "Opening Date",
  },
  {
    key: "actions",
    label: "Actions",
  },
];

export const renderCell = (branch: Branch, columnKey: React.Key) => {
  const cellValue = branch[columnKey as keyof Branch];

  switch (columnKey) {
    case "branch_name":
      return <strong>{branch.branch_name}</strong>;

    case "branch_address":
      return <p>{branch.branch_address}</p>;

    case "branch_phone_number":
      return <p>{branch.branch_phone_number}</p>;

    case "branch_email":
      return <p>{branch.branch_email}</p>;

    case "branch_code":
      return <span>{branch.branch_code}</span>;

    case "opening_date":
      return (
        <div>
          <strong>{new Date(branch.opening_date).toLocaleDateString()}</strong>
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
