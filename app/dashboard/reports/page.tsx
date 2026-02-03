// app/rapports/conformite/page.tsx
import { Metadata } from "next";
import PageHeader from "@/app/components/header";
import { MdReportGmailerrorred } from "react-icons/md";
import RapportConformite from "@/app/components/reports/RapportConformite";
export const metadata: Metadata = {
  title: "Rapport de Conformité | CAPOSA",
  description: "Analyse des alertes, seuils dépassés et conformité réglementaire",
};
// 
export default function RapportConformitePage() {


  return (
    <main className="w-full bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Rapport de Conformité"
          subtitle="Analyse des alertes, seuils et conformité réglementaire"
          icon={<MdReportGmailerrorred className="text-4xl text-red-600" />}
        />
      </div>

      {/* Rapport */}
      <div className="bg-white mt-12">
        <RapportConformite members={[]} />
      </div>
    </main>
  );
}

