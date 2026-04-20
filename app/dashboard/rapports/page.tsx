
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Filter,
  Eye,
  Archive,
  Search,
} from "lucide-react";
import type {
  Rapport,
  TypeRapport,
  PeriodeRapport,
  StatutRapport,
  EtatRapport,
} from "@/types/rapport";
import { TYPE_RAPPORT_META } from "@/types/rapport";
import GenererAnalyseModal from "@/app/components/rapport/GenererAnalyseModal";

// ============================================================
// Page LISTE des rapports réglementaires
// ------------------------------------------------------------
// Route : /dashboard/rapports
// - Table des rapports générés (filtrable)
// - Bouton "+ Générer un rapport" → modal config → modal plein écran
// ============================================================

// Utilisateur courant (à brancher sur ton auth)
const UTILISATEUR_ACTUEL = { id: "u_001", nom: "Jean Dupont" };

export default function RapportsListePage() {
  const router = useRouter();

  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState<"tous" | TypeRapport>("tous");
  const [filtrePeriode, setFiltrePeriode] = useState<"toutes" | string>(
    "toutes"
  );
  const [filtreEtat, setFiltreEtat] = useState<"tous" | EtatRapport>("tous");

  // Modal 1 : configuration (type + périodicité + période)
  const [configOuvert, setConfigOuvert] = useState(false);

  // Modal 2 : analyse plein écran
  const [analyseParams, setAnalyseParams] = useState<{
    type: TypeRapport;
    periodicite: PeriodeRapport;
    periodeLibelle: string;
  } | null>(null);

  // --------------------------------------------------------
  // Charger les rapports (démo : localStorage)
  // --------------------------------------------------------
  const rechargerRapports = () => {
    if (typeof window === "undefined") return;
    const data: Rapport[] = JSON.parse(
      localStorage.getItem("caposa:rapports") || "[]"
    );
    setRapports(data);
  };

  useEffect(() => {
    rechargerRapports();
  }, []);

  // --------------------------------------------------------
  // Filtrer
  // --------------------------------------------------------
  const rapportsFiltres = rapports.filter((r) => {
    if (filtreType !== "tous" && r.type !== filtreType) return false;
    if (filtreEtat !== "tous" && r.etat !== filtreEtat) return false;
    if (filtrePeriode !== "toutes" && r.filtres.periode !== filtrePeriode)
      return false;
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      const match =
        r.reference.toLowerCase().includes(q) ||
        r.periodeLibelle.toLowerCase().includes(q) ||
        (r.nom ?? "").toLowerCase().includes(q) ||
        TYPE_RAPPORT_META[r.type].label.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // --------------------------------------------------------
  // Stats
  // --------------------------------------------------------
  const total = rapports.length;
  const actifs = rapports.filter((r) => r.etat === "actif").length;
  const archives = rapports.filter((r) => r.etat === "archive").length;
  const nonConformes = rapports.filter(
    (r) => r.statut === "critique" || r.statut === "alerte"
  ).length;

  // --------------------------------------------------------
  // Actions
  // --------------------------------------------------------
  const archiver = (id: string) => {
    const maj = rapports.map((r) =>
      r.id === id
        ? { ...r, etat: (r.etat === "actif" ? "archive" : "actif") as EtatRapport }
        : r
    );
    setRapports(maj);
    localStorage.setItem("caposa:rapports", JSON.stringify(maj));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* ============ HEADER ============ */}
        <header className="flex items-start justify-between rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <FileText className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Rapports Réglementaires
              </h1>
              <p className="text-sm text-gray-500">
                Documents périodiques — conformité BRH
              </p>
            </div>
          </div>

          <button
            onClick={() => setConfigOuvert(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800"
          >
            <Plus className="h-4 w-4" />
            Générer un rapport
          </button>
        </header>

        {/* ============ STATS ============ */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total rapports" value={total} tone="blue" />
          <StatCard label="Actifs" value={actifs} tone="green" />
          <StatCard label="Archivés" value={archives} tone="gray" />
          <StatCard label="Non conformes" value={nonConformes} tone="red" />
        </div>

        {/* ============ FILTRES ============ */}
        <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" />
              Filtres
            </div>

            <select
              value={filtreType}
              onChange={(e) =>
                setFiltreType(e.target.value as "tous" | TypeRapport)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <option value="tous">Tous les types</option>
              {Object.entries(TYPE_RAPPORT_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>

            <select
              value={filtrePeriode}
              onChange={(e) => setFiltrePeriode(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <option value="toutes">Toutes les périodes</option>
              <option value="mois">Mensuel</option>
              <option value="trimestre">Trimestriel</option>
              <option value="annee">Annuel</option>
            </select>

            <select
              value={filtreEtat}
              onChange={(e) =>
                setFiltreEtat(e.target.value as "tous" | EtatRapport)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <option value="tous">Tous les états</option>
              <option value="actif">Actifs</option>
              <option value="archive">Archivés</option>
            </select>

            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher…"
                className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>
        </div>

        {/* ============ TABLE ============ */}
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
          {rapportsFiltres.length === 0 ? (
            <EmptyState
              hasRapports={total > 0}
              onCreate={() => setConfigOuvert(true)}
            />
          ) : (
            <table className="w-full">
              <thead className="bg-green-50/50">
                <tr>
                  <Th>Type de rapport</Th>
                  <Th>Période</Th>
                  <Th>Généré le</Th>
                  <Th>KPI Principal</Th>
                  <Th>Statut</Th>
                  <Th>État</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rapportsFiltres.map((r) => (
                  <RapportRow
                    key={r.id}
                    rapport={r}
                    onVoir={() => router.push(`/dashboard/rapports/${r.id}`)}
                    onArchiver={() => archiver(r.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ============ MODAL 1 : Config ============ */}
      <ConfigModal
        open={configOuvert}
        onClose={() => setConfigOuvert(false)}
        onValider={(params) => {
          setAnalyseParams(params);
          setConfigOuvert(false);
        }}
      />

      {/* ============ MODAL 2 : Analyse plein écran ============ */}
      {analyseParams && (
        <GenererAnalyseModal
          open={true}
          onClose={() => setAnalyseParams(null)}
          onEnregistre={() => {
            rechargerRapports();
            setAnalyseParams(null);
          }}
          type={analyseParams.type}
          periodicite={analyseParams.periodicite}
          periodeLibelle={analyseParams.periodeLibelle}
          utilisateur={UTILISATEUR_ACTUEL}
        />
      )}
    </div>
  );
}

// ============================================================
// Sous-composants
// ============================================================

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "gray" | "red";
}) {
  const styles: Record<typeof tone, string> = {
    blue: "bg-blue-50 text-blue-900 ring-blue-100",
    green: "bg-green-50 text-green-900 ring-green-100",
    gray: "bg-gray-50 text-gray-900 ring-gray-200",
    red: "bg-red-50 text-red-900 ring-red-100",
  };
  return (
    <div className={`rounded-2xl p-5 ring-1 ${styles[tone]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
      {children}
    </th>
  );
}

function RapportRow({
  rapport,
  onVoir,
  onArchiver,
}: {
  rapport: Rapport;
  onVoir: () => void;
  onArchiver: () => void;
}) {
  const meta = TYPE_RAPPORT_META[rapport.type];
  const dateGenere = new Date(rapport.generele).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-gray-900">
          {rapport.nom ?? meta.label}
        </p>
        <p className="text-xs text-gray-500">{rapport.reference}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-gray-900">{rapport.periodeLibelle}</p>
        <p className="text-xs capitalize text-gray-500">
          {rapport.filtres.periode}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-gray-900">{dateGenere}</p>
        <p className="text-xs text-gray-500">{rapport.generePar.nom}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {rapport.snapshot.kpiPrincipal.valeur.toLocaleString("fr-FR")}
          {rapport.snapshot.kpiPrincipal.unite}
        </p>
        <p className="text-xs text-gray-500">
          {rapport.snapshot.kpiPrincipal.label}
        </p>
      </td>
      <td className="px-4 py-4">
        <StatutBadge statut={rapport.statut} />
      </td>
      <td className="px-4 py-4">
        <EtatBadge etat={rapport.etat} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onVoir}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir
          </button>
          <button
            onClick={onArchiver}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <Archive className="h-3.5 w-3.5" />
            {rapport.etat === "actif" ? "Archiver" : "Restaurer"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatutBadge({ statut }: { statut: StatutRapport }) {
  const styles: Record<StatutRapport, string> = {
    conforme: "bg-green-100 text-green-800 ring-green-200",
    alerte: "bg-amber-100 text-amber-800 ring-amber-200",
    critique: "bg-red-100 text-red-800 ring-red-200",
  };
  const libelles: Record<StatutRapport, string> = {
    conforme: "Conforme",
    alerte: "À surveiller",
    critique: "Critique",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${styles[statut]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {libelles[statut]}
    </span>
  );
}

function EtatBadge({ etat }: { etat: EtatRapport }) {
  const styles: Record<EtatRapport, string> = {
    actif: "bg-blue-50 text-blue-700 ring-blue-100",
    archive: "bg-gray-100 text-gray-600 ring-gray-200",
  };
  const libelles: Record<EtatRapport, string> = {
    actif: "Actif",
    archive: "Archivé",
  };
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ${styles[etat]}`}
    >
      {libelles[etat]}
    </span>
  );
}

function EmptyState({
  hasRapports,
  onCreate,
}: {
  hasRapports: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <FileText className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">
        {hasRapports ? "Aucun rapport ne correspond aux filtres" : "Aucun rapport pour le moment"}
      </h3>
      <p className="max-w-sm text-xs text-gray-500">
        {hasRapports
          ? "Essayez d'ajuster vos filtres ou votre recherche."
          : "Commencez par générer votre premier rapport réglementaire."}
      </p>
      {!hasRapports && (
        <button
          onClick={onCreate}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <Plus className="h-4 w-4" />
          Générer un rapport
        </button>
      )}
    </div>
  );
}

// ============================================================
// Modal 1 : Configuration (choix type + périodicité + période)
// ============================================================

function ConfigModal({
  open,
  onClose,
  onValider,
}: {
  open: boolean;
  onClose: () => void;
  onValider: (params: {
    type: TypeRapport;
    periodicite: PeriodeRapport;
    periodeLibelle: string;
  }) => void;
}) {
  const [type, setType] = useState<TypeRapport>("liquidite");
  const [periodicite, setPeriodicite] = useState<PeriodeRapport>("mois");
  const [periodeChoisie, setPeriodeChoisie] = useState("");

  useEffect(() => {
    if (open) {
      setType("liquidite");
      setPeriodicite("mois");
      setPeriodeChoisie("");
    }
  }, [open]);

  if (!open) return null;

  const periodesDisponibles = genererPeriodes(periodicite);
  const peutValider = periodeChoisie.length > 0;

  const handleValider = () => {
    if (!peutValider) return;
    onValider({
      type,
      periodicite,
      periodeLibelle: periodeChoisie,
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <Plus className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Générer un rapport
              </h2>
              <p className="text-xs text-gray-500">
                Superviseur uniquement
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
              Type de rapport
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeRapport)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              {Object.entries(TYPE_RAPPORT_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {/* Périodicité */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
              Périodicité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["mois", "trimestre", "annee"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPeriodicite(p);
                    setPeriodeChoisie("");
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    periodicite === p
                      ? "bg-green-700 text-white"
                      : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p === "mois"
                    ? "Mensuel"
                    : p === "trimestre"
                    ? "Trimestriel"
                    : "Annuel"}
                </button>
              ))}
            </div>
          </div>

          {/* Période */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
              Période <span className="text-red-500">*</span>
            </label>
            <select
              value={periodeChoisie}
              onChange={(e) => setPeriodeChoisie(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <option value="">Sélectionner une période…</option>
              {periodesDisponibles.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900 ring-1 ring-amber-100">
            Le rapport sera généré avec les données actuelles de la caisse pour
            la période sélectionnée.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleValider}
            disabled={!peutValider}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Générer
          </button>
        </div>
      </div>
    </div>
  );
}

// Génère les options de période disponibles selon la périodicité
function genererPeriodes(periodicite: PeriodeRapport): string[] {
  const maintenant = new Date();
  const annee = maintenant.getFullYear();
  const moisActuel = maintenant.getMonth();

  const mois = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  if (periodicite === "mois") {
    // 12 derniers mois
    const liste: string[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(annee, moisActuel - i, 1);
      liste.push(`${mois[d.getMonth()]} ${d.getFullYear()}`);
    }
    return liste;
  }

  if (periodicite === "trimestre") {
    const trimestreActuel = Math.floor(moisActuel / 3) + 1;
    const liste: string[] = [];
    for (let i = 0; i < 8; i++) {
      let t = trimestreActuel - i;
      let a = annee;
      while (t <= 0) {
        t += 4;
        a -= 1;
      }
      liste.push(`T${t} ${a}`);
    }
    return liste;
  }

  // Annuel
  const liste: string[] = [];
  for (let i = 0; i < 5; i++) {
    liste.push(`${annee - i}`);
  }
  return liste;
}