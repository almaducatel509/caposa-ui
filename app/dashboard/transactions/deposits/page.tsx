import type { Metadata } from 'next';
import DepositGrid from "@/app/components/transactions/deposits/DepositGrid";

export const metadata: Metadata = {
  title: "Dépôts",
  description: "Enregistrement et gestion des dépôts d'espèces et chèques",
};

export default function DepotDashboard() {
  return (
    <main className="w-full min-h-screen">
      <DepositGrid />
    </main>
  );
}