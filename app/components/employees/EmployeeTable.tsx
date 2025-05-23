'use client'

import { useState, useMemo, useCallback, useEffect } from 'react';
import React from "react";
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
  SortDescriptor,
} from "@nextui-org/react";
import { columns, Employee, renderCell } from "@/app/dashboard/employees/columns";
import { FiSearch } from "react-icons/fi";
import { TfiImport, TfiExport } from 'react-icons/tfi';
import { CreateEmployee } from '@/app/dashboard/employees/bouttons';

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}
export default function EmployeeTable({ employees }: { employees: Employee[] }) {
  const [filterValue, setFilterValue] = useState('');
  const hasSearchFilter = Boolean(filterValue);
  
  
  const filteredItems = useMemo(() => {
    return employees.filter(item =>
      item.first_name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [employees, filterValue]);

  const rowsPerPage = 5;
  const [page, setPage] = useState(1);
  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'first_name',
    direction: 'ascending',
  });
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Employee, b: Employee) => {
      const first = a[sortDescriptor.column as keyof Employee] as string;
      const second = b[sortDescriptor.column as keyof Employee] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

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
            <CreateEmployee />
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
  }, [selectedKeys, items.length,filterValue, onSearchChange, onClear]);

  if (!employees) {
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
      <TableBody items={sortedItems} emptyContent="No employees found.">
        {(employee) => (
          <TableRow className="group/item hover:bg-neutral-100" key={employee.first_name}>
            {(columnKey) => <TableCell>{renderCell(employee, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
