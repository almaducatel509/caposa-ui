// components/reports/RapportLiquidite.tsx
"use client";

import { Droplet } from "lucide-react";
import ReportDocument from "./ReportDocument";
import { ReportRow, ReportDivider } from "./ReportRow";
import { KpiData } from "@/types/kpis";

export default function RapportLiquidite({ data }: { data: KpiData }) {
  const ratio =
    (data.liquiditeDisponible / data.totalDepotsMembres) * 100;

  const status =
    ratio >= 15 ? "Conforme" : ratio >= 10 ? "À surveiller" : "Critique";

  return (
    <ReportDocument
      title="Rapport de liquidité mensuel"
      icon={<Droplet className="w-5 h-5 text-blue-600" />}
      status={status}
    >
      <ReportRow
        label="Liquidité disponible"
        value={`${data.liquiditeDisponible.toLocaleString()} G`}
      />
      <ReportRow
        label="Total dépôts membres"
        value={`${data.totalDepotsMembres.toLocaleString()} G`}
      />
      <ReportDivider />
      <ReportRow
        label="Ratio de liquidité"
        value={`${ratio.toFixed(1)} %`}
        highlight
      />
      <ReportRow label="Seuil minimal" value="15.0 %" />
    </ReportDocument>
  );
}
