import PageHeader from "@/app/components/header";
import TransactionHistory  from "@/app/components/transactions/withdrawals/History"
import { FaSync } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import { PiHandWithdraw } from "react-icons/pi";

export default function WithdrawalDashboard() {
 

  return (
    <main> {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Gestion des Retraits"
          subtitle="Gérez tous les retraits et leurs informations"
          icon={<GiReceiveMoney className="font-light text-4xl" />}
        />
        
        <div className="flex gap-3">
          <button
            className="text-sm flex items-center gap-2 px-4 py-1.5 border-2 border-green-600 text-green-600 rounded-4xl hover:bg-green-100 transition-colors"
          >
            <FaSync className="text-sm" />
            Actualiser
          </button>
          <button
            className="text-sm flex items-center gap-2 px-4  bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-4xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <PiHandWithdraw className="text-xl" />
            Retirer 
          </button>
        </div>
      </div>
      <div className="">
        <TransactionHistory  />
      </div>
    </main>
  );
}
