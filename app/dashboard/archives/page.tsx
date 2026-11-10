import type { Metadata } from 'next';
import ArchivesPage from "@/app/components/achives/Archives";

export const metadata: Metadata = {
  title: "Centre d'Archives",
  description: "Consultation et historique des archives de l'institution",
};

export default function Page() {
  return (
    <div>
      <ArchivesPage />
    </div>
  );
}
