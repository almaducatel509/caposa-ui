// app/analyse-financiere/page.tsx

import { Metadata } from 'next';
import FinancialAnalysisDashboard from '@/app/components/analyse/DashboardAnalyseFinancier';

export const metadata: Metadata = {
  title: 'Analyse Financière des Membres | CAPOSA',
  description: 'Évaluation de la capacité de remboursement et stabilité financière des membres',
};

export default function AnalyseFinancierePage() {
  return (
    <div className="w-full">
      <FinancialAnalysisDashboard />
    </div>
  );
}
// ```

// **Structure de dossiers recommandée :**
// ```
// app/
// ├── analyse-financiere/
// │   └── page.tsx         ← Votre nouvelle page
// ├── components/
// │   └── analyse/
// │       ├── DashboardAnalyseFinancier.tsx
// │       ├── MemberCardAnalyse.tsx
// │       └── MemberDetailModal.tsx
// └── types/
//     └── analyses.ts