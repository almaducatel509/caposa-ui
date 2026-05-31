"use client";

import { useState } from "react";
import { X, TrendingUp } from "lucide-react";
import { PeriodeRapport, TypeRapport } from "@/types/rapports";

// ============================================================
// GenererModal.tsx
// ------------------------------------------------------------
// Champs dynamiques selon la périodicité choisie :
//   mois   → select Mois + select Année  → "Mai 2026"
//   annee  → select Année seul           → "2026"
//   semaine→ input texte libre           → "Semaine du 26 mai"
// ============================================================

interface Props {
  onClose:   () => void;
  onGenerer: (params: {
    type:        string;
    periodicite: string;
    periode:     string;
  }) => void;
}

// ─── Options fixes ────────────────────────────────────────────────────────────

const TYPES: { value: TypeRapport; label: string }[] = [
  { value: "liquidite",        label: "Liquidité"           },
  { value: "solvabilite",      label: "Solvabilité"         },
  { value: "endettement",      label: "Endettement"         },
  { value: "prets_souffrance", label: "Prêts en souffrance" },
  { value: "conformite",       label: "Conformité"          },
];

const PERIODICITES: { value: PeriodeRapport; label: string }[] = [
  { value: "semaine", label: "Hebdomadaire" },
  { value: "mois",    label: "Mensuel"      },
  { value: "annee",   label: "Annuel"       },
];

const MOIS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

// Années affichées dans le select
// anneesAvecDonnees : reçu du backend plus tard (GET /api/reports/years)
// Pour l'instant on liste 2020 → année courante, toutes marquées "sans données"
// sauf l'année courante qui est supposée active.
const ANNEE_COURANTE = new Date().getFullYear();

function buildAnnees(anneesAvecDonnees: number[] = []) {
  const annees: { valeur: number; hasDonnees: boolean }[] = [];
  for (let a = 2016; a <= ANNEE_COURANTE; a++) {
    annees.push({ valeur: a, hasDonnees: anneesAvecDonnees.includes(a) });
  }
  return annees;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function GenererModal({ onClose, onGenerer }: Props) {
  const [type,        setType]        = useState<TypeRapport>("solvabilite");
  const [periodicite, setPeriodicite] = useState<PeriodeRapport>("mois");

  // Champs pour "mois"
  const [moisChoisi,  setMoisChoisi]  = useState(MOIS[new Date().getMonth()]);
  const [anneeChoisie,setAnneeChoisie]= useState(ANNEE_COURANTE);

  // 🔌 À remplacer par un fetch GET /api/reports/years quand le backend est prêt
  // Ex: const [anneesAvecDonnees, setAnneesAvecDonnees] = useState<number[]>([]);
  // useEffect(() => { fetch("/api/reports/years").then(...) }, []);
  const anneesAvecDonnees: number[] = [ANNEE_COURANTE]; // pour l'instant seule l'année courante est "active"
  const ANNEES = buildAnnees(anneesAvecDonnees);

  // Champ pour "semaine" (texte libre)
  const [semaineTexte,setSemaineTexte]= useState("");

  // ── Calcul du libellé final ──────────────────────────────
  function getPeriodeLibelle(): string {
    if (periodicite === "mois")   return `${moisChoisi} ${anneeChoisie}`;
    if (periodicite === "annee")  return `${anneeChoisie}`;
    return semaineTexte.trim();
  }

  // ── Validation : le libellé ne doit pas être vide ────────
  const canSubmit = getPeriodeLibelle().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onGenerer({ type, periodicite, periode: getPeriodeLibelle() });
  }

  // ── Style commun des selects ─────────────────────────────
  const selectClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">

        {/* Titre */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              Générer une analyse
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">

          {/* Type de rapport */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Type de rapport
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as TypeRapport)}
              className={selectClass}
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Périodicité */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Périodicité
            </label>
            <select
              value={periodicite}
              onChange={e => setPeriodicite(e.target.value as PeriodeRapport)}
              className={selectClass}
            >
              {PERIODICITES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Champs dynamiques selon périodicité */}

          {/* ── Mensuel : Mois + Année ── */}
          {periodicite === "mois" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Mois
                </label>
                <select
                  value={moisChoisi}
                  onChange={e => setMoisChoisi(e.target.value)}
                  className={selectClass}
                >
                  {MOIS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="w-40">
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Année
                </label>
                <select
                  value={anneeChoisie}
                  onChange={e => setAnneeChoisie(Number(e.target.value))}
                  className={selectClass}
                >
                  {ANNEES.map(({ valeur, hasDonnees }) => (
                    <option key={valeur} value={valeur}>
                      {valeur}{!hasDonnees ? " (aucune donnée)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Annuel : Année seule ── */}
          {periodicite === "annee" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Année
              </label>
              <select
                value={anneeChoisie}
                onChange={e => setAnneeChoisie(Number(e.target.value))}
                className={selectClass}
              >
                {ANNEES.map(({ valeur, hasDonnees }) => (
                  <option key={valeur} value={valeur}>
                    {valeur}{!hasDonnees ? " (aucune donnée)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Hebdomadaire : texte libre ── */}
          {periodicite === "semaine" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Semaine
              </label>
              <input
                type="text"
                value={semaineTexte}
                onChange={e => setSemaineTexte(e.target.value)}
                placeholder="ex : Semaine du 26 mai 2026"
                className={selectClass}
              />
            </div>
          )}

          {/* Aperçu de la période générée */}
          {canSubmit && (
            <p className="text-xs text-gray-500">
              Période :{" "}
              <span className="font-semibold text-gray-800">
                {getPeriodeLibelle()}
              </span>
            </p>
          )}

        </div>

        {/* Boutons */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            Générer
          </button>
        </div>

      </div>
    </div>
  );
}