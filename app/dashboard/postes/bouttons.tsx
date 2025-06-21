import { HiOutlineLocationMarker   } from "react-icons/hi";
import {Link, Button} from "@nextui-org/react";


export function CreatePost({ onRefresh }: { onRefresh?: () => void }) {  return (
    <Button
      as={Link}
      className=" bg-green-600 px-4 text-sm font-medium text-white flex items-center gap-2 hover:bg-green-500"
      href="/dashboard/postes/create"
      variant="solid"
      radius="md"
    >
      <HiOutlineLocationMarker className="w-5 h-5" /> {/* Icon */}
      <span>Créer Post</span> {/* Text */}
    </Button>
  );
}
