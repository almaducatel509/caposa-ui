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
import { FaPlus, FaChevronRight, FaEye, FaChartLine, FaUser } from "react-icons/fa";
import { TbBrandUbuntu } from "react-icons/tb";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useState, useRef } from 'react'; // ← AJOUT: useRef
import { IconType } from 'react-icons';
import { MdOutlineSupervisorAccount } from "react-icons/md";

// Interface pour les sous-liens
interface SubLink {
  name: string;
  href: string;
  icon: IconType | string;
  description: string;
  category: 'overview' | 'create' | 'view';
}

// Interface pour les liens principaux
interface MainLink {
  name: string;
  href: string;
  icon: IconType;
  hasSubmenu?: boolean;
  subLinks?: SubLink[];
}

// Définition des sous-menus pour les transactions
const transactionSubLinks: SubLink[] = [
    // Consulter l'existant
   
  { 
    name: 'Mes Prêts', 
    href: '/dashboard/transactions/loans', 
    icon: '📋',
    description: 'Suivi et remboursements',
    category: 'view'
  },
  { 
    name: 'Nouveau Dépôt', 
    href: '/dashboard/transactions/deposits', 
    icon: '💵',
    description: 'Espèces, chèques, subventions',
    category: 'create'
  },
  { 
    name: 'Nouveau Retrait', 
    href: '/dashboard/transactions/withdrawals', 
    icon: '💸',
    description: 'Guichet, achats locaux',
    category: 'create'
  },
  { 
    name: 'Nouveau Virement', 
    href: '/dashboard/transactions/transfers', 
    icon: '🔄',
    description: 'Interac, transferts internes',
    category: 'create'
  },
  { 
    name: 'Demande de Prêt', 
    href: '/dashboard/transactions/loans/create', 
    icon: '🏦',
    description: 'Nouvelle demande de prêt',
    category: 'create'
  },
 { 
    name: 'Historique Complet', 
    href: '/dashboard/transactions/history', 
    icon: FaEye,
    description: 'Toutes les transactions',
    category: 'view'
  },
 
];
//http://localhost:3000/dashboard/transactions/loans
const links: MainLink[] = [
  { name: 'Acceuil', href: '/dashboard', icon: AiOutlineHome },
  { name: 'Employees', href: '/dashboard/employees', icon: HiOutlineUserGroup },
  { name: 'Membres', href: '/dashboard/members', icon: TbBrandUbuntu },
  { 
    name: 'Transactions', 
    href: '/dashboard/transactions', 
    icon: GrTransaction,
    hasSubmenu: true,
    subLinks: transactionSubLinks
  },
  { name: 'Compte', href: '/dashboard/account', icon: MdOutlineSupervisorAccount },
  { name: 'Horaires', href: '/dashboard/opening_hours', icon: GrSchedule },
  { name: 'Branches', href: '/dashboard/branches', icon: AiOutlineBranches },
  { name: 'Postes', href: '/dashboard/postes', icon: TfiLayoutListPost },
  { name: 'Jours Fériés', href: '/dashboard/holidays', icon: MdOutlineHolidayVillage },
  
  { name: 'Analyse', href: '/dashboard/reports', icon: HiOutlineDocumentDuplicate },
  { name: 'Archives', href: '/dashboard/archives', icon: LuFolderTree },
];

// Composant pour rendre les icônes de manière type-safe
const RenderIcon: React.FC<{ 
  icon: IconType | string; 
  className?: string; 
  isActive?: boolean 
}> = ({ icon, className = "w-4 h-4", isActive = false }) => {
  if (typeof icon === 'string') {
    // C'est un emoji, on ignore className et on utilise une taille fixe
    return (
      <span className="text-lg" role="img" aria-label="icon">
        {icon}
      </span>
    );
  }
  
  // C'est un composant d'icône React
  const IconComponent = icon;
  return <IconComponent className={className} />;
};

export default function NavLinks() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // ← CHANGEMENT 1: Ajout timeout pour hover plus stable
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredItem(null);
    }, 300); // ← 300ms de délai
  };

  const handleMouseEnter = (linkName: string) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setHoveredItem(linkName);
  };
  
  return (
    <div className="relative">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
        const hasSubmenu = link.hasSubmenu;
        
        return (
          <div 
            key={link.name}
            className="relative"
            onMouseEnter={() => handleMouseEnter(link.name)} // ← CHANGEMENT 2: Utilise la nouvelle fonction
            onMouseLeave={handleMouseLeave} // ← CHANGEMENT 2: Utilise la nouvelle fonction
          >
            <Link
              href={link.href}
              className={clsx(
                'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-white p-3 text-sm font-medium hover:bg-green-100 hover:text-green-600 md:flex-none md:justify-start md:p-2 md:px-3 transition-all duration-200',
                {
                  'bg-green-100 text-green-600 shadow-sm': isActive,
                },
              )}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
              {hasSubmenu && (
                <FaChevronRight 
                  className={clsx(
                    "w-3 h-3 ml-auto hidden md:block",
                    {
                      "rotate-90": hoveredItem === link.name
                    }
                  )} 
                />
              )}
            </Link>

           {/* Sous-menu hover pour les transactions - VERSION SIMPLIFIÉE */}
            {hasSubmenu && hoveredItem === link.name && (
              <div 
                className="absolute left-full top-0 ml-2 w-72 max-h-80 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden md:block"
                onMouseEnter={() => handleMouseEnter(link.name)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="p-2">
                  {/* LISTE SIMPLE - TOUS LES LIENS DIRECTEMENT */}
                  <div className="space-y-1">
                    {link.subLinks?.map((subLink) => {
                      const isSubActive = pathname === subLink.href;
                      
                      return (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group transition-colors",
                            {
                              "bg-green-50 border border-green-200": isSubActive
                            }
                          )}
                        >
                          <div className="flex-shrink-0">
                            {typeof subLink.icon === 'string' ? (
                              <span className="text-lg" role="img" aria-label="icon">
                                {subLink.icon}
                              </span>
                            ) : (
                              <subLink.icon className={clsx(
                                "w-4 h-4",
                                isSubActive ? "text-green-600" : "text-gray-500 group-hover:text-green-600"
                              )} />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={clsx(
                              "text-sm font-medium",
                              isSubActive ? "text-green-700" : "text-gray-700 group-hover:text-green-700"
                            )}>
                              {subLink.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {subLink.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}