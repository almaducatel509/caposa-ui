'use client';

import TransactionHistory from "@/app/components/transactions/history/TransactionHistory";

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TransactionHistory />
    </div>
  );
}