export interface KpiData {
  // ============================
  // META
  // ============================
  periode: string;       // ex: "2025-01"
  lastUpdate: Date;

  // ============================
  // KPIs FINANCIERS
  // ============================
  ratioEndettement: number;             // %
  tauxRecouvrement: number;             // %
  capaciteRemboursementMoyenne: number; // HTG
  ratioCreancesDouteuses: number;       // %

  // ============================
  // KPIs LIQUIDITÉ
  // ============================
  ratioLiquidite: number;               // %
  reservesObligatoires: number;         // %
  couvertureRisques: number;            // %

  // ============================
  // KPIs MEMBRES
  // ============================
  scoreStabiliteMoyen: number;          // 0-100
  tauxActiviteMembres: number;          // %
  ratioNouveauxMembres: number;         // %

  // ============================
  // PERFORMANCE
  // ============================
  tauxRemboursement: number;            // %
  performanceScore: number;             // 0-100

  // ============================
  // RAPPORTS — LIQUIDITÉ
  // ============================
  liquiditeDisponible: number;          // cash + banque
  totalDepotsMembres: number;

  // ============================
  // RAPPORTS — SOLVABILITÉ
  // ============================
  capitalPropre: number;
  actifsPonderes: number;

  // ============================
  // RAPPORTS — PRÊTS EN SOUFFRANCE
  // ============================
  portefeuilleTotalPrets: number;
  montantEnSouffrance: number;
  repartitionSouffrance: {
    jours30: number;
    jours60: number;
    jours90Plus: number;
  };
}
