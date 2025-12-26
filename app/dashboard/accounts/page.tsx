// ============================================
// 📁 app/accounts/page.tsx
// ============================================
'use client';
import AccountGrid from '@/app/components/accounts/AccountGrid';
import PageHeader from '@/app/components/header';
import { FaWallet } from 'react-icons/fa';
import { Button } from '@heroui/react';

export default function Accounts() {
  const handleExportReport = () => {
    console.log('Export rapport');
  };

  return (
    <main className="w-full min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      <div className="px-6 py-6">
        <AccountGrid />
      </div>
    </main>
  );
}
