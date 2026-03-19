// lib/mockRapports.ts
// Données mock pour le module Rapports.
//
// ─── INTÉGRATION API ──────────────────────────────────────────────────────────
// En production, remplacer par :
//   GET /api/rapports                    → liste paginée
//   GET /api/rapports/:id               → détail d'un rapport
//   POST /api/rapports                  → générer un nouveau rapport
//   PATCH /api/rapports/:id/archiver    → archiver un rapport
// ─────────────────────────────────────────────────────────────────────────────
import {
  RapportGenere, RapportType, RapportStatut,
  periodesMensuelles, periodesTrimestrielles, periodeAnnuelle,
} from '@/types/rapports';

const SUPERVISEURS = [
  { nom: 'Marie-Ange Célestin', role: 'Superviseure générale'  },
  { nom: 'Réginald Toussaint',  role: 'Directeur financier'     },
];

// KPIs snapshot par type — valeurs mock représentatives
const KPI_SNAPSHOT: Record<RapportType, { label: string; unite: string; valeur: () => number }> = {
  liquidite:   { label: 'Ratio de liquidité',    unite: '%',    valeur: () => 14 + Math.random() * 8  },
  solvabilite: { label: 'Ratio de solvabilité',  unite: '%',    valeur: () => 9  + Math.random() * 6  },
  portefeuille:{ label: 'Prêts en souffrance',   unite: '%',    valeur: () => 2  + Math.random() * 7  },
  endettement: { label: "Ratio d'endettement",   unite: '%',    valeur: () => 25 + Math.random() * 20 },
  conformite:  { label: 'Indicateurs conformes', unite: '/7',   valeur: () => Math.floor(4 + Math.random() * 3) },
};

function statutDepuisValeur(type: RapportType, valeur: number): RapportStatut {
  if (type === 'liquidite')    return valeur >= 15 ? 'conforme' : valeur >= 10 ? 'a_surveiller' : 'critique';
  if (type === 'solvabilite')  return valeur >= 10 ? 'conforme' : 'non_conforme';
  if (type === 'portefeuille') return valeur <= 3  ? 'conforme' : valeur <= 7  ? 'a_surveiller' : 'critique';
  if (type === 'endettement')  return valeur <= 30 ? 'conforme' : valeur <= 40 ? 'a_surveiller' : 'critique';
  if (type === 'conformite')   return valeur === 7 ? 'conforme' : valeur >= 5  ? 'a_surveiller' : 'critique';
  return 'conforme';
}

let compteur = 1;
function makeRapport(
  type:    RapportType,
  periode: ReturnType<typeof periodesMensuelles>[0],
  sup:     typeof SUPERVISEURS[0],
  etat:    'actif' | 'archive',
  genereLeDate: Date,
): RapportGenere {
  const kpi    = KPI_SNAPSHOT[type];
  const valeur = kpi.valeur();
  const id     = `RPT-${genereLeDate.getFullYear()}${String(genereLeDate.getMonth() + 1).padStart(2, '0')}-${type.toUpperCase()}-${String(compteur++).padStart(3, '0')}`;

  return {
    id,
    type,
    periode,
    genereLeDate,
    generePar:     sup.nom,
    genereParRole: sup.role,
    statut:        statutDepuisValeur(type, valeur),
    etat,
    archiveLe:  etat === 'archive' ? new Date(genereLeDate.getTime() + 15 * 86400000) : undefined,
    archivePar: etat === 'archive' ? sup.nom : undefined,
    kpiSnapshot: { label: kpi.label, unite: kpi.unite, valeurPrincipale: valeur },
  };
}

export function generateMockRapports(): RapportGenere[] {
  const periodes2025 = periodesMensuelles(2025);
  const periodes2026 = periodesMensuelles(2026);
  const trimestres   = periodesTrimestrielles(2025);
  const annuel2025   = periodeAnnuelle(2025);
  const types: RapportType[] = ['liquidite', 'solvabilite', 'portefeuille', 'endettement', 'conformite'];
  const rapports: RapportGenere[] = [];

  // Mensuels 2025 — archivés
  [10, 11].forEach(moisIdx => {
    types.forEach(type => {
      rapports.push(makeRapport(
        type,
        periodes2025[moisIdx],
        SUPERVISEURS[moisIdx % 2],
        'archive',
        new Date(2025, moisIdx + 1, 5, 9, 0),
      ));
    });
  });

  // Décembre 2025 — archivés
  types.forEach(type => {
    rapports.push(makeRapport(
      type, periodes2025[11], SUPERVISEURS[0], 'archive',
      new Date(2026, 0, 6, 9, 0),
    ));
  });

  // Trimestriels 2025 T3 + T4 — archivés
  [trimestres[2], trimestres[3]].forEach(t => {
    types.forEach(type => {
      rapports.push(makeRapport(type, t, SUPERVISEURS[1], 'archive', new Date(t.fin.getTime() + 10 * 86400000)));
    });
  });

  // Annuel 2025 — archivé
  types.forEach(type => {
    rapports.push(makeRapport(type, annuel2025, SUPERVISEURS[0], 'archive', new Date(2026, 0, 20, 10, 0)));
  });

  // Janvier 2026 — actifs (période terminée, archivables)
  types.forEach(type => {
    rapports.push(makeRapport(
      type, periodes2026[0], SUPERVISEURS[1], 'actif',
      new Date(2026, 1, 5, 9, 0),
    ));
  });

  // Février 2026 — actifs (période terminée, archivables)
  types.forEach(type => {
    rapports.push(makeRapport(
      type, periodes2026[1], SUPERVISEURS[0], 'actif',
      new Date(2026, 2, 5, 9, 0),
    ));
  });

  // Mars 2026 — actifs (période en cours, non archivables)
  types.forEach(type => {
    rapports.push(makeRapport(
      type, periodes2026[2], SUPERVISEURS[1], 'actif',
      new Date(2026, 2, 10, 9, 0),
    ));
  });

  return rapports.sort((a, b) => b.genereLeDate.getTime() - a.genereLeDate.getTime());
}