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
import { FaPlus, FaChevronRight, FaEye, FaChartLine } from "react-icons/fa";
import { TbBrandUbuntu } from "react-icons/tb";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';
import { IconType } from 'react-icons';

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
  { 
    name: 'Tableau de Bord', 
    href: '/dashboard/transactions', 
    icon: FaChartLine,
    description: 'Vue d\'ensemble et statistiques',
    category: 'overview'
  },
  // Créer de nouvelles transactions
  { 
    name: 'Nouveau Dépôt', 
    href: '/dashboard/transactions/deposits/new', 
    icon: '💵',
    description: 'Espèces, chèques, subventions',
    category: 'create'
  },
  { 
    name: 'Nouveau Retrait', 
    href: '/dashboard/transactions/withdrawals/new', 
    icon: '💸',
    description: 'Guichet, achats locaux',
    category: 'create'
  },
  { 
    name: 'Nouveau Virement', 
    href: '/dashboard/transactions/transfers/new', 
    icon: '🔄',
    description: 'Interac, transferts internes',
    category: 'create'
  },
  { 
    name: 'Demande de Prêt', 
    href: '/dashboard/transactions/loans/new', 
    icon: '🏦',
    description: 'Nouvelle demande de prêt',
    category: 'create'
  },
  // Consulter l'existant
  { 
    name: 'Historique Complet', 
    href: '/dashboard/transactions/history', 
    icon: FaEye,
    description: 'Toutes les transactions',
    category: 'view'
  },
  { 
    name: 'Mes Prêts', 
    href: '/dashboard/transactions/loans', 
    icon: '📋',
    description: 'Suivi et remboursements',
    category: 'view'
  }
];

const links: MainLink[] = [
  { name: 'Acceuil', href: '/dashboard', icon: AiOutlineHome },
  { name: 'Horaires', href: '/dashboard/opening_hours', icon: GrSchedule },
  { name: 'Postes', href: '/dashboard/postes', icon: TfiLayoutListPost },
  { name: ' Jours Fériés', href: '/dashboard/holidays', icon: MdOutlineHolidayVillage },
  { name: 'Branches', href: '/dashboard/branches', icon: AiOutlineBranches },
  { name: 'Employees', href: '/dashboard/employees', icon: HiOutlineUserGroup },
  { name: 'Membres', href: '/dashboard/members', icon: TbBrandUbuntu },
  { 
    name: 'Transactions', 
    href: '/dashboard/transactions', 
    icon: GrTransaction,
    hasSubmenu: true,
    subLinks: transactionSubLinks
  },
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
            onMouseEnter={() => setHoveredItem(link.name)}
            onMouseLeave={() => setHoveredItem(null)}
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

            {/* Sous-menu hover pour les transactions */}
            {hasSubmenu && hoveredItem === link.name && (
              <div className="absolute left-full top-0 ml-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 hidden md:block">
                <div className="p-4">
                  {/* En-tête du sous-menu */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <GrTransaction className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Transactions</h3>
                      <p className="text-xs text-gray-500">Gestion financière complète</p>
                    </div>
                  </div>

                  {/* Liste des sous-liens */}
                  <div className="space-y-3">
                    {/* Section Créer */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <FaPlus className="w-3 h-3" />
                        Créer
                      </h4>
                      <div className="space-y-1">
                        {link.subLinks?.filter(item => item.category === 'create').map((subLink) => {
                          const isSubActive = pathname === subLink.href;
                          
                          return (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group",
                                {
                                  "bg-green-50 border border-green-200": isSubActive
                                }
                              )}
                            >
                              <div className="flex-shrink-0">
                                {typeof subLink.icon === 'string' ? (
                                  <RenderIcon icon={subLink.icon} />
                                ) : (
                                  <RenderIcon 
                                    icon={subLink.icon} 
                                    className={clsx(
                                      "w-4 h-4",
                                      isSubActive ? "text-green-600" : "text-gray-500 group-hover:text-green-600"
                                    )}
                                  />
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
                              <FaChevronRight className="w-3 h-3 text-gray-400 group-hover:text-green-500" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section Vue d'ensemble */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <FaChartLine className="w-3 h-3" />
                        Consulter
                      </h4>
                      <div className="space-y-1">
                        {link.subLinks?.filter(item => item.category === 'overview' || item.category === 'view').map((subLink) => {
                          const isSubActive = pathname === subLink.href;
                          
                          return (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group",
                                {
                                  "bg-green-50 border border-green-200": isSubActive
                                }
                              )}
                            >
                              <div className="flex-shrink-0">
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
                              <FaChevronRight className="w-3 h-3 text-gray-400 group-hover:text-green-500" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer du sous-menu */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>💡 Tip: Clic direct pour créer une transaction</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">7 actions</span>
                    </div>
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