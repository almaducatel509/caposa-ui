import type { Metadata } from 'next';
import TransactionDashboard from '@/app/components/transactions/TransactionDashboard';

export const metadata: Metadata = {
  title: "Toutes les Transactions",
  description: "Journal centralisé de toutes les opérations et transactions",
};

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TransactionDashboard />
    </div>
  );
}