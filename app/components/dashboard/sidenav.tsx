'use client';

import { useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Landmark, LogOut, Loader2 } from 'lucide-react';
import NavLinks from '@/app/components/dashboard/Navlink';
import { useSession } from 'next-auth/react';
import { logout } from '@/app/lib/actions';
import { SessionManager } from '@/app/lib/api/Sessionmanager';
import { useUserRoles } from '@/app/lib/useUserRoles';
import { ThemeToggle } from '@/app/components/core/ThemeToggle';

/** Libellés lisibles des rôles Django (déjà normalisés par useUserRoles). */
const ROLE_LABELS: Record<string, string> = {
  administrateur:  'Administrateur',
  admin:           'Administrateur',
  directeur:       'Directeur',
  superviseur:     'Superviseur',
  caissier:        'Caissier',
  agent_credit:    'Agent de crédit',
  agent_de_credit: 'Agent de crédit',
  conseiller:      'Conseiller',
  tresorier:       'Trésorier',
};

interface SideNavProps {
  username?: string;
  roles?: string[];
}

export default function SideNav({ username: propUsername, roles: propRoles }: SideNavProps = {}) {
  const { data: session } = useSession();
  const { roles: hookRoles, username: hookUsername } = useUserRoles();
  const [isPending, startTransition] = useTransition();

  const roles = propRoles && propRoles.length > 0 ? propRoles : hookRoles;
  const username = propUsername || hookUsername;

  // Rattache le cache des sessions caisse à l'utilisateur connecté
  useEffect(() => {
    if (username) {
      SessionManager.bindUser(username);
    }
  }, [username]);

  const handleLogout = () => {
    SessionManager.clear();
    startTransition(async () => {
      await logout();
    });
  };

  const name  = session?.user?.name || username || 'Utilisateur';
  const email = session?.user?.email || '';
  const role  = roles.map(r => ROLE_LABELS[r] ?? r).join(' · ');

  const initials = name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 shadow-sm transition-colors duration-200">
      {/* ── Logo + Bouton Thème à 3 états ── */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2E7D32] flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:flex items-baseline gap-1.5">
            <span className="text-[#2E7D32] dark:text-[#4CAF50] text-lg font-bold leading-none">CAPOSA</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">v1.0</span>
          </div>
        </Link>

        {/* Bouton 3 états (Light / Dark / Système) à droite du logo */}
        <ThemeToggle />
      </div>

      {/* ── Navigation ── */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-y-auto">
        <NavLinks />
      </div>

      {/* ── Utilisateur + Déconnexion ── */}
      <div className="shrink-0 border-t border-gray-100 dark:border-zinc-800">
        {/* Profil utilisateur */}
        <div className="p-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F9F9F6] dark:hover:bg-zinc-800/60 transition-colors cursor-default">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] dark:bg-[#1B5E20]/40 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#1B5E20] dark:text-[#81C784]">{initials}</span>
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">{name}</p>
              {role && <p className="text-xs text-[#2E7D32] dark:text-[#4CAF50] font-medium truncate">{role}</p>}
              {email && <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{email}</p>}
            </div>
          </div>
        </div>

        {/* Déconnexion */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 px-3 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 md:justify-start transition-all disabled:opacity-60 cursor-pointer"
          >
            {isPending
              ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              : <LogOut className="w-4 h-4 shrink-0" />}
            <span className="hidden md:block">{isPending ? 'Déconnexion…' : 'Déconnexion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
