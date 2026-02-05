// app/dashboard/reports/endettement/page.tsx
import { Metadata } from "next";
import PageHeader from "@/app/components/header";
import { Users } from "lucide-react";
import { KpiData } from "@/types/kpis";
import RapportEndettementMembre from "@/app/components/reports/RapportEndettementMembre";

export const metadata: Metadata = {
  title: "Rapport d'Endettement des Membres | CAPOSA",
  description: "Analyse du niveau d'endettement et de la capacité de remboursement des membres",
};

// Génération de données mock étendues (TOUS les champs requis)
const generateExtendedKpiData = (): KpiData => {
  return {
    // KPIs Financiers (existants)
    ratioEndettement: 28 + Math.random() * 15, // 28-43%
    tauxRecouvrement: 92 + Math.random() * 7, // 92-99%
    capaciteRemboursementMoyenne: 12000 + Math.random() * 8000,
    ratioCreancesDouteuses: 2 + Math.random() * 6, // 2-8%
    
    // KPIs Liquidité (existants)
    ratioLiquidite: 1.2 + Math.random() * 0.8, // 1.2-2.0
    reservesObligatoires: 8 + Math.random() * 4, // 8-12%
    couvertureRisques: 85 + Math.random() * 12, // 85-97%
    
    // KPIs Membres (existants)
    scoreStabiliteMoyen: 65 + Math.random() * 25, // 65-90
    tauxActiviteMembres: 75 + Math.random() * 20, // 75-95%
    ratioNouveauxMembres: 5 + Math.random() * 10, // 5-15%
    
    // NOUVEAUX CHAMPS pour rapports réglementaires
    liquiditeDisponible: 800000 + Math.random() * 700000, // 800k-1.5M G
    totalDepotsMembres: 4000000 + Math.random() * 3000000, // 4M-7M G
    capitalPropre: 600000 + Math.random() * 400000, // 600k-1M G
    actifsponderes: 5000000 + Math.random() * 3000000, // 5M-8M G
    portefeuilleTotalPrets: 4500000 + Math.random() * 2500000, // 4.5M-7M G
    montantEnSouffrance: 150000 + Math.random() * 350000, // 150k-500k G
    repartitionSouffrance: {
      jours30: 100000 + Math.random() * 150000,
      jours60: 50000 + Math.random() * 100000,
      jours90Plus: 30000 + Math.random() * 70000,
    },
    
    // Meta
    periode: 'Janvier 2026',
    lastUpdate: new Date()
  };
};

export default function RapportEndettementPage() {
  const kpiData = generateExtendedKpiData();

  return (
    <main className="w-full bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Rapport d'Endettement des Membres"
          subtitle="Analyse du niveau d'endettement et du risque de surendettement"
          icon={<Users className="text-4xl text-purple-600" />}
        />
      </div>

      {/* Rapport */}
      <div className="bg-white mt-12">
        <RapportEndettementMembre data={kpiData} />
      </div>
    </main>
  );
}