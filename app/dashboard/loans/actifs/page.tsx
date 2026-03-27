import PageHeader from "@/app/components/header";
import ActiveLoansTable from "@/app/components/loans/ActiveLoansTable";
import { FaSync } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";

export default function ActifsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      {/* Header + bouton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Prêts Actifs"
          subtitle="Suivez les prêts en cours de remboursement"
        />
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:border-[#2E7D32]/30 transition-colors shrink-0">
          <FaSync className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      <ActiveLoansTable />
    </div>
  );
}