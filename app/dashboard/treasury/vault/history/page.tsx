'use client';
// app/dashboard/treasury/vault/history/page.tsx

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import VaultMovementHistory from '@/app/components/treasury/Coffre/Vault';
import VaultHistoryHeader from '@/app/components/treasury/Coffre/VaultHistoryHeader';

export default function VaultHistoryPage() {

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8 print:bg-white print:p-0 print:m-0">
      <div className="max-w-6xl mx-auto">

        <VaultHistoryHeader />
        {/* ── Contenu : composant historique existant ── */}
        <VaultMovementHistory />

      </div>
    </div>
  );
}