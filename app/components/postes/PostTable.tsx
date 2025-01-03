import { useState, useMemo, useCallback } from 'react';
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Button,
} from "@nextui-org/react";
import { LuPlus } from "react-icons/lu";
import { Input } from "@nextui-org/input";
import { FiSearch } from "react-icons/fi";
import { columns, renderCell } from "@/app/dashboard/postes/columns";
import { TfiExport, TfiImport } from 'react-icons/tfi';
import { CreatePost } from '@/app/dashboard/postes/bouttons';

export default function PostTable({ postes }: { postes: any[] }) {
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrer les postes par nom
  const filteredItems = useMemo(() => {
    return postes.filter(post => {
      // Assurez-vous que 'post_name' est défini avant d'appliquer 'toLowerCase'
      if (post.name && typeof post.name === 'string') {
        return post.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      return false; // Si 'post_name' est undefined ou non-string, le filtre échoue
    });
  }, [postes, filterValue]);
  
  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const itemsToDisplay = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems]);

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
    setPage(1); // Réinitialiser la pagination lors du changement de filtre
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex gap-3 items-center">
          <Input
            isClearable
            className="mb-4"
            placeholder="Search by post name..."
            startContent={<FiSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            />
          {/* Ajouter les boutons Add New, Import, Export */}
          <div className="button flex gap-3 pb-4 ">
            <CreatePost />
            <Button color="primary" variant="bordered" endContent={<TfiImport />}>
              Import
            </Button>
            <Button color="primary" variant="bordered" endContent={<TfiExport />}>
              Export
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, onClear]);

  return (
    <Table
      aria-label="Post table"
      topContent={topContent}
      topContentPlacement="outside"
      bottomContent={
        <div className="flex w-full justify-center">
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
    >
      <TableHeader columns={columns}>
        {column => (
          <TableColumn key={column.key} {...(column.key === 'name' ? { allowsSorting: true } : {})}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={itemsToDisplay} emptyContent="No rows to display.">
        {post => (
          <TableRow key={post.id}>
            {(columnKey) => <TableCell>{renderCell(post, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
