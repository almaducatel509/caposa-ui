// ============================================================
// rapport.service.ts
// ------------------------------------------------------------
// Deux fonctions, c'est tout :
//
//   getAnalyseRapport()  → calcule/simule l'analyse temporaire
//                          🔌 à remplacer par un vrai fetch plus tard
//
//   saveRapport()        → POST /api/reports
//                          ← seul moment où le backend intervient
// ============================================================

import { TypeRapport, PeriodeRapport, SnapshotRapport, StatutRapport } from "./rapports";


// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

// Ce qu'on envoie au backend pour créer un rapport
export interface SaveRapportPayload {
  type:            TypeRapport;
  periodicite:     PeriodeRapport;
  periode_libelle: string;         // ex: "Mars 2026"
  snapshot:        SnapshotRapport;
  statut:          StatutRapport;
  genere_par: {
    id:  string;
    nom: string;
  };
}

// Ce que le backend retourne après création
export interface SaveRapportResponse {
  id:        string;               // ex: "uuid-xxx"
  reference: string;               // ex: "RPT-2026-001"
}


// ────────────────────────────────────────────────────────────
// getAnalyseRapport
// ------------------------------------------------------------
// Retourne un SnapshotRapport calculé pour (type + période).
// Pour l'instant : données mockées + délai simulé.
// 🔌 Remplace le corps par : fetch(`/api/analysis?type=...`)
// ────────────────────────────────────────────────────────────
export async function getAnalyseRapport(
  type:        TypeRapport,
  periodicite: PeriodeRapport,
  periode:     string,
): Promise<SnapshotRapport> {

  // Simule une latence réseau (retire ça quand tu branches le vrai API)
  await new Promise(r => setTimeout(r, 800));

  // Valeurs mockées selon le type de rapport
  const kpiParType: Record<TypeRapport, { label: string; valeur: number; unite: string; seuil: number }> = {
    liquidite:        { label: "Ratio de liquidité",       valeur: 1.99,  unite: "",  seuil: 1.5 },
    solvabilite:      { label: "Ratio de solvabilité",     valeur: 11.83, unite: "%", seuil: 8   },
    endettement:      { label: "Ratio d'endettement moyen",valeur: 31.5,  unite: "%", seuil: 35  },
    prets_souffrance: { label: "Prêts en souffrance",      valeur: 4.2,   unite: "%", seuil: 5   },
    conformite:       { label: "Indice de conformité",     valeur: 88.0,  unite: "%", seuil: 80  },
  };

  return {
    kpiPrincipal: kpiParType[type],

    kpisDetailles: {
      ratioEndettement:     31.5,
      tauxRecouvrement:     93.0,
      capaciteMoyenne:      19595,
      creancesDouteuses:    3.3,
      ratioLiquidite:       1.99,
      reservesObligatoires: 11.83,
      couvertureRisques:    91.56,
    },

    recommandations: [
      "Maintenir le suivi des remboursements mensuels.",
      "Renforcer la communication avec les membres inactifs.",
    ],
  };
}


// ────────────────────────────────────────────────────────────
// saveRapport
// ------------------------------------------------------------
// Envoie le snapshot au backend → crée le rapport en DB.
// Appelé UNE seule fois : quand l'utilisateur clique 💾.
// Lance une erreur si le serveur répond autre chose que 2xx.
// ────────────────────────────────────────────────────────────
export async function saveRapport(
  payload: SaveRapportPayload,
): Promise<SaveRapportResponse> {

  const res = await fetch("/api/reports", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  // Si le backend répond avec une erreur, on la remonte
  if (!res.ok) {
    throw new Error(`Erreur ${res.status} lors de l'enregistrement du rapport`);
  }

  return res.json() as Promise<SaveRapportResponse>;
}