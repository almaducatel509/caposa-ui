import type { Metadata } from 'next';
import ArchiveDetailReconciliation from "@/app/components/achives/reconciliation/ArchiveDetailReconciliation";

export const metadata: Metadata = {
  title: "Archive - Réconciliation",
  description: "Détails et état de l'archive de réconciliation journalière",
};

export default async function ReconciliationArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArchiveDetailReconciliation archiveId={id} />;
}
