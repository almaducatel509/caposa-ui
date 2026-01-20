import PageHeader from "@/app/components/header";
import LoanRequestsTable from "@/app/components/loans/LoanRequestsTable";
import { FaSync } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
export default function LoanRequestsPage() {
    return (
        <main className="w-full bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            <PageHeader
            title="Demandes de Prêt"
            subtitle="Liste des demandes en attente et en analyse"
            icon={<GiReceiveMoney className="font-light text-4xl" />}
            />

            <div className="flex gap-3">
            <button className="text-sm flex items-center gap-2 px-4 py-1.5 border-2 border-blue-600 text-blue-600 rounded-4xl hover:bg-blue-100 transition-colors">
                <FaSync className="text-sm" />
                Actualiser
            </button>
            </div>
        </div>

        <div className="bg-white mt-12">
            <LoanRequestsTable />
        </div>
        </main>
    );
};

