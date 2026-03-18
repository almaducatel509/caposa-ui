import ArchiveDetailRapport from "@/app/components/achives/rapport/ArchiveDetailRapport";


interface PageProps {
  params: {
    id: string;
  };
}
export default function RapportArchiveDetail({ params }: { params: { id: string } }) {
  return <ArchiveDetailRapport archiveId={params.id} />;
}
// Optionnel: Metadata pour SEO
export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Archive Rapport - ${params.id}`,
    description: 'Détails de l\'archive de rapport journalière'
  };
}