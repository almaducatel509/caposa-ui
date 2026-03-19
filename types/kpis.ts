// types/kpis.ts
// Type central partagé par les modules KPI, Performance et Rapports.
// Toute modification ici impacte tous les composants — procéder avec soin.

export interface KpiData {
  // ── Financiers ──────────────────────────────────────────────────────────────
  ratioEndettement:              number; // % mensualités / revenus membres
  tauxRecouvrement:              number; // % prêts remboursés à temps
  capaciteRemboursementMoyenne:  number; // HTG disponible mensuel moyen
  ratioCreancesDouteuses:        number; // % prêts à risque / total portefeuille

  // ── Liquidité ───────────────────────────────────────────────────────────────
  ratioLiquidite:       number; // ratio actifs liquides / passifs court terme
  reservesObligatoires: number; // % du capital réglementaire constitué
  couvertureRisques:    number; // % provisions / risques identifiés

  // ── Membres ─────────────────────────────────────────────────────────────────
  scoreStabiliteMoyen:  number; // score 0-100 fiabilité financière moyenne
  tauxActiviteMembres:  number; // % membres actifs / total membres
  ratioNouveauxMembres: number; // % nouveaux membres / total (croissance)

  // ── Rapports réglementaires — Liquidité ─────────────────────────────────────
  liquiditeDisponible:  number; // HTG cash + comptes bancaires
  totalDepotsMembres:   number; // HTG total dépôts à vue et à terme

  // ── Rapports réglementaires — Solvabilité ───────────────────────────────────
  capitalPropre:   number; // HTG fonds propres (capital + réserves + résultats)
  actifsPonderes:  number; // HTG total portefeuille prêts + investissements

  // ── Rapports réglementaires — Prêts en souffrance ───────────────────────────
  portefeuilleTotalPrets: number; // HTG montant total des prêts en cours
  montantEnSouffrance:    number; // HTG prêts avec retard de paiement
  repartitionSouffrance: {
    jours30:    number; // HTG retard 1-30 jours
    jours60:    number; // HTG retard 31-60 jours
    jours90Plus:number; // HTG retard 90+ jours (créances douteuses)
  };

  // ── Performance globale ──────────────────────────────────────────────────────
  performanceScore: number; // score composite 0-100

  // ── Meta ────────────────────────────────────────────────────────────────────
  periode:    string; // ex: "Janvier 2026"
  lastUpdate: Date;
}

// ─── Helpers de formatage ─────────────────────────────────────────────────────
// Utilisés dans tous les composants rapports et KPI — ne pas dupliquer.

export function formatHTG(value: number): string {
  return new Intl.NumberFormat('fr-HT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' HTG';
}

export function formatPct(value: number, decimals = 1): string {
  return value.toFixed(decimals) + ' %';
}

// Alias pour compatibilité avec les anciens composants rapports
// TODO: remplacer formatCurrency → formatHTG et formatPercentage → formatPct dans tous les fichiers
export const formatCurrency   = formatHTG;
export const formatPercentage = formatPct;



// // types/rapports.ts
// // Types étendus pour la génération de rapports réglementaires

// export interface KpiData {
//   // KPIs Financiers
//   ratioEndettement: number;
//   tauxRecouvrement: number;
//   capaciteRemboursementMoyenne: number;
//   ratioCreancesDouteuses: number;

//   // KPIs Liquidité
//   ratioLiquidite: number;
//   reservesObligatoires: number;
//   couvertureRisques: number;

//   // KPIs Membres
//   scoreStabiliteMoyen: number;
//   tauxActiviteMembres: number;
//   ratioNouveauxMembres: number;

//   // Rapports réglementaires — Liquidité
//   liquiditeDisponible: number;
//   totalDepotsMembres: number;

//   // Solvabilité
//   capitalPropre: number;
//   actifsPonderes: number; // <-- version correcte

//   // Prêts en souffrance
//   portefeuilleTotalPrets: number;
//   montantEnSouffrance: number;
//   repartitionSouffrance: {
//     jours30: number;
//     jours60: number;
//     jours90Plus: number;
//   };

//   performanceScore: number;

//   // Meta
//   periode: string;
//   lastUpdate: Date;
// }

// export interface RapportLiquiditeData {
//   date: Date;
//   periode: string;
//   liquiditeDisponible: number;
//   totalDepotsMembres: number;
//   ratioLiquidite: number;
//   evolutionTrimestre: number; // %
//   seuilMinimal: number; // % (constante: 15)
//   statut: 'Conforme' | 'À surveiller' | 'Critique';
// }

// export interface RapportSolvabiliteData {
//   date: Date;
//   periode: string;
//   capitalPropre: number;
//   actifsponderes: number;
//   ratioSolvabilite: number;
//   seuilReglementaire: number; // % (constante: 10)
//   statut: 'Conforme' | 'Non conforme';
// }

// export interface RapportConformiteData {
//   date: Date;
//   periode: string;
//   totalAlertes: number;
//   alertesCritiques: number;
//   seuilsDepasses: string[];
//   actionsRecommandees: string[];
// }

// export interface RapportPretsSouffranceData {
//   date: Date;
//   periode: string;
//   portefeuilleTotalPrets: number;
//   montantEnSouffrance: number;
//   pourcentagePortefeuille: number;
//   repartition: {
//     jours30: number;
//     jours60: number;
//     jours90Plus: number;
//   };
//   evolutionMensuelle: number; // %
//   statut: 'Stable' | 'À risque' | 'Critique';
// }

// // Helper pour formater la monnaie
// export const formatCurrency = (value: number): string => {
//   return new Intl.NumberFormat('fr-HT', {
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0
//   }).format(value) + ' G';
// };

// // Helper pour formater les pourcentages
// export const formatPercentage = (value: number, decimals: number = 1): string => {
//   return value.toFixed(decimals) + ' %';
// };