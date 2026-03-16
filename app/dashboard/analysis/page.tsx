// app/analyse-financiere/page.tsx
import { Metadata } from 'next';
import FinancialAnalysisDashboard from '@/app/components/analyse/DashboardAnalyseFinancier';

export const metadata: Metadata = {
  title: 'Analyse Financière des Membres | CAPOSA',
  description: 'Évaluation de la capacité de remboursement et stabilité financière des membres',
};

export default function AnalyseFinancierePage() {
  
  return (
    <main className="w-full bg-white">
      <FinancialAnalysisDashboard />
    </main>
  );
}