import LoanApplicationForm from "@/app/components/transactions/loans/LoanFormFields"
import TransferForm from "@/app/components/transactions/transfers/TransferForm"
export default function PostForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Virement</div>
        <div className="bg-white mt-12">
            <TransferForm />
        </div>   
     </main>

    )
}