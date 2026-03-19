// app/components/rapports/RapportConformite.tsx
'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import ReportDocument, {
  ReportSection, ReportStatusBox, ReportActionPlan,
} from './ReportDocument';
import { KpiData, formatPct } from '@/types/kpis';

interface Props {
  data:             KpiData;
  onRetour?:        () => void;
  objectif?:        string;
  periodeAnalysee?: string;
}

// ─── Génération des alertes depuis les KpiData ────────────────────────────────
// Logique centralisée ici — même source que KpiAlertsSection.
// En production, ces alertes viendraient de l'API : GET /api/alertes/institutionnelles
interface AlerteConformite {
  type:        'critique' | 'alerte';
  titre:       string;
  description: string;
  action:      string;
}

function genererAlertes(d: KpiData): AlerteConformite[] {
  const alertes: AlerteConformite[] = [];

  if (d.tauxRecouvrement < 95)
    alertes.push({ type: d.tauxRecouvrement < 90 ? 'critique' : 'alerte', titre: 'Taux de remboursement < 95 %',   description: `Taux actuel : ${formatPct(d.tauxRecouvrement)}`,         action: 'Intensifier le suivi des remboursements et contacter les retardataires.' });
  if (d.ratioLiquidite < 1.5)
    alertes.push({ type: d.ratioLiquidite < 1.2 ? 'critique' : 'alerte',  titre: 'Ratio de liquidité < 1.5',       description: `Ratio actuel : ${d.ratioLiquidite.toFixed(2)}`,          action: 'Augmenter les réserves liquides et limiter les décaissements.' });
  if (d.ratioCreancesDouteuses > 5)
    alertes.push({ type: d.ratioCreancesDouteuses > 8 ? 'critique' : 'alerte', titre: 'Prêts en souffrance > 5 %', description: `Taux actuel : ${formatPct(d.ratioCreancesDouteuses)}`,   action: 'Analyser les prêts à risque et mettre en place des plans de recouvrement.' });
  if (d.ratioEndettement > 35)
    alertes.push({ type: d.ratioEndettement > 40 ? 'critique' : 'alerte',  titre: 'Endettement membres > 35 %',   description: `Ratio actuel : ${formatPct(d.ratioEndettement)}`,         action: 'Réviser les critères d\'octroi et limiter les prêts aux membres à risque.' });
  if (d.reservesObligatoires < 10)
    alertes.push({ type: d.reservesObligatoires < 8 ? 'critique' : 'alerte', titre: 'Réserves obligatoires < 10 %', description: `Taux actuel : ${formatPct(d.reservesObligatoires)}`, action: 'Constituer les réserves conformément à la réglementation BRH.' });
  if (d.couvertureRisques < 90)
    alertes.push({ type: d.couvertureRisques < 80 ? 'critique' : 'alerte', titre: 'Couverture des risques < 90 %', description: `Taux actuel : ${formatPct(d.couvertureRisques)}`,       action: 'Augmenter les provisions pour risques.' });
  if (d.tauxActiviteMembres < 85)
    alertes.push({ type: d.tauxActiviteMembres < 75 ? 'critique' : 'alerte', titre: 'Activité des membres < 85 %', description: `Taux actuel : ${formatPct(d.tauxActiviteMembres)}`,   action: 'Campagne de réactivation des membres inactifs.' });

  return alertes;
}

export default function RapportConformite({ data, onRetour, objectif, periodeAnalysee }: Props) {
  const alertes          = genererAlertes(data);
  const critiques        = alertes.filter(a => a.type === 'critique');
  const moderees         = alertes.filter(a => a.type === 'alerte');

  // ── Statut global ────────────────────────────────────────────────────────────
  const statut =
    critiques.length > 0 ? 'Critique' :
    alertes.length   > 0 ? 'À surveiller' : 'Conforme';
  const messageType = statut === 'Conforme' ? 'success' : statut === 'Critique' ? 'error' : 'warning';
  const message =
    statut === 'Conforme'
      ? 'Tous les indicateurs sont dans les seuils réglementaires. La caisse démontre une gestion saine et conforme aux exigences.'
      : statut === 'Critique'
      ? `${critiques.length} indicateur(s) critique(s) détecté(s). Des actions immédiates sont nécessaires pour ramener la caisse en conformité réglementaire.`
      : `${alertes.length} indicateur(s) nécessite(nt) une surveillance. La situation n'est pas critique mais des améliorations sont recommandées.`;

  const handleExportPDF   = () => { console.log('TODO: Export PDF Conformité'); };
  const handleExportExcel = () => { console.log('TODO: Export Excel Conformité'); };

  return (
    <ReportDocument
      titre="Rapport de Conformité Globale"
      periode={data.periode}
      periodeAnalysee={periodeAnalysee}
      objectif={objectif ?? 'Synthèse réglementaire mensuelle BRH'}
      statut={statut as any}
      onRetour={onRetour}
      onExportPDF={handleExportPDF}
      onExportExcel={handleExportExcel}
    >
      {/* Section 1 — Vue d'ensemble chiffrée */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total alertes',    value: alertes.length,   bg: '#F9F9F6',  text: '#111827' },
          { label: 'Critiques',        value: critiques.length, bg: critiques.length > 0 ? '#FEF2F2' : '#DDEAD5', text: critiques.length > 0 ? '#B91C1C' : '#1B5E20' },
          { label: 'Modérées',         value: moderees.length,  bg: moderees.length  > 0 ? '#FEF9EC' : '#DDEAD5', text: moderees.length  > 0 ? '#B45309' : '#1B5E20' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className="rounded-2xl border border-gray-100 p-4 text-center"
            style={{ backgroundColor: bg }}>
            <p className="text-3xl font-bold" style={{ color: text }}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Section 2 — Statut global */}
      <ReportStatusBox status={messageType} message={message} />

      {/* Section 3 — Détail des alertes */}
      {alertes.length > 0 && (
        <ReportSection title="Seuils dépassés">
          <div className="flex flex-col gap-3">
            {alertes.map((alerte, i) => {
              const isCrit = alerte.type === 'critique';
              return (
                <div key={i} className="rounded-xl border-2 p-4"
                  style={{
                    backgroundColor: isCrit ? '#FEF2F2' : '#FEF9EC',
                    borderColor:     isCrit ? '#FCA5A5' : '#FDE68A',
                  }}>
                  <div className="flex items-start gap-3">
                    {isCrit
                      ? <XCircle      className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-bold" style={{ color: isCrit ? '#B91C1C' : '#B45309' }}>
                        {alerte.titre}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: isCrit ? '#DC2626' : '#D97706' }}>
                        {alerte.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ReportSection>
      )}

      {/* Section 4 — Actions recommandées */}
      {alertes.length > 0 && (
        <ReportActionPlan
          titre="Actions recommandées"
          variant={critiques.length > 0 ? 'error' : 'warning'}
          actions={alertes.map(a => a.action)}
        />
      )}

      {/* Section 5 — Félicitations si tout est conforme */}
      {alertes.length === 0 && (
        <div className="rounded-2xl border-2 bg-[#DDEAD5]/30 border-[#DDEAD5] p-6 flex flex-col items-center text-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-[#2E7D32]" />
          <p className="text-base font-bold text-[#1B5E20]">Excellente conformité</p>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md">
            Tous les indicateurs respectent les seuils réglementaires. La caisse fait preuve d'une
            gestion exemplaire et conforme aux meilleures pratiques de la microfinance.
          </p>
        </div>
      )}
    </ReportDocument>
  );
}