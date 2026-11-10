import type { Metadata } from 'next';
import TreasuryDashboard from '@/app/components/treasury/TreasuryOverview';

export const metadata: Metadata = {
  title: "Gestion de la Trésorerie",
  description: "Vue d'ensemble de la trésorerie, coffres et encaissements",
};

export default function TreasuryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TreasuryDashboard />
    </div>
  );
}
