"use client";

import { ShieldCheck } from "lucide-react";
import ReportDocument from "./ReportDocument";
import { ReportRow, ReportDivider } from "./ReportRow";
import { MemberFinancialData } from "@/types/analyses";
import { generateAlerts } from "../analyse/generateAlerts";

interface Props {
  members: MemberFinancialData[];
}

export default function RapportConformite({ members }: Props) {
  const alerts = generateAlerts(members);

  const totalAlertes = alerts.length;
  const alertesCritiques = alerts.filter(a => a.severity === 'critique');
  const alertesActives = alerts.filter(a =>
    ['a_traiter', 'a_reflechir'].includes(a.status)
  );

  const seuilsDepasses = Array.from(
    new Set(alertesCritiques.map(a => a.title))
  );

  const statut =
    alertesCritiques.length === 0
      ? "Conforme"
      : alertesCritiques.length <= 3
      ? "À surveiller"
      : "Critique";

  return (
    <ReportDocument
      title="Rapport de conformité"
      icon={<ShieldCheck className="w-5 h-5 text-emerald-700" />}
      status={statut}
    >
      <ReportRow
        label="Total des alertes"
        value={totalAlertes.toString()}
      />

      <ReportRow
        label="Alertes critiques"
        value={alertesCritiques.length.toString()}
        highlight
      />

      <ReportRow
        label="Alertes en cours de traitement"
        value={alertesActives.length.toString()}
      />

      <ReportDivider />

      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-700">
          Seuils réglementaires dépassés :
        </p>

        {seuilsDepasses.length === 0 ? (
          <p className="text-sm text-emerald-700">
            Aucun seuil dépassé
          </p>
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-700">
            {seuilsDepasses.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        )}
      </div>
    </ReportDocument>
  );
}
