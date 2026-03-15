import PageHeader from "@/app/components/header";
import LoanRequestsTable from "@/app/components/loans/LoanRequestsTable";
import { FaSync } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
export default function LoanRequestsPage() {
    return (
        <main className="w-full bg-white">
            <LoanRequestsTable />
        </main>
    );
};

