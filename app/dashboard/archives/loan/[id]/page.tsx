import type { Metadata } from 'next';
import ArchiveDesactivationPage from "@/app/components/achives/desactivation/ArchiveDesactivationPage";

export const metadata: Metadata = {
  title: "Archive - Prêt",
  description: "Détails de l'archive de prêt",
};

export default function Page() {
  return <ArchiveDesactivationPage />;
}
