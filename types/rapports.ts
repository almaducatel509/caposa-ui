// types/rapport.ts  (fichier unique — remplace rapports.ts)

// ─── Types de base ────────────────────────────────────────────────────────────

export type TypeRapport =
  | "liquidite"
  | "solvabilite"
  | "endettement"
  | "conformite"
  | "prets_souffrance";

export type PeriodeRapport = "semaine" | "mois" | "annee";

export type StatutRapport = "conforme" | "alerte" | "critique";

export type EtatRapport = "actif" | "archive";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface KpiPrincipal {
  label:  string;
  valeur: number;
  unite:  string;
  seuil?: number;
}

export interface SnapshotRapport {
  kpiPrincipal:   KpiPrincipal;
  kpisDetailles:  Record<string, number | string>;
  recommandations?: string[];
}

export interface FiltresRapport {
  periode:      PeriodeRapport;
  dateDebut?:   string;
  dateFin?:     string;
}

export interface Rapport {
  id:             string;
  type:           TypeRapport;
  periode_libelle:string;
  filtres:        FiltresRapport;
  snapshot:       SnapshotRapport;
  statut:         StatutRapport;
  etat:           EtatRapport;
  genere_par: {
    id:  string;
    nom: string;
  };
  genere_le:  string;
  reference:  string;
}

// ─── Metadata affichage ───────────────────────────────────────────────────────

export const TYPE_RAPPORT_META: Record<
  TypeRapport,
  { label: string; description: string; prefix: string }
> = {
  liquidite: {
    label:       "Liquidité",
    description: "Ratio de liquidité et réserves",
    prefix:      "LIQUIDITE",
  },
  solvabilite: {
    label:       "Solvabilité",
    description: "Fonds propres et solidité",
    prefix:      "SOLVABILITE",
  },
  endettement: {
    label:       "Endettement des membres",
    description: "Ratio d'endettement moyen",
    prefix:      "ENDETTEMENT",
  },
  conformite: {
    label:       "Conformité",
    description: "Respect des normes BRH",
    prefix:      "CONFORMITE",
  },
  prets_souffrance: {
    label:       "Prêts en souffrance",
    description: "Portefeuille à risque",
    prefix:      "PORTEFEUILLE",
  },
};