import { HiOutlineLocationMarker   } from "react-icons/hi";
import { HiPencil } from "react-icons/hi2";
import { FaRegTrashAlt } from "react-icons/fa";
import {Link, Button} from "@nextui-org/react";


export function CreateBranche() {
  return (
    <Button
      as={Link}
      className=" bg-green-600 px-4 text-sm font-medium text-white flex items-center gap-2 hover:bg-green-500"
      href="/dashboard/branches/create"
      variant="solid"
      radius="md"
    >
      <HiOutlineLocationMarker className="w-5 h-5" /> {/* Icon */}
      <span>Créer Branche</span> {/* Text */}
    </Button>
  );
}
