import CoffreDashboardHeader from '@/app/components/treasury/Coffre/CoffreDashboardHeader';
import VaultOverview from '@/app/components/treasury/Coffre/VaultOverview';

export default function CoffrePage() {

  return(
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8 print:bg-white print:p-0 print:m-0">
      <CoffreDashboardHeader />
      <VaultOverview />;
    </div>
  )
  
}