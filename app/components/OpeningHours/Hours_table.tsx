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
import { columns,OpeningHrs, renderCell } from '@/app/dashboard/opening_hours/columns';

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
            className="mb-4"
            placeholder="Search by name..."
            startContent={<FiSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="button flex gap-3">
            {/* <NewSchedul /> */}
            <Button
              endContent={<TfiExport />}
              className=" bg-white border-2 border-green-600 px-4 text-sm font-medium text-green-600 hover:border-slate-300 flex items-center gap-2"
            >
              Import
            </Button>
            <Button
              endContent={<TfiImport />}
              className=" bg-white border-2 border-slate-600 px-4 text-sm font-medium text-green-600 hover:border-slate-300 flex items-center gap-2"
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
   <Table
         isHeaderSticky
         aria-label="Employee table"
         topContent={topContent}
         topContentPlacement="outside"
         selectedKeys={selectedKeys}
         selectionMode="multiple"
         onSelectionChange={setSelectedKeys}
         bottomContent={
           <div className="flex w-full justify-center">
               {/* Nombre de lignes sélectionnées */}
             <span className="w-[30%] text-small text-default-400">
               {selectedKeys === "all"
                 ? "All rows selected"
                 : `${Array.from(selectedKeys).length} of ${filteredItems.length} selected`}
             </span>
               <Pagination
                 isCompact
                 showControls
                 showShadow
                 color="secondary"
                 page={page}
                 total={pages}
                 onChange={(page) => setPage(page)}
               />
           </div>
         }
         bottomContentPlacement="outside"
         sortDescriptor={sortDescriptor}
         onSortChange={setSortDescriptor}
         classNames={{
           wrapper: "min-h-[222px]",
         }}
       >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            {...(column.key === 'name' ? { allowsSorting: true } : {})}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={sortedItems} emptyContent="No Schedule found.">
        {(opening_hours) => (
          <TableRow className="group/item hover:bg-neutral-100" key={opening_hours.id}>
            {(columnKey) => <TableCell>{renderCell(opening_hours, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
