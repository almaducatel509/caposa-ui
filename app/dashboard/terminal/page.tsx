import type { Metadata } from 'next';
import TerminalPage from '@/app/components/terminals/CaissesPage';

export const metadata: Metadata = {
  title: "Gestion des Terminaux & Caisses",
  description: "Configuration et suivi des terminaux de caisse",
};

export default function Page() {
  return <TerminalPage />;
}