'use client';

import { useEffect, useTransition } from 'react';
import Link from 'next/link';
import { GiReceiveMoney } from 'react-icons/gi';
import { LogOut, Loader2 } from 'lucide-react';
import NavLinks from '@/app/components/dashboard/Navlink';
import { useSession } from 'next-auth/react';
import { logout } from '@/app/lib/actions';
import { SessionManager } from '@/app/lib/api/Sessionmanager';
import { useUserRoles } from '@/app/lib/useuserroles';

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

export default function SideNav() {
  const { data: session } = useSession();
  const { roles, username } = useUserRoles();
  const [isPending, startTransition] = useTransition();

  // Rattache le cache des sessions caisse à l'utilisateur connecté :
  // sur un poste partagé, le cache du caissier précédent est vidé.
  useEffect(() => {
    if (username) SessionManager.bindUser(username);
  }, [username]);

  /**
   * Déconnexion complète (action serveur `logout`) :
   * liste noire du refresh token, suppression des cookies de jetons,
   * fin de la session NextAuth, puis redirection vers /login.
   */
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
    <div className="flex h-full flex-col bg-white border-r border-gray-100 shadow-sm">

      {/* ── Logo ── */}
      <Link
        href="/"
        className="flex h-16 items-center gap-3 px-5 border-b border-gray-100 shrink-0 hover:bg-[#F9F9F6] transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-[#2E7D32] flex items-center justify-center shrink-0">
          <GiReceiveMoney className="w-5 h-5 text-white" />
        </div>
        <div className="hidden md:block">
          <span className="text-[#2E7D32] text-lg font-bold leading-none">CAPOSA</span>
          <span className="text-xs text-gray-400 font-medium ml-1.5">v1.0</span>
        </div>
      </Link>

      {/* ── Menu ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </div>

      {/* ── Utilisateur + Déconnexion ── */}
      <div className="shrink-0 border-t border-gray-100">

        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F9F9F6] transition-colors cursor-default">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#1B5E20]">{initials}</span>
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
              {role && <p className="text-xs text-[#2E7D32] font-medium truncate">{role}</p>}
              {email && <p className="text-xs text-gray-400 truncate">{email}</p>}
            </div>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 md:justify-start transition-all disabled:opacity-60"
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