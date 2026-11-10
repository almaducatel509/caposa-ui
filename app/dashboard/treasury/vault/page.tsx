import type { Metadata } from 'next';
import CoffreDashboardHeader from '@/app/components/treasury/coffre/CoffreDashboardHeader';
import VaultOverview from '@/app/components/treasury/coffre/VaultOverview';

export const metadata: Metadata = {
  title: "Coffre-Fort",
  description: "Gestion des approvisionnements, délestages et solde du coffre",
};

export default function CoffrePage() {
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-4 sm:p-6 md:p-8 print:bg-white print:p-0 print:m-0">
      <CoffreDashboardHeader />
      <VaultOverview />
    </div>
  );
}
