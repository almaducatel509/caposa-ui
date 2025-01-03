import {Link, Button} from "@nextui-org/react";
// import { deleteInvoice } from '@/app/lib/actions';
import { HiOutlinePlus } from "react-icons/hi";
import { HiPencil } from "react-icons/hi2";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineRememberMe } from "react-icons/md";


export function CreateEmployee() {
  return (
    <Button
      href="/dashboard/employees/create"
      as={Link} 
      variant="solid"
      radius="md"
      className=" bg-green-600 px-4 text-sm font-medium text-white flex items-center gap-2 hover:bg-green-500"
    >
      <MdOutlineRememberMe className="h-5 w-5" />      
      <span className="hidden md:block">Create Employee</span>{' '}

    </Button>
  );
}

export function UpdateEmployee({ id }: { id: string }) {
  return (
    <Link
    href={`/dashboard/employees/${id}/edit`}
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
