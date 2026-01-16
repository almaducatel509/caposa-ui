import PageHeader from "@/app/components/header"
import TransferDashboard from "@/app/components/transactions/transfers/TransfertDashboard"
import { FaSync } from "react-icons/fa"
import { PiHandWithdraw } from "react-icons/pi"
import { TfiWallet } from "react-icons/tfi"
export default function DepotDasboard() {
    return(
    <main className="w-full min-h-screen ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <PageHeader 
            title="Gestion des Dépôts"
            subtitle="Consultez et gérez tous les dépôts de votre coopérative"
            icon={<TfiWallet className="text-4xl text-[#008152]" />}
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
              Deposer 
            </button>
          </div>
        </div>
        <div className="">
            <TransferDashboard />
        </div>   
     </main>

    )
}