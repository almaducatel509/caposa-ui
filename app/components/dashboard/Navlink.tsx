'use client';

import { ChevronRight, ChevronDown } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { links, MainLink } from './menu-links';
import { useState, useEffect, useMemo } from "react";
import { useUserRoles } from '@/app/lib/useUserRoles';

interface MenuSection {
  title: string;
  items: MainLink[];
}

export default function NavLinks() {
  const pathname = usePathname();
  const { hasRole, loading } = useUserRoles();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpand = (linkName: string) => {
    setExpandedItem((prev) => (prev === linkName ? null : linkName));
  };

  // Auto-expansion inspirée de Devora : si on navigue sur un sous-lien,
  // on déplie automatiquement le menu parent correspondant.
  useEffect(() => {
    const activeParent = links.find(
      (l) =>
        l.hasSubmenu &&
        l.subLinks?.some(
          (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
        )
    );
    if (activeParent) {
      setExpandedItem(activeParent.name);
    }
  }, [pathname]);

  // Filtrage RBAC dynamique des liens et de leurs sous-menus
  const visibleLinks = useMemo(() => {
    if (loading) return [];

    return links
      .map((link) => {
        // Vérification des droits sur le lien principal
        if (link.roles && link.roles.length > 0 && !hasRole(...link.roles)) {
          return null;
        }

        // Si le lien a un sous-menu, on filtre aussi ses sous-liens
        if (link.hasSubmenu && link.subLinks) {
          const allowedSubLinks = link.subLinks.filter(
            (sub) => !sub.roles || sub.roles.length === 0 || hasRole(...sub.roles)
          );

          if (allowedSubLinks.length === 0) {
            return null;
          }

          return { ...link, subLinks: allowedSubLinks };
        }

        return link;
      })
      .filter(Boolean) as MainLink[];
  }, [hasRole, loading]);

  const menuSections: MenuSection[] = useMemo(() => {
    const mainMenuNames = ['Accueil', 'Employés', 'Membres', 'Comptes'];
    const featuresNames = ['Session', 'Transactions', 'Prêts', 'Trésorerie', 'Rapports'];
    const generalNames = ['Terminal', 'Horaires', 'Succursales', 'Postes', 'Calendrier', 'Paramètres'];

    const sections: MenuSection[] = [
      {
        title: "MAIN MENU",
        items: visibleLinks.filter((l) => mainMenuNames.includes(l.name)),
      },
      {
        title: "FEATURES",
        items: visibleLinks.filter((l) => featuresNames.includes(l.name)),
      },
      {
        title: "GENERAL",
        items: visibleLinks.filter(
          (l) => generalNames.includes(l.name) || (!mainMenuNames.includes(l.name) && !featuresNames.includes(l.name))
        ),
      },
    ];

    return sections.filter((section) => section.items.length > 0);
  }, [visibleLinks]);

  if (loading) {
    return (
      <div className="space-y-4 p-3 animate-pulse">
        <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        <div className="space-y-2">
          <div className="h-9 bg-gray-100 dark:bg-zinc-800/50 rounded-xl"></div>
          <div className="h-9 bg-gray-100 dark:bg-zinc-800/50 rounded-xl"></div>
          <div className="h-9 bg-gray-100 dark:bg-zinc-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {menuSections.map((section) => (
        <div key={section.title}>
          {/* Titre section */}
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
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
                      type="button"
                      onClick={() => toggleExpand(link.name)}
                      className={clsx(
                        'flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all cursor-pointer',
                        isActive
                          ? 'bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/30 dark:text-[#81C784]'
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-[#F9F9F6] dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-zinc-100',
                      )}
                    >
                      <LinkIcon
                        className={clsx(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-[#2E7D32] dark:text-[#4CAF50]'
                            : 'text-gray-400 dark:text-zinc-500'
                        )}
                      />
                      <span className="hidden md:block flex-1 text-left">{link.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 hidden md:block shrink-0 text-gray-400 dark:text-zinc-500 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 hidden md:block shrink-0 text-gray-400 dark:text-zinc-500 transition-transform duration-200" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={clsx(
                        'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/30 dark:text-[#81C784]'
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-[#F9F9F6] dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-zinc-100',
                      )}
                    >
                      <LinkIcon
                        className={clsx(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-[#2E7D32] dark:text-[#4CAF50]'
                            : 'text-gray-400 dark:text-zinc-500'
                        )}
                      />
                      <span className="hidden md:block flex-1">{link.name}</span>
                    </Link>
                  )}

                  {/* Sous-menu accordéon */}
                  {link.hasSubmenu && isExpanded && (
                    <div className="mt-0.5 ml-7 space-y-0.5 hidden md:block border-l-2 border-[#DDEAD5] dark:border-[#1B5E20]/40 pl-3">
                      {link.subLinks?.map((subLink) => {
                        const SubIcon = subLink.icon;
                        const isSubActive =
                          pathname === subLink.href ||
                          (subLink.href !== '/dashboard' && pathname.startsWith(subLink.href + '/'));

                        return (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className={clsx(
                              'flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm transition-colors',
                              isSubActive
                                ? 'bg-[#DDEAD5] text-[#1B5E20] dark:bg-[#1B5E20]/30 dark:text-[#81C784] font-semibold'
                                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-[#F9F9F6] dark:hover:bg-zinc-800/60',
                            )}
                          >
                            {SubIcon && (
                              <SubIcon
                                className={clsx(
                                  'w-3.5 h-3.5 shrink-0 transition-colors',
                                  isSubActive
                                    ? 'text-[#2E7D32] dark:text-[#4CAF50]'
                                    : 'text-gray-400 dark:text-zinc-500'
                                )}
                              />
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
