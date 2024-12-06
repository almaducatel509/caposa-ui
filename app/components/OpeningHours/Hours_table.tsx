'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input, Tooltip, Button } from '@nextui-org/react';
import { FiSearch } from 'react-icons/fi';
import { FaRegTrashCan, FaRegEye } from 'react-icons/fa6';
import { FiEdit } from 'react-icons/fi';
import { LuPlus } from "react-icons/lu";
import { TfiImport } from "react-icons/tfi";
import { TfiExport } from "react-icons/tfi";



const OpeningHoursTable = ({ openingHours }: { openingHours: any[] }) => {
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrer les horaires par date de création
  const filteredItems = useMemo(() => {
    return openingHours.filter(item => item.created_at.includes(filterValue));
  }, [openingHours, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const itemsToDisplay = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems]);

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
    setPage(1); // Réinitialiser la pagination lors du changement de filtre
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex gap-3 items-center">
            <Input
            isClearable
            placeholder="Search by date..."
            value={filterValue}
            onValueChange={onSearchChange}
            startContent={<FiSearch />}
            className="mb-4"
          />
          {/* Ajouter les boutons Add New, Import, Export */}
          <div className="button flex gap-3">
            <Button color="primary" variant="bordered" endContent={<LuPlus />}>
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
      

      <Table aria-label="Opening Hours">
        <TableHeader columns={[
          { key: 'monday', label: 'Monday' },
          { key: 'tuesday', label: 'Tuesday' },
          { key: 'wednesday', label: 'Wednesday' },
          { key: 'thursday', label: 'Thursday' },
          { key: 'friday', label: 'Friday' },
          { key: 'created_at', label: 'Created At' },
          { key: 'actions', label: 'Actions' }  // Ajout de la colonne des actions
        ]}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>

        <TableBody items={itemsToDisplay} emptyContent='No rows to display.'>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{item.monday}</TableCell>
              <TableCell>{item.tuesday}</TableCell>
              <TableCell>{item.wednesday}</TableCell>
              <TableCell>{item.thursday}</TableCell>
              <TableCell>{item.friday}</TableCell>
              <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>

              {/* Colonne des actions */}
              <TableCell>
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
