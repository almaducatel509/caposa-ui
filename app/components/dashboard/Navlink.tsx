'use client';

import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { IconType } from 'react-icons';
import { links } from './menu-links';
import { useState } from "react";

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

  const menuSections: MenuSection[] = [
    {
      title: "MAIN MENU",
      items: links.filter(l =>
        ['Accueil', 'Employés', 'Membres', 'Comptes'].includes(l.name)
      ),
    },
    {
      title: "FEATURES",
      items: links.filter(l =>
        ['Transactions', 'Prêts', 'Trésorerie', 'Analyse', 'Rapports'].includes(l.name)
      ),
    },
    {
      title: "GENERAL",
      items: links.filter(l =>
        ['Horaires', 'Branches', 'Postes', 'Calendrier', 'Archives', 'Settings'].includes(l.name)
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {menuSections.map((section) => (
        <div key={section.title}>

          {/* Titre section */}
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {section.title}
            </p>
          </div>

          {/* Items */}
          <div className="space-y-0.5">
            {section.items.map((link) => {
              const LinkIcon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'));
              const isExpanded = expandedItem === link.name;

              return (
                <div key={link.name}>

                  {/* Lien principal */}
                  {link.hasSubmenu ? (
                    <button
                      onClick={() => toggleExpand(link.name)}
                      className={clsx(
                        'flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[#DDEAD5] text-[#1B5E20]'
                          : 'text-gray-600 hover:bg-[#F9F9F6] hover:text-gray-900',
                      )}
                    >
                      <LinkIcon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-[#2E7D32]' : 'text-gray-400')} />
                      <span className="hidden md:block flex-1 text-left">{link.name}</span>
                      {isExpanded
                        ? <FaChevronDown className="w-2.5 h-2.5 hidden md:block shrink-0 text-gray-400" />
                        : <FaChevronRight className="w-2.5 h-2.5 hidden md:block shrink-0 text-gray-400" />
                      }
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={clsx(
                        'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[#DDEAD5] text-[#1B5E20]'
                          : 'text-gray-600 hover:bg-[#F9F9F6] hover:text-gray-900',
                      )}
                    >
                      <LinkIcon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-[#2E7D32]' : 'text-gray-400')} />
                      <span className="hidden md:block flex-1">{link.name}</span>
                    </Link>
                  )}

                  {/* Sous-menu accordéon */}
                  {link.hasSubmenu && isExpanded && (
                    <div className="mt-0.5 ml-7 space-y-0.5 hidden md:block border-l-2 border-[#DDEAD5] pl-3">
                      {link.subLinks?.map((subLink) => {
                        const isSubActive = pathname === subLink.href;

                        return (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className={clsx(
                              'flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm transition-colors',
                              isSubActive
                                ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-[#F9F9F6]',
                            )}
                          >
                            {subLink.icon && (
                              typeof subLink.icon === 'string' ? (
                                <span className="text-sm">{subLink.icon}</span>
                              ) : (
                                (() => {
                                  const IconComp = subLink.icon as IconType;
                                  return (
                                    <IconComp
                                      className={clsx(
                                        'w-3.5 h-3.5 shrink-0',
                                        isSubActive ? 'text-[#2E7D32]' : 'text-gray-400',
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