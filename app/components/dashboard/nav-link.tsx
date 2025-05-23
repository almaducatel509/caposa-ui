'use client';

import { HiOutlineUserGroup } from "react-icons/hi2";
import { AiOutlineHome } from "react-icons/ai";
import { HiOutlineDocumentDuplicate } from "react-icons/hi2";
import { GrSchedule } from "react-icons/gr";
import { TfiLayoutListPost } from "react-icons/tfi";
import { MdOutlineHolidayVillage } from "react-icons/md";
import { AiOutlineBranches } from "react-icons/ai";
import { GrTransaction } from "react-icons/gr";
import { LuFolderTree } from "react-icons/lu";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { TbBrandUbuntu } from "react-icons/tb";

const links = [
  { name: 'Acceuil', href: '/dashboard', icon: AiOutlineHome },
  { name: 'Horaires', href: '/dashboard/opening_hours', icon: GrSchedule },
  { name: 'Postes', href: '/dashboard/postes', icon: TfiLayoutListPost },
  { name: ' Jours Fériés', href: '/dashboard/holidays', icon: MdOutlineHolidayVillage },
  { name: 'Branches', href: '/dashboard/branches', icon: AiOutlineBranches },
  { name: 'Employees', href: '/dashboard/employees', icon: HiOutlineUserGroup },
  { name: 'Membres', href: '/dashboard/members', icon: TbBrandUbuntu },
  { name: 'Transactions', href: '/dashboard/transactions', icon: GrTransaction },
  { name: 'Analyse', href: '/dashboard/reports', icon: HiOutlineDocumentDuplicate },
  { name: 'Archives', href: '/dashboard/archives', icon: LuFolderTree }, // ✅ Corrigé
];

export default function NavLinks() {
  const pathname = usePathname();
  
  return (
    <div>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-white p-3 text-sm font-medium hover:bg-green-100 hover:text-green-600 md:flex-none md:justify-start md:p-2 md:px-3',
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
    </div>
  );
}