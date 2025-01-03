import {Link, Button} from "@nextui-org/react";
import { HiOutlineCalendar } from "react-icons/hi";
import { HiPencil } from "react-icons/hi2";
import { FaRegTrashAlt } from "react-icons/fa";

export function CreateHoliday() {
  return (
    <Button
    as={Link}
    className=" bg-green-600 px-4 text-sm font-medium text-white flex items-center gap-2 hover:bg-green-500"
    href="/dashboard/holydays/create"
    variant="solid"
    radius="md"
  >
    <HiOutlineCalendar className="h-5 w-5" /> {/* Calendar Icon */}
    <span className="hidden md:block">Créer Jour Férié</span> {''}
  </Button>
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
