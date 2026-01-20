import PageHeader from "@/app/components/header";
import ActiveLoansTable from "@/app/components/loans/ActiveLoansTable";
import { FaSync } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";

export default function ActifsPage() { 
    return (
    <main className="w-full bg-white">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <PageHeader
        title="Prêts Actifs"
        subtitle="Suivez les prêts en cours de remboursement"
        icon={<GiReceiveMoney className="font-light text-4xl" />}
        />

        <div className="flex gap-3">
        <button className="text-sm flex items-center gap-2 px-4 py-1.5 border-2 border-emerald-600 text-emerald-600 rounded-4xl hover:bg-emerald-100 transition-colors">
            <FaSync className="text-sm" />
            Actualiser
        </button>
        </div>
    </div>

    <div className="bg-white mt-12">
        <ActiveLoansTable />
    </div>
    </main>
    );
}
