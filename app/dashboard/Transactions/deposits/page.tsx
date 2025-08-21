import DepositForm from "@/app/components/transactions/deposits/DepositForm"
export default function PostForm() {
    return(
    <main className="w-full bg-white">
        <div className="text-2xl font-semibold">Depot</div>
        <div className="bg-white mt-12">
            <DepositForm />
        </div>   
     </main>

    )
}