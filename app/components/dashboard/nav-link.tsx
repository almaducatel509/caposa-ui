'use client';

import { BsBoxes } from "react-icons/bs";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { AiOutlineHome } from "react-icons/ai";
import { HiOutlineDocumentDuplicate } from "react-icons/hi2";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: AiOutlineHome },
  
  { name: 'Opening Hours',
    href: '/dashboard/openning_hours',
    icon: HiOutlineUserGroup, 
  },
  
  { name: 'Postes',
    href: '/dashboard/postes',
    icon: HiOutlineUserGroup, 
  },
  { name: 'Holydays',
    href: '/dashboard/hollydays',
    icon: HiOutlineUserGroup, 
  },
  
  { name: 'Employees',
    href: '/dashboard/employees',
    icon: HiOutlineUserGroup, 
  },
  { name: 'Members',
    href: '/dashboard/members',
    icon: HiOutlineUserGroup, 
  },
  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: HiOutlineDocumentDuplicate,
  },
  {
    name: 'Report',
    href: '/dashboard/reports',
    icon: HiOutlineDocumentDuplicate,
  },
  { name: 'Achives',
    href: '/dasboard/Achives',
    icon: HiOutlineUserGroup, 
  },

];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-white p-3 text-sm font-medium hover:bg-sky-100 hover:text-green-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-green-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
