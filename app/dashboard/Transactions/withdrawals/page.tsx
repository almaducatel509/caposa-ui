import PageHeader from "@/app/components/header";
import Withdrawaldashboard from "@/app/components/transactions/withdrawals/Withdrawaldashboard";
import TransactionHistory  from "@/app/components/transactions/withdrawals/Withdrawaldashboard"


export default function WithdrawalPage() {
 

  return (
    <main> {/* Header */}
      
      <div className="">
        <Withdrawaldashboard  />
      </div>
    </main>
  );
}
