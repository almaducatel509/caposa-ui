'use client';

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
  Pagination,
  Button,
} from "@nextui-org/react";
import { Branch, columns, renderCell } from "@/app/dashboard/branches/columns";
import { FiSearch } from "react-icons/fi";
import { LuPlus } from "react-icons/lu";
import { TfiExport, TfiImport } from "react-icons/tfi";

const BranchTable = ({ branches }: { branches: Branch[] }) => {
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Handle hydration issue: Wait until client-side render
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure this is only set on the client
  }, []);

  useEffect(() => {
    console.log('Branch data:', branches);
  }, [branches]);

  // Filter branches by name or address
  const filteredItems = useMemo(() => {
    return branches.filter(
      (item) =>
        item.branch_name.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.branch_address.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [branches, filterValue]);

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
          placeholder="Search by name or address..."
          startContent={<FiSearch />}
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
        />
        <div className="button flex gap-3 pb-4 ">
          <Button
            color="primary"
            variant="bordered"
            endContent={<LuPlus />}
            style={{
              backgroundColor: '#107a33',
              color: '#ffffff',
              borderColor: '#107a33',
            }}
          >
            Add New
          </Button>
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

      {/* Handle empty state */}
      {itemsToDisplay.length === 0 ? (
        <div className="text-center py-4 text-gray-600">No branches found.</div>
      ) : (
        <>
          {/* Branches table */}
          <Table aria-label="Branches Table">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>

            <TableBody items={itemsToDisplay}>
              {(branch) => (
                <TableRow key={branch.branch_code}>
                  {(columnKey) => (
                    <TableCell>{renderCell(branch, columnKey)}</TableCell>
                  )}
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

export default BranchTable;
