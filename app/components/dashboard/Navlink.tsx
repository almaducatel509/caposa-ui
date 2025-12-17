'use client';

import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { IconType } from 'react-icons';
import { links } from './menu-links';
import { useState } from "react";

// Interface pour les sections du menu
interface MenuSection {
  title: string;
  items: typeof links;
}

export default function NavLinks() {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpand = (linkName: string) => {
    setExpandedItem(expandedItem === linkName ? null : linkName);
  };

  // 🔥 ORGANISATION DU MENU PAR SECTIONS
  const menuSections: MenuSection[] = [
    {
      title: "MAIN MENU",
      items: links.filter(link => 
        ['Accueil', 'Employés', 'Membres', 'Comptes'].includes(link.name)
      )
    },
    {
      title: "FEATURES",
      items: links.filter(link => 
        ['Transactions', 'Prêts', 'Trésorerie', 'Analyse', 'Rapports'].includes(link.name)
      )
    },
    {
      title: "GENERAL",
      items: links.filter(link => 
        ['Horaires', 'Branches', 'Postes', 'Jours Fériés', 'Archives', 'Paramètres bancaires'].includes(link.name)
      )
    }
  ];
  
  return (
    <div className="space-y-6">
      {menuSections.map((section) => (
        <div key={section.title}>
          {/* Section Title */}
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </p>
          </div>

          {/* Section Items */}
          <div className="space-y-1">
            {section.items.map((link) => {
              const LinkIcon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              const hasSubmenu = link.hasSubmenu;
              const isExpanded = expandedItem === link.name;
              
              return (
                <div key={link.name}>
                  {/* Main Link */}
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleExpand(link.name)}
                      className={clsx(
                        'flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200',
                        {
                          'bg-green-100 text-green-600': isActive,
                          'text-gray-700 hover:bg-gray-100': !isActive,
                        },
                      )}
                    >
                      <LinkIcon className="w-5 h-5 shrink-0" />
                      <span className="hidden md:block flex-1 text-left">{link.name}</span>
                      {isExpanded ? (
                        <FaChevronDown className="w-3 h-3 hidden md:block shrink-0" />
                      ) : (
                        <FaChevronRight className="w-3 h-3 hidden md:block shrink-0" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={clsx(
                        'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200',
                        {
                          'bg-green-100 text-green-600': isActive,
                          'text-gray-700 hover:bg-gray-100': !isActive,
                        },
                      )}
                    >
                      <LinkIcon className="w-5 h-5 shrink-0" />
                      <span className="hidden md:block flex-1">{link.name}</span>
                    </Link>
                  )}

                  {/* Submenu expandable (accordéon) */}
                  {hasSubmenu && isExpanded && (
                    <div className="mt-1 ml-8 space-y-1 hidden md:block">
                      {link.subLinks?.map((subLink) => {
                        const isSubActive = pathname === subLink.href;
                        
                        return (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className={clsx(
                              "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors",
                              {
                                "bg-green-50 text-green-700 font-medium": isSubActive,
                                "text-gray-600 hover:text-gray-900 hover:bg-gray-50": !isSubActive
                              }
                            )}
                          >
                            {subLink.icon && (
                              typeof subLink.icon === 'string' ? (
                                <span className="text-base" role="img" aria-label="icon">
                                  {subLink.icon}
                                </span>
                              ) : (
                                (() => {
                                  const IconComp = subLink.icon;
                                  return (
                                    <IconComp
                                      className={clsx(
                                        "w-4 h-4 shrink-0",
                                        isSubActive ? "text-green-600" : "text-gray-400"
                                      )}
                                    />
                                  );
                                })()
                              )
                            )}
                            <span className="truncate">{subLink.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}