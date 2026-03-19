// lib/mockKpiData.ts
// Données mock centralisées pour tous les modules KPI, Performance et Rapports.
//
// ─── INTÉGRATION API ──────────────────────────────────────────────────────────
// En production, remplacer generateKpiData() par :
//   const data = await fetch('/api/kpis?periode=2026-01').then(r => r.json());
// Toutes les pages importent depuis ce fichier — un seul endroit à modifier.
// ─────────────────────────────────────────────────────────────────────────────
import { KpiData } from '@/types/kpis';

export function generateKpiData(periode = 'Janvier 2026'): KpiData {
  return {
    // Financiers
    ratioEndettement:             28  + Math.random() * 15,
    tauxRecouvrement:             92  + Math.random() * 7,
    capaciteRemboursementMoyenne: 12000 + Math.random() * 8000,
    ratioCreancesDouteuses:       2   + Math.random() * 6,

    // Liquidité
    ratioLiquidite:       1.2 + Math.random() * 0.8,
    reservesObligatoires: 8   + Math.random() * 4,
    couvertureRisques:    85  + Math.random() * 12,

    // Membres
    scoreStabiliteMoyen:  65 + Math.random() * 25,
    tauxActiviteMembres:  75 + Math.random() * 20,
    ratioNouveauxMembres: 5  + Math.random() * 10,

    // Réglementaires — Liquidité
    liquiditeDisponible:  800000  + Math.random() * 700000,
    totalDepotsMembres:   4000000 + Math.random() * 3000000,

    // Réglementaires — Solvabilité
    capitalPropre:  600000  + Math.random() * 400000,
    actifsPonderes: 5000000 + Math.random() * 3000000,

    // Réglementaires — Prêts en souffrance
    portefeuilleTotalPrets: 4500000 + Math.random() * 2500000,
    montantEnSouffrance:     150000 + Math.random() * 350000,
    repartitionSouffrance: {
      jours30:     100000 + Math.random() * 150000,
      jours60:     50000  + Math.random() * 100000,
      jours90Plus: 30000  + Math.random() * 70000,
    },

    // Performance
    performanceScore: 50 + Math.random() * 40,

    // Meta
    periode,
    lastUpdate: new Date(),
  };
}