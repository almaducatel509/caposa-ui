import PageHeader from "@/app/components/header"
import TransferDashboard from "@/app/components/transactions/transfers/TransfertDashboard"
import { BiTransfer } from "react-icons/bi"
import { FaSync } from "react-icons/fa"
import { GiReceiveMoney } from "react-icons/gi"
import { PiHandWithdraw } from "react-icons/pi"
export default function PostForm() {
    return(
    <main className="w-full bg-white">
       
        <div className="bg-white mt-12">
            <TransferDashboard />
        </div>   
     </main>

    )
}