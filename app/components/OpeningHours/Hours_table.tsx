'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input } from '@nextui-org/react';
import { FiSearch } from 'react-icons/fi';

// Composant de tableau pour afficher les horaires d'ouverture
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
      <Input
        placeholder="Search by date..."
        value={filterValue}
        onValueChange={onSearchChange}
        startContent={<FiSearch />}
        className="mb-4"
      />

      <Table aria-label="Opening Hours">
        <TableHeader columns={[
          { key: 'monday', label: 'Monday' },
          { key: 'tuesday', label: 'Tuesday' },
          { key: 'wednesday', label: 'Wednesday' },
          { key: 'thursday', label: 'Thursday' },
          { key: 'friday', label: 'Friday' },
          { key: 'created_at', label: 'Created At' },
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
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination
        isCompact
        page={page}
        total={pages}
        onChange={setPage}
        showControls
      />
    </div>
  );
};

export default OpeningHoursTable;
