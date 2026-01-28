import PageHeader from "@/app/components/header";
import LoanDashboard from "@/app/components/loans/LoanDashboard";
import { BiTransfer } from "react-icons/bi";
import { FaSync } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";

export default function LoansPage() {
  return (
    <main className="w-full bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Gestion des Prêts"
          subtitle="Suivez les prêts, les demandes et les performances"
          icon={<GiReceiveMoney className="font-light text-4xl" />}
        />

        <div className="flex gap-3">
          <button className="text-sm flex items-center gap-2 px-4 py-1.5 border-2 border-green-600 text-green-600 rounded-4xl hover:bg-green-100 transition-colors">
            <FaSync className="text-sm" />
            Actualiser
          </button>

          <button className="text-sm flex items-center gap-2 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-4xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl">
            <BiTransfer className="text-xl" />
            Nouveau prêt
          </button>
        </div>
      </div>

      <div className="bg-white mt-12">
        <LoanDashboard />
      </div>
    </main>
  );
}
{/* <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyse Financière des Membres</h1>
              <p className="text-gray-600">Évaluation de la capacité de remboursement et stabilité financière</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total des membres</p>
              <p className="text-3xl font-bold text-green-600">{stats.total}</p>
            </div>
          </div> */}