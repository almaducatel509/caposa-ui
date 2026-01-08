// import WithdrawalForm from "@/app/components/transactions/withdrawals/WithdrawalForm"
// export default function PostForm() {
//     return(
//     <main className="w-full bg-white">
//         <div className="text-2xl font-semibold">Retrait</div>
//         <div className="bg-white mt-12">
//             <WithdrawalForm />
//         </div>   
//      </main>

//     )
// }

import TransactionHistory  from "@/app/components/transactions/History"

export default function WithdrawalDashboard() {
  return (
    <div className="">
      <TransactionHistory  />
    </div>
  );
}
