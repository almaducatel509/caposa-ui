import type { Metadata } from 'next';
import Withdrawaldashboard from "@/app/components/transactions/withdrawals/WithdrawalGrid";

export const metadata: Metadata = {
  title: "Retraits",
  description: "Enregistrement et décaissement des retraits d'espèces",
};

export default function WithdrawalPage() {
  return (
    <main className="w-full">
      <Withdrawaldashboard />
    </main>
  );
}
