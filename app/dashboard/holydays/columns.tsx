
'use client';

import React, { useState, useEffect } from "react";
import { Tooltip } from '@nextui-org/react';
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa6";
import { UpdateHoliday } from '@/app/dashboard/holydays/bouttons';
import { deleteHoliday } from "@/app/lib/api/holiday";

// Define the holiday data type
export type Holyday = {
  date: string;
  description: string;
};

// Define the columns for the holidays table
export const columns = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'actions', label: 'Actions' },
];

// Function to render each cell in the table
export const renderCell = (holyday: Holyday, columnKey: React.Key) => {
  const cellValue = holyday[columnKey as keyof Holyday];

  switch (columnKey) {
    case 'date':
      return <div><strong>{holyday.date}</strong></div>;
    case 'description':
      return <div><p>{holyday.description}</p></div>;
    case 'actions':
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Details">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FaRegEye />
            </span>
          </Tooltip>
          <Tooltip content="Edit">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <FiEdit />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete">
            <span 
              className="text-lg text-danger cursor-pointer active:opacity-50"
              onClick={() => deleteHoliday(holyday.date)}
            >
              <FaRegTrashCan />
            </span>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
};

 

