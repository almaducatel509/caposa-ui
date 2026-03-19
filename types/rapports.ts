// types/rapports.ts
// Types du module Rapports — cycle de vie complet d'un rapport CAPOSA.
// Un rapport est un document périodique, figé après archivage, audit-ready BRH.

export type RapportType =
  | 'liquidite'
  | 'solvabilite'
  | 'portefeuille'
  | 'endettement'
  | 'conformite';

export type RapportPeriodeType = 'mensuel' | 'trimestriel' | 'annuel';

export type RapportStatut  = 'conforme' | 'a_surveiller' | 'non_conforme' | 'critique';
export type RapportEtat    = 'actif' | 'archive';

export interface RapportPeriode {
  type:       RapportPeriodeType;
  label:      string;    // ex: "Janvier 2026", "T1 2026", "Annuel 2025"
  debut:      Date;      // premier jour de la période
  fin:        Date;      // dernier jour de la période
}

export interface RapportGenere {
  id:            string;  // Format: RPT-YYYYMM-TYPE-XXX
  type:          RapportType;
  periode:       RapportPeriode;
  genereLeDate:  Date;    // date de génération du rapport
  generePar:     string;  // nom du superviseur
  genereParRole: string;  // rôle du superviseur
  statut:        RapportStatut;
  etat:          RapportEtat;
  // Archivage
  archiveLe?:    Date;
  archivePar?:   string;
  // Snapshot des KPIs au moment de la génération
  // En prod, ce sont les vraies valeurs de la période, pas du mock
  kpiSnapshot: {
    valeurPrincipale: number; // ex: ratio de liquidité
    unite:            string; // ex: '%'
    label:            string; // ex: 'Ratio de liquidité'
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const TYPE_LABELS: Record<RapportType, string> = {
  liquidite:   'Rapport de Liquidité',
  solvabilite: 'Rapport de Solvabilité',
  portefeuille:'Qualité du Portefeuille',
  endettement: 'Endettement des Membres',
  conformite:  'Conformité Globale',
};

export const STATUT_CFG: Record<RapportStatut, {
  label: string; bg: string; text: string; border: string; dot: string;
}> = {
  conforme:      { label: 'Conforme',      bg: '#DDEAD5', text: '#1B5E20', border: '#DDEAD5', dot: '#2E7D32'  },
  a_surveiller:  { label: 'À surveiller',  bg: '#FEF9EC', text: '#B45309', border: '#FDE68A', dot: '#D4AF37'  },
  non_conforme:  { label: 'Non conforme',  bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5', dot: '#EF4444'  },
  critique:      { label: 'Critique',      bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5', dot: '#EF4444'  },
};

export const ETAT_CFG: Record<RapportEtat, {
  label: string; bg: string; text: string;
}> = {
  actif:   { label: 'Actif',   bg: '#EBF2F8', text: '#355C7D' },
  archive: { label: 'Archivé', bg: '#F3F4F6', text: '#6B7280' },
};

/** Un rapport est archivable si sa période est terminée et s'il est encore actif */
export function estArchivable(rapport: RapportGenere): boolean {
  return rapport.etat === 'actif' && rapport.periode.fin < new Date();
}

/** Raison si non archivable */
export function raisonNonArchivable(rapport: RapportGenere): string {
  if (rapport.etat === 'archive') return 'Ce rapport est déjà archivé.';
  if (rapport.periode.fin >= new Date())
    return `Ce rapport ne peut être archivé qu'à la fin de la période (${rapport.periode.fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}).`;
  return '';
}

/** Construit une RapportPeriode mensuelle */
export function periodesMensuelles(annee: number): RapportPeriode[] {
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  return mois.map((m, i) => ({
    type:  'mensuel',
    label: `${m} ${annee}`,
    debut: new Date(annee, i, 1),
    fin:   new Date(annee, i + 1, 0, 23, 59, 59),
  }));
}

/** Construit des RapportPeriode trimestrielles */
export function periodesTrimestrielles(annee: number): RapportPeriode[] {
  return [
    { type: 'trimestriel', label: `T1 ${annee}`, debut: new Date(annee, 0, 1),  fin: new Date(annee, 2,  31, 23, 59, 59) },
    { type: 'trimestriel', label: `T2 ${annee}`, debut: new Date(annee, 3, 1),  fin: new Date(annee, 5,  30, 23, 59, 59) },
    { type: 'trimestriel', label: `T3 ${annee}`, debut: new Date(annee, 6, 1),  fin: new Date(annee, 8,  30, 23, 59, 59) },
    { type: 'trimestriel', label: `T4 ${annee}`, debut: new Date(annee, 9, 1),  fin: new Date(annee, 11, 31, 23, 59, 59) },
  ];
}

/** Construit une RapportPeriode annuelle */
export function periodeAnnuelle(annee: number): RapportPeriode {
  return {
    type:  'annuel',
    label: `Annuel ${annee}`,
    debut: new Date(annee, 0, 1),
    fin:   new Date(annee, 11, 31, 23, 59, 59),
  };
}