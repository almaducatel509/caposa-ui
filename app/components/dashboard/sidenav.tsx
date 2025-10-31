'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GrPower } from 'react-icons/gr';
import { GiReceiveMoney } from 'react-icons/gi';
import NavLinks from '@/app/components/dashboard/nav-link';

export default function SideNav() {
  const router = useRouter();

  const handleLogout = () => {
    // ✅ Remove authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // ✅ Optional: clear cookies if used
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // ✅ Redirect to presentation page
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-white shadow-inner">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-red-200 md:w-40">
          <GiReceiveMoney />
        </div>
      </Link>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />

        <div className="hidden h-auto w-full grow rounded-md bg-white md:block"></div>

        {/* ✅ Logout button */}
        <button
          onClick={handleLogout}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-red-600 md:flex-none md:justify-start md:p-2 md:px-3 transition"
        >
          <GrPower className="w-6" />
          <span className="hidden md:block">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
