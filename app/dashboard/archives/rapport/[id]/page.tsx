import type { Metadata } from 'next';
import ArchiveDetailRapport from "@/app/components/achives/rapport/ArchiveDetailRapport";

export const metadata: Metadata = {
  title: "Archive - Rapport Journalier",
  description: "Détails et état de l'archive de rapport journalier",
};

export default async function RapportArchiveDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArchiveDetailRapport archiveId={id} />;
}
