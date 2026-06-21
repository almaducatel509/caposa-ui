'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GiReceiveMoney } from 'react-icons/gi';
import { LogOut } from 'lucide-react';
import NavLinks from '@/app/components/dashboard/Navlink';
import { useSession, signOut } from "next-auth/react";

export default function SideNav() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };
  const { data: session, status } = useSession();

// 🔍 DEBUG : voir ce que contient la session
console.log("=== SESSION DEBUG ===");
console.log("Status:", status);
console.log("Session complète:", session);
console.log("User:", session?.user);
console.log("Name:", session?.user?.name);
console.log("Email:", session?.user?.email);

  /* TODO: remplacer par les vraies données de session NextAuth */
  // const currentUser = {
  //   name:   "Jean Dupont",
  //   email:  "jean@caisse.com",
  //   role:   "Caissier",
  // };

  // /* Initiales pour l'avatar */
  // const initials = currentUser.name
  //   .split(' ')
  //   .map(n => n[0])
  //   .join('')
  //   .toUpperCase()
  //   .slice(0, 2);
  const currentUser = {
      name:  session?.user?.name  ?? "Utilisateur",
      email: session?.user?.email ?? "Email",
      role:  (session?.user as any)?.isAdmin ? 'Administrateur' : 'Caissier',
    };

    const initials = currentUser.name
      .split(" ")
      .map(n => n[0])
      .join("")
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

      {/* ── Menu scrollable ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </div>

      {/* ── Utilisateur + Déconnexion ── */}
      <div className="shrink-0 border-t border-gray-100">

        {/* Profil */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F9F9F6] transition-colors cursor-default">

            {/* Avatar initiales — zéro dépendance */}
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#1B5E20]">{initials}</span>
            </div>

            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Déconnexion */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 md:justify-start transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden md:block">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}