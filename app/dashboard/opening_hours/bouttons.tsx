//import { deleteInvoice } from '@/app/lib/api';
import { HiOutlineClock } from "react-icons/hi";
import { HiPencil } from "react-icons/hi2";
import { FaRegTrashAlt } from "react-icons/fa";
import {Link, Button} from "@nextui-org/react";


export function CreateOpeningHour() { 
  return ( 
    <Button
      as={Link}
      className=" bg-green-600 px-4 text-sm font-medium text-white flex items-center gap-2 hover:bg-green-500"
      href="/dashboard/opening_hours/create"
      variant="solid"
      radius="md"
    >
      <HiOutlineClock className="w-5 h-5" /> {/* Icon */}
      <span>Créer Horaire</span> {/* Text */}
    </Button>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
    href={`/dashboard/invoices/${id}/edit`}
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
