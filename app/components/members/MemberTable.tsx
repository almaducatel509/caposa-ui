'use client'

import {useState, useMemo, useCallback} from 'react';
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
import { CreateMember } from '@/app/dashboard/members/bouttons';
import { User, columns, renderCell } from "@/app/dashboard/members/columns";
//import { Input } from 'postcss';
import {Input} from "@nextui-org/input";
import { FiSearch } from "react-icons/fi";
import { LuPlus } from "react-icons/lu";


export default function MemberTable({users} : {users: User[] }) {
  const [filterValue, setFilterValue] = useState('');
  const hasSearchFilter = Boolean(filterValue);
  
  const filteredItems = useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      )
  }   
  
  return filteredUsers
}, [users, filterValue, hasSearchFilter])
  
  const rowsPerPage = 4
  const [page, setPage] = useState(1)
  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end)
  }, [page, filteredItems])

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column:'name',
    direction: 'ascending'
  })
  
  const sortedItems = useMemo(() => {
    return [...items].sort((a: User, b: User) => {
      const first = a[sortDescriptor.column as keyof User] as String;
      const second = b[sortDescriptor.column as keyof User] as String;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items])

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, [])

  const onClear = useCallback(()=>{
    setFilterValue("")
    setPage(1)
  }, [])

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex gap-3 items-center">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<FiSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="button flex gap-3">
            <Button color="primary" endContent={<LuPlus />}>
              Add New
            </Button>
            <Button color="primary" endContent={<LuPlus />}>
              Import
            </Button>
            <Button color="primary" endContent={<LuPlus />}>
              Export
            </Button>
          </div>
        </div>
      </div>

    )
  }, [filterValue, onSearchChange, onClear])

  return (
    <Table 
      aria-label="User table"
      topContent={topContent}
      topContentPlacement='outside'
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={page}
            total={pages}
            onChange={page => setPage(page)}
          />
        </div>
      }
      bottomContentPlacement='outside'
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
      classNames={{
        wrapper: "min-h-[222px]",
      }}
    >
      <TableHeader columns={columns}>
        {column => (
          <TableColumn 
            key={column.key}
            {...(column.key === 'name' ? {allowsSorting: true} : {})}
            >
              {column.label}
            </TableColumn>
          )}
      </TableHeader>
      <TableBody items={sortedItems} emptyContent='No rows to display.'>
        {user => (
          <TableRow key={user.id}>
            {(columnKey) => <TableCell>{renderCell(user, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

}










// 'use client'

// import {useState, useMemo, useCallback} from 'react';
// import React from "react";
// import {
//   Table, 
//   TableHeader, 
//   TableColumn, 
//   TableBody, 
//   TableRow, 
//   TableCell, 
//   input,
//   getKeyValue,
//   Pagination,
//   SortDescriptor,
//   Button,
// } from "@nextui-org/react";
// import { CreateMember } from '@/app/dashboard/members/bouttons';
// import { User, columns, renderCell } from "@/app/dashboard/members/columns";
// //import { Input } from 'postcss';
// import {Input} from "@nextui-org/input";
// import { FiSearch } from "react-icons/fi";
// import { LuPlus } from "react-icons/lu";


// export default function MemberTable({users} : {users: User[] }) {
//   const [filterValue, setFilterValue] = useState('');
//   const hasSearchFilter = Boolean(filterValue);
  
//   const filteredItems = useMemo(() => {
//     let filteredUsers = [...users];

//     if (hasSearchFilter) {
//       filteredUsers = filteredUsers.filter(user =>
//         user.name.toLowerCase().includes(filterValue.toLowerCase())
//       )
//   }   
  
//   return filteredUsers
// }, [users, filterValue, hasSearchFilter])
  
//   const rowsPerPage = 4
//   const [page, setPage] = useState(1)
//   const pages = Math.ceil(filteredItems.length / rowsPerPage);

//   const items = useMemo(() => {
//     const start = (page - 1) * rowsPerPage;
//     const end = start + rowsPerPage;

//     return filteredItems.slice(start, end)
//   }, [page, filteredItems])

//   const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
//     column:'name',
//     direction: 'ascending'
//   })
  
//   const sortedItems = useMemo(() => {
//     return [...items].sort((a: User, b: User) => {
//       const first = a[sortDescriptor.column as keyof User] as String;
//       const second = b[sortDescriptor.column as keyof User] as String;
//       const cmp = first < second ? -1 : first > second ? 1 : 0;

//       return sortDescriptor.direction === "descending" ? -cmp : cmp;
//     });
//   }, [sortDescriptor, items])

//   const onSearchChange = useCallback((value?: string) => {
//     if (value) {
//       setFilterValue(value);
//       setPage(1);
//     } else {
//       setFilterValue("");
//     }
//   }, [])

//   const onClear = useCallback(()=>{
//     setFilterValue("")
//     setPage(1)
//   }, [])

//   const topContent = useMemo(() => {
//     return (
//       <div className="flex flex-col gap-4 pt-4">
//         <div className="flex gap-3 items-center">
//           <Input
//             isClearable
//             className="w-full sm:max-w-[44%]"
//             placeholder="Search by name..."
//             startContent={<FiSearch />}
//             value={filterValue}
//             onClear={() => onClear()}
//             onValueChange={onSearchChange}
//           />
//           <div className="button flex gap-3">
//             <Button color="primary" endContent={<LuPlus />}>
//               Add New
//             </Button>
//             <Button color="primary" endContent={<LuPlus />}>
//               Import
//             </Button>
//             <Button color="primary" endContent={<LuPlus />}>
//               Export
//             </Button>
//           </div>
//         </div>
//       </div>

//     )
//   }, [filterValue, onSearchChange, onClear])

//   return (
//     <Table 
//       aria-label="User table"
//       topContent={topContent}
//       topContentPlacement='outside'
//       bottomContent={
//         <div className="flex w-full justify-center">
//           <Pagination
//             isCompact
//             showControls
//             showShadow
//             color="secondary"
//             page={page}
//             total={pages}
//             onChange={page => setPage(page)}
//           />
//         </div>
//       }
//       bottomContentPlacement='outside'
//       sortDescriptor={sortDescriptor}
//       onSortChange={setSortDescriptor}
//       classNames={{
//         wrapper: "min-h-[222px]",
//       }}
//     >
//       <TableHeader columns={columns}>
//         {column => (
//           <TableColumn 
//             key={column.key}
//             {...(column.key === 'name' ? {allowsSorting: true} : {})}
//             >
//               {column.label}
//             </TableColumn>
//           )}
//       </TableHeader>
//       <TableBody items={sortedItems} emptyContent='No rows to display.'>
//         {user => (
//           <TableRow key={user.id}>
//             {(columnKey) => <TableCell>{renderCell(user, columnKey)}</TableCell>}
//           </TableRow>
//         )}
//       </TableBody>
//     </Table>
//   );

// }