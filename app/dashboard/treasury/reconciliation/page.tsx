import type { Metadata } from 'next';
import ReconciliationPage from '@/app/components/treasury/audit/ReconciliationPage';

export const metadata: Metadata = {
  title: "Rapprochement & Réconciliation",
  description: "Rapprochement de trésorerie, suivi des écarts et santé financière",
};

export default function ReconciliationDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ReconciliationPage />
    </div>
  );
}
