// types/rapports.ts
// Types étendus pour la génération de rapports réglementaires

// export interface KpiData {
//   // KPIs Financiers (existants)
//   ratioEndettement: number; // %
//   tauxRecouvrement: number; // %
//   capaciteRemboursementMoyenne: number; // HTG
//   ratioCreancesDouteuses: number; // %
  
//   // KPIs Liquidité (existants)
//   ratioLiquidite: number; // ratio
//   reservesObligatoires: number; // %
//   couvertureRisques: number; // %
  
//   // KPIs Membres (existants)
//   scoreStabiliteMoyen: number; // 0-100
//   tauxActiviteMembres: number; // %
//   ratioNouveauxMembres: number; // %
  
//   // NOUVEAUX CHAMPS pour rapports réglementaires
//   // Liquidité absolue
//   liquiditeDisponible: number; // HTG (cash + banque)
//   totalDepotsMembres: number; // HTG
  
//   // Solvabilité
//   capitalPropre: number; // HTG
//   actifsponderes: number; // HTG (ou total portefeuille simplifié)
  
//   // Prêts en souffrance
//   portefeuilleTotalPrets: number; // HTG
//   montantEnSouffrance: number; // HTG
//   repartitionSouffrance: {
//     jours30: number; // HTG
//     jours60: number; // HTG
//     jours90Plus: number; // HTG
//   };
//   performanceScore:number;
//   actifsPonderes:number;
//   // Meta
//   periode: string;
//   lastUpdate: Date;
// }
export interface KpiData {
  // KPIs Financiers
  ratioEndettement: number;
  tauxRecouvrement: number;
  capaciteRemboursementMoyenne: number;
  ratioCreancesDouteuses: number;

  // KPIs Liquidité
  ratioLiquidite: number;
  reservesObligatoires: number;
  couvertureRisques: number;

  // KPIs Membres
  scoreStabiliteMoyen: number;
  tauxActiviteMembres: number;
  ratioNouveauxMembres: number;

  // Rapports réglementaires — Liquidité
  liquiditeDisponible: number;
  totalDepotsMembres: number;

  // Solvabilité
  capitalPropre: number;
  actifsPonderes: number; // <-- version correcte

  // Prêts en souffrance
  portefeuilleTotalPrets: number;
  montantEnSouffrance: number;
  repartitionSouffrance: {
    jours30: number;
    jours60: number;
    jours90Plus: number;
  };

  performanceScore: number;

  // Meta
  periode: string;
  lastUpdate: Date;
}

export interface RapportLiquiditeData {
  date: Date;
  periode: string;
  liquiditeDisponible: number;
  totalDepotsMembres: number;
  ratioLiquidite: number;
  evolutionTrimestre: number; // %
  seuilMinimal: number; // % (constante: 15)
  statut: 'Conforme' | 'À surveiller' | 'Critique';
}

export interface RapportSolvabiliteData {
  date: Date;
  periode: string;
  capitalPropre: number;
  actifsponderes: number;
  ratioSolvabilite: number;
  seuilReglementaire: number; // % (constante: 10)
  statut: 'Conforme' | 'Non conforme';
}

export interface RapportConformiteData {
  date: Date;
  periode: string;
  totalAlertes: number;
  alertesCritiques: number;
  seuilsDepasses: string[];
  actionsRecommandees: string[];
}

export interface RapportPretsSouffranceData {
  date: Date;
  periode: string;
  portefeuilleTotalPrets: number;
  montantEnSouffrance: number;
  pourcentagePortefeuille: number;
  repartition: {
    jours30: number;
    jours60: number;
    jours90Plus: number;
  };
  evolutionMensuelle: number; // %
  statut: 'Stable' | 'À risque' | 'Critique';
}

// Helper pour formater la monnaie
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-HT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' G';
};

// Helper pour formater les pourcentages
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals) + ' %';
};