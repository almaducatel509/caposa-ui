import type { Metadata } from 'next';
import TransactionHistory from "@/app/components/transactions/history/TransactionHistory";

export const metadata: Metadata = {
  title: "Historique des Transactions",
  description: "Consultation chronologique détaillée de toutes les transactions",
};

export default function TransactionsHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TransactionHistory />
    </div>
  );
}
