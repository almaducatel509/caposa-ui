import ArchiveDetailReconciliation from "@/app/components/achives/reconciliation/ArchiveDetailReconciliation";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ReconciliationArchivePage({ params }: PageProps) {
  return <ArchiveDetailReconciliation archiveId={params.id} />;
}

// Optionnel: Metadata pour SEO
export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Archive Réconciliation - ${params.id}`,
    description: 'Détails de l\'archive de réconciliation journalière'
  };
}