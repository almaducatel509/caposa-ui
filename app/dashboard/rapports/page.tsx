import type { Metadata } from 'next';
import StatementsPage from "@/app/components/rapport/Statementspage";

export const metadata: Metadata = {
  title: "Rapports & Documents",
  description: "Génération et consultation des rapports d'activité et états financiers",
};

export default function RapportsPage() {
  return <StatementsPage />;
}
