'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Tooltip,
  Button,
} from '@nextui-org/react';
import { FiSearch } from 'react-icons/fi';
import { FaRegTrashCan, FaRegEye } from 'react-icons/fa6';
import { FiEdit } from 'react-icons/fi';
import { TfiImport, TfiExport } from 'react-icons/tfi';
import { CreateOpeningHour } from '@/app/dashboard/opening_hours/bouttons';

const OpeningHoursTable = ({
  openingHours,
  onEdit,
}: {
  openingHours: any[];
  onEdit: (hour: any) => void;
}) => {
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]); // Track selected rows
  const rowsPerPage = 5;

  
  const filteredItems = useMemo(() => {
    return openingHours.filter((item) =>
      item.created_at.includes(filterValue)
    );
  }, [openingHours, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

   const itemsToDisplay = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return openingHours.slice(start, start + rowsPerPage);
  }, [page, openingHours]);

  const isAllSelected = itemsToDisplay.every((item) => selectedRows.includes(item.id));

  // Gestion de la case "Select All"
const handleSelectAllChange = (isSelected: boolean) => {
  const visibleIds = itemsToDisplay.map((item) => item.id);
  console.log(visibleIds)
};


const onSearchChange = useCallback((value?: string) => {
  setFilterValue(value || '');
  setPage(1); // Reset pagination when the filter changes
}, []);
return (
    <div>
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex gap-3 items-center">
          <p>{isAllSelected}</p>
          <Input
            isClearable
            placeholder="Search by date..."
            value={filterValue}
            onValueChange={onSearchChange}
            startContent={<FiSearch />}
            className="mb-4"
          />
          <div className="button flex gap-3">
            <CreateOpeningHour />
            <Button color="primary" variant="bordered" endContent={<TfiImport />}>
              Import
            </Button>
            <Button color="primary" variant="bordered" endContent={<TfiExport />}>
              Export
            </Button>
          </div>
        </div>
      </div>

      <Table aria-label="Opening Hours">
        <TableHeader columns={[
          { key: 'select', label: '' }, // Checkbox column
          { key: 'monday', label: 'Monday' },
          { key: 'tuesday', label: 'Tuesday' },
          { key: 'wednesday', label: 'Wednesday' },
          { key: 'thursday', label: 'Thursday' },
          { key: 'friday', label: 'Friday' },
          { key: 'created_at', label: 'Created At' },
          { key: 'actions', label: 'Actions' }, // Actions column
        ]}>
          {(column) => (
            <TableColumn key={column.key}>
              {column.key === 'select' ? (
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAllChange(e.target.checked)}
                />
              ) : (
                column.label
              )}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody items={itemsToDisplay} emptyContent="No rows to display.">
          {(item) => (
            <TableRow
              key={item.id}
            >
              <TableCell>
              <input
                className="text-green-600 focus:ring-green-300 border-gray-300 peer rounded-lg w-6 h-6 absolute top-7 left-4 "
                id="custom-checkbox"
                name="custom-checkbox"
                type="checkbox"
                value="custom-checkbox"
              />
              </TableCell>
              <TableCell>{item.monday}</TableCell>
              <TableCell>{item.tuesday}</TableCell>
              <TableCell>{item.wednesday}</TableCell>
              <TableCell>{item.thursday}</TableCell>
              <TableCell>{item.friday}</TableCell>
              <TableCell>
                {new Date(item.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip content="Details">
                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                      <FaRegEye />
                    </span>
                  </Tooltip>
                  <Tooltip content="Edit Hours">
                    <span
                      onClick={() => onEdit(item)}
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    >
                      <FiEdit />
                    </span>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete Hours">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                      <FaRegTrashCan />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination
        isCompact
        page={page}
        total={pages}
        onChange={(page) => setPage(page)}
        showControls
      />
    </div>
  );
};

export default OpeningHoursTable;
