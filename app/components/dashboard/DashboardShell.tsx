'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { GiReceiveMoney } from 'react-icons/gi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SideNav from './sidenav';
import { ThemeToggle } from '@/app/components/core/ThemeToggle';
import { useSession } from 'next-auth/react';

interface DashboardShellProps {
  username?: string;
  roles?: string[];
  children: React.ReactNode;
}

export default function DashboardShell({
  username,
  roles,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Fermer le drawer lors d'un changement de page
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Empêcher le scroll du body quand le drawer mobile est ouvert
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Fermeture avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const name = session?.user?.name || username || 'Utilisateur';
  const initials = name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* ─── Topbar Mobile (< md) ─── */}
      <header className="md:hidden sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-[#F9F9F6] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-zinc-200" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2E7D32] flex items-center justify-center shrink-0">
              <GiReceiveMoney className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#2E7D32] dark:text-[#4CAF50] text-base font-bold leading-none">
              CAPOSA
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-lg bg-[#DDEAD5] dark:bg-[#1B5E20]/40 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[#1B5E20] dark:text-[#81C784]">
              {initials}
            </span>
          </div>
        </div>
      </header>

      {/* ─── Drawer Mobile (< md) ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay sombre avec flou */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Panneau latéral coulissant */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col z-50">
            {/* En-tête du Drawer avec logo et bouton fermeture */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 rounded-xl bg-[#2E7D32] flex items-center justify-center shrink-0">
                  <GiReceiveMoney className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[#2E7D32] dark:text-[#4CAF50] text-lg font-bold leading-none">
                    CAPOSA
                  </span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">v1.0</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu SideNav dans le Drawer */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <SideNav
                username={username}
                roles={roles}
                onNavigate={() => setMobileOpen(false)}
                hideTopHeader={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Desktop Sidebar fixe (>= md) ─── */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <SideNav username={username} roles={roles} />
      </aside>

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen bg-gray-50 dark:bg-zinc-950">
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}