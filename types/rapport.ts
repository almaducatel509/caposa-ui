// ============================================================
// Types partagés pour le système de rapports CAPOSA
// Emplacement : caposa-ui/types/rapport.ts
// ============================================================

export type TypeRapport =
  | "liquidite"
  | "solvabilite"
  | "endettement"
  | "conformite"
  | "prets_souffrance";

export type PeriodeRapport = "jour" | "semaine" | "mois" | "trimestre" | "annee";

export type StatutRapport = "conforme" | "alerte" | "critique";

export type EtatRapport = "actif" | "archive";

export interface FiltresRapport {
  periode: PeriodeRapport;
  region?: string;
  typeMembre?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface KpiPrincipal {
  label: string;
  valeur: number;
  unite: string;
  seuil?: number;
}

export interface SnapshotRapport {
  kpiPrincipal: KpiPrincipal;
  kpisDetailles: Record<string, number | string>;
  donneesSource?: Record<string, unknown>;
  noteGlobale?: number;
  recommandations?: string[];
}

export interface Rapport {
  id: string;
  type: TypeRapport;
  nom?: string;
  periodeLibelle: string;
  filtres: FiltresRapport;
  snapshot: SnapshotRapport;
  statut: StatutRapport;
  etat: EtatRapport;
  generePar: {
    id: string;
    nom: string;
  };
  generele: string;
  reference: string;
}

export const TYPE_RAPPORT_META: Record<
  TypeRapport,
  { label: string; description: string; prefix: string }
> = {
  liquidite: {
    label: "Liquidité",
    description: "Ratio de liquidité et réserves",
    prefix: "LIQUIDITE",
  },
  solvabilite: {
    label: "Solvabilité",
    description: "Fonds propres et solidité",
    prefix: "SOLVABILITE",
  },
  endettement: {
    label: "Endettement des membres",
    description: "Ratio d'endettement moyen",
    prefix: "ENDETTEMENT",
  },
  conformite: {
    label: "Conformité",
    description: "Respect des normes BRH",
    prefix: "CONFORMITE",
  },
  prets_souffrance: {
    label: "Prêts en souffrance",
    description: "Portefeuille à risque",
    prefix: "PORTEFEUILLE",
  },
};