import React from "react";
import { Tooltip } from "@nextui-org/react";
import { FaRegTrashCan, FaRegEye } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";

export type OpeningHrs = {
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
};

export const columns = [
  {
    key: "sunday",
    label: "Sunday",
  },
  {
    key: "monday",
    label: "Monday ",
  },
  {
    key: "tuesday",
    label: "Tuesday ",
  },
  {
    key: "wednesday",
    label: "Wednesday ",
  },
  {
    key: "thursday",
    label: "Thursday",
  },
  {
    key: "friday",
    label: "Friday ",
  },
  {
    key: "saturday",
    label: "Saturday ",
  },
  {
    key: "actions",
    label: "Actions",
  },
];

export const renderCell = (openingHours: OpeningHrs, columnKey: React.Key) => {
  const cellValue = openingHours[columnKey as keyof OpeningHrs];

  switch (columnKey) {
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit Hours">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete Hours">
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
