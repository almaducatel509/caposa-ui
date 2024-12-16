'use client'

import {useState, useMemo, useCallback, useEffect} from 'react';
import React from "react";
import {
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  input,
  getKeyValue,
  Pagination,
  SortDescriptor,
  Button,
} from "@nextui-org/react";
import { CreateHoliday } from '@/app/dashboard/holydays/bouttons';
import { Holyday, columns, renderCell } from "@/app/dashboard/holydays/columns";
import {Input} from "@nextui-org/input";
import { FiSearch } from "react-icons/fi";
import { LuPlus } from "react-icons/lu";
import { TfiExport, TfiImport } from 'react-icons/tfi';
import { useRouter } from "next/navigation"; 


const HolydayTable = ({ holydays }: { holydays: any[] }) => {
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const router = useRouter();

  // Handle hydration issue: Wait until client-side render
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true); // Ensure this is only set on client
  }, []);
  useEffect(() => {
    console.log('Holydays data:', holydays);
  }, [holydays]);
  // Filter the holidays by the date
  const filteredItems = useMemo(() => {
    return holydays.filter(item => item.date && item.date.includes(filterValue));
  }, [holydays, filterValue]);

  // Pagination logic
  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const itemsToDisplay = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems]);

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
    setPage(1); // Reset page when filter changes
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  // Render the search bar and buttons
  const topContent = useMemo(() => (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex gap-3 items-center">
        <Input
          isClearable
          className="mb-4"
          placeholder="Search by date..."
          startContent={<FiSearch />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
         <div className="button flex gap-3 pb-4 ">
            <CreateHoliday />

            <Button color="primary" variant="bordered" endContent={<TfiImport />}>
              Import
            </Button>
            <Button color="primary" variant="bordered" endContent={<TfiExport />}>
              Export
            </Button>
          </div>
      </div>
    </div>
  ), [filterValue, onSearchChange, onClear]);

  // Render the table only when the component is mounted (client-side)
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {topContent}
  
      {/* Gestion des cas où il n'y a aucun jour férié */}
      {itemsToDisplay.length === 0 ? (
        <div className="text-center py-4 text-gray-600">Aucun jour férié trouvé.</div>
      ) : (
        <>
          {/* Holidays table */}
          <Table aria-label="Holidays Table">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key} {...(column.key === 'date' ? { allowsSorting: true } : {})}>
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
  
            <TableBody items={itemsToDisplay}>
              {(holiday) => (
                <TableRow key={holiday.id}>
                  {(columnKey) => <TableCell>{renderCell(holiday, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
  
          {/* Pagination */}
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </>
      )}
    </div>
  );
  
};

export default HolydayTable;




