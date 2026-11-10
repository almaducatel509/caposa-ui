import type { Metadata } from 'next';
import VaultMovementHistory from '@/app/components/treasury/coffre/Vault';
import VaultHistoryHeader from '@/app/components/treasury/coffre/VaultHistoryHeader';

export const metadata: Metadata = {
  title: "Historique du Coffre-Fort",
  description: "Mouvements, approvisionnements et délestages du coffre",
};

export default function VaultHistoryPage() {
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-4 sm:p-6 md:p-8 print:bg-white print:p-0 print:m-0">
      <div className="max-w-6xl mx-auto">
        <VaultHistoryHeader />
        <VaultMovementHistory />
      </div>
    </div>
  );
}
