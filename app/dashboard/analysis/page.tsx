// app/analyse-financiere/page.tsx

import { Metadata } from 'next';
import FinancialAnalysisDashboard from '@/app/components/analyse/DashboardAnalyseFinancier';
import PageHeader from '@/app/components/header';
import { BiTransfer } from 'react-icons/bi';
import { FaSync } from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';

export const metadata: Metadata = {
  title: 'Analyse Financière des Membres | CAPOSA',
  description: 'Évaluation de la capacité de remboursement et stabilité financière des membres',
};

export default function AnalyseFinancierePage() {
  return (
    <main className="w-full bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Analyse Financière des Membres"
          subtitle="Évaluation de la capacité de remboursement et stabilité financière"
          icon={<GiReceiveMoney className="font-light text-4xl" />}
        />

        <div className="flex gap-3">
          <button className="text-sm flex items-center gap-2 px-4 py-1.5 border-2 border-green-600 text-green-600 rounded-4xl hover:bg-green-100 transition-colors">
            <FaSync className="text-sm" />
            Actualiser
          </button>

          <button className="text-sm flex items-center gap-2 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-4xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl">
            <BiTransfer className="text-xl" />
            Nouveau prêt
          </button>
        </div>
      </div>

      <div className="bg-white mt-12">
      <FinancialAnalysisDashboard />
      </div>
    </main>
  );
}