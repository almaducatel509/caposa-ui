import Link from 'next/link';
import { HiOutlinePlus } from "react-icons/hi";
import { HiPencil } from "react-icons/hi2";
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from '@nextui-org/react';
import { LuPlus } from 'react-icons/lu';

export function CreateHoliday() {
  return (
    <Link href="/dashboard/holydays/create">
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
    </Link>
  );
}

export function UpdateHoliday({ id }: { id: string }) {
  return (
    <Link
    href={`/dashboard/hollydays/${id}/edit`}
    className="rounded-md border p-2 hover:bg-gray-100"
    >
      <HiPencil className="w-5" />
    </Link>
  );
}

// export function DeleteInvoice({ id }: { id: string }) {
//   const deleteInvoiceWithId = deleteInvoice.bind(null, id);  
//   return (
//     <form action={deleteInvoiceWithId}>
//       <button className="rounded-md border p-2 hover:bg-gray-100">
//         <span className="sr-only">Delete</span>
//         <FaRegTrashAlt className="w-5" />
//       </button>
//     </form>
//   );
// }
