import type { Metadata } from 'next';
import TransferDashboard from "@/app/components/transactions/transfers/TransfertGrid";

export const metadata: Metadata = {
  title: "Virements & Transferts",
  description: "Gestion et suivi des virements de compte à compte",
};

export default function TransfersPage() {
  return (
    <main className="w-full bg-white">
      <TransferDashboard />
    </main>
  );
}
