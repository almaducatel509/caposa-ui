import type { Metadata } from 'next';
import ArchiveDesactivationPage from "@/app/components/achives/desactivation/ArchiveDesactivationPage";

export const metadata: Metadata = {
  title: "Archive - Désactivation",
  description: "Historique et détails de désactivation",
};

export default function Page() {
  return <ArchiveDesactivationPage />;
}
