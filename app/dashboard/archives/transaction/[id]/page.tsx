import type { Metadata } from 'next';
import ArchiveDetailTransactionPage from "@/app/components/achives/transaction/Archivedetailtransactionpage";

export const metadata: Metadata = {
  title: "Archive - Transaction",
  description: "Détails et historique de l'archive de transaction",
};

export default function Page() {
  return <ArchiveDetailTransactionPage />;
}
