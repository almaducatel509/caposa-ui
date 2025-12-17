'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GrPower } from 'react-icons/gr';
import { GiReceiveMoney } from 'react-icons/gi';
import NavLinks from '@/app/components/dashboard/Navlink';
import { Avatar } from "@heroui/react";

export default function SideNav() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    router.push('/');
  };

  // 🧑 Données utilisateur (remplacer par vos vraies données de session)
  const currentUser = {
    name: "Jean Dupont",
    email: "jean@caisse.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "Admin"
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 relative z-50">
      {/* Logo Header */}
      <Link
        className="mb-2 flex h-16 items-center justify-center bg-green-600 p-4 shrink-0"
        href="/"
      >
        <div className="w-12 text-white">
          <GiReceiveMoney className="w-full h-full" />
        </div>
        <span className="ml-3 text-white text-xl font-bold hidden md:block">OripioFin</span>
      </Link>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </div>

      {/* Bottom Section: User Profile + Logout */}
      <div className="shrink-0 border-t border-gray-200 bg-white">
        {/* User Profile */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Avatar 
              src={currentUser.avatar}
              name={currentUser.name}
              className="w-10 h-10 shrink-0"
              showFallback
            />
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-md bg-white border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 md:justify-start transition-all"
          >
            <GrPower className="w-5 h-5" />
            <span className="hidden md:block">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}