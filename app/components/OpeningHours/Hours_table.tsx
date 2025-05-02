'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
} from '@nextui-org/react';
import { FiSearch } from 'react-icons/fi';
import { FaRegTrashCan, FaRegEye } from 'react-icons/fa6';
import { FiEdit } from 'react-icons/fi';
import { TfiImport, TfiExport } from 'react-icons/tfi';
import { CreateOpeningHour } from '@/app/dashboard/opening_hours/bouttons';
import { OpeningHrs } from '@/app/dashboard/opening_hours/columns';
import { LuPrinter } from 'react-icons/lu';

export default function OpeningHoursTable({ hourtable = [] }: { hourtable?: OpeningHrs[] }) {

  const [filterValue, setFilterValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]); // Track selected rows
  const filteredItems = useMemo(() => {
    return hourtable.filter((item) =>
      item.created_at.includes(filterValue)
    );
  }, [hourtable, filterValue]);
  
  const rowsPerPage = 5;
  const [page, setPage] = useState(1);
  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const itemsToDisplay = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);
  
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'created_at',
    direction: 'ascending',
  });

  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  
  const sortedItems = useMemo(() => {
    return [...itemsToDisplay].sort((a: OpeningHrs, b: OpeningHrs) => {
      const first = a[sortDescriptor.column as keyof OpeningHrs] as string;
      const second = b[sortDescriptor.column as keyof OpeningHrs] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, itemsToDisplay]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);
  const onClear = useCallback(() => {
      setFilterValue("");
      setPage(1);
    }, []);

  const isAllSelected = itemsToDisplay.every((item) => selectedRows.includes(item.id));

  // Gestion de la case "Select All"
const handleSelectAllChange = (isSelected: boolean) => {
  const visibleIds = itemsToDisplay.map((item) => item.id);
  console.log(visibleIds)
};

const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex gap-3 items-center">
          <Input
            isClearable
            // className="mb-1"
            placeholder="Search by name..."
            startContent={<FiSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            className='rounded-sm'
          />
          <div className="button flex gap-3">
            <CreateOpeningHour  />
            <Button
              endContent={<TfiExport />}
              className=" bg-white border-1 border-slate-200 rounded-sm text-sm font-medium text-green-600 hover:border-slate-300 flex items-center gap-2"
            >
              Import
            </Button>
            <Button
              endContent={<TfiImport />}
              className=" bg-white border-1 border-slate-200 rounded-sm text-sm font-medium text-green-600 hover:border-slate-300 flex items-center gap-2"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    );
  }, [selectedKeys, itemsToDisplay.length,filterValue, onSearchChange, onClear]);
  
  if (!hourtable) {
    return <p>Loading...</p>; 
  }

  return (
    <div className="flex flex-col gap-4">
      {topContent}
  
      {filteredItems.length === 0 ? (
        <div className="text-center py-4 text-gray-600">Aucun horaire trouvé.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="border shadow-md rounded-lg p-4 bg-white hover:bg-gray-50 transition">
              <div className="flex justify-between items-center mb-2">
                <strong className="text-sm text-gray-600">
                  Créé le : {new Date(item.created_at).toLocaleDateString()}
                </strong>
                <div className="flex gap-2 text-lg">
                  <FiEdit className="cursor-pointer text-gray-500 hover:text-green-600" />
                  <FaRegTrashCan className="cursor-pointer text-red-500 hover:text-red-700" />
                  <LuPrinter className="cursor-pointer text-gray-500 hover:text-blue-600" />
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Lundi :</strong> {item.monday}</p>
                <p><strong>Mardi :</strong> {item.tuesday}</p>
                <p><strong>Mercredi :</strong> {item.wednesday}</p>
                <p><strong>Jeudi :</strong> {item.thursday}</p>
                <p><strong>Vendredi :</strong> {item.friday}</p>
                <p><strong>Samedi :</strong> {item.saturday || 'Closed'}</p>
                <p><strong>Dimanche :</strong> {item.sunday || 'Closed'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
    
}
