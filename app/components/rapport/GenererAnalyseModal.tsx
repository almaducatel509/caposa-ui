"use client";

import { useEffect, useState } from "react";
import {
  X,
  Printer,
  Save,
  Loader2,
  Check,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type {
  TypeRapport,
  PeriodeRapport,
  FiltresRapport,
  SnapshotRapport,
  StatutRapport,
} from "@/types/rapport";
import { TYPE_RAPPORT_META } from "@/types/rapport";
import { useImprimerRapport } from "@/hooks/useImprimerRapport";
import { useEnregistrerRapport } from "@/hooks/useEnregistrerRapport";

// ============================================================
// GenererAnalyseModal
// ------------------------------------------------------------
// Modal plein écran par-dessus la liste des rapports.
// Affiche une analyse générée à la volée pour (type + période).
// Actions : 💾 Enregistrer comme rapport  |  🖨️ Imprimer
// Si l'utilisateur ferme sans cliquer → l'analyse est perdue.
// ============================================================

interface Props {
  open: boolean;
  onClose: () => void;
  onEnregistre?: (rapportId: string) => void;

  /** Paramètres de la génération (vient du modal précédent "Générer") */
  type: TypeRapport;
  periodicite: PeriodeRapport;
  periodeLibelle: string; // ex: "Mars 2026"

  /** Utilisateur courant */
  utilisateur: { id: string; nom: string };
}

// ============================================================
// Simulation de récupération des données d'analyse
// ------------------------------------------------------------
// 🔌 À REMPLACER par un vrai fetch vers /api/analysis?type=...&periode=...
// ============================================================
async function fetchAnalyse(
  type: TypeRapport,
  periodicite: PeriodeRapport,
  periode: string
): Promise<SnapshotRapport> {
  // Simule latence réseau
  await new Promise((r) => setTimeout(r, 600));

  // Données mockées — remplace par ton vrai calcul
  return {
    kpiPrincipal: {
      label:
        type === "liquidite"
          ? "Ratio de liquidité"
          : type === "solvabilite"
          ? "Ratio de solvabilité"
          : type === "endettement"
          ? "Ratio d'endettement moyen"
          : type === "prets_souffrance"
          ? "Prêts en souffrance"
          : "Indice de conformité",
      valeur: type === "liquidite" ? 1.99 : type === "solvabilite" ? 11.83 : 31.5,
      unite: type === "liquidite" ? "" : "%",
      seuil: type === "liquidite" ? 1.5 : type === "solvabilite" ? 8 : 35,
    },
    kpisDetailles: {
      ratioEndettement: 31.5,
      tauxRecouvrement: 93.0,
      capaciteMoyenne: 19595,
      creancesDouteuses: 3.3,
      ratioLiquidite: 1.99,
      reservesObligatoires: 11.83,
      couvertureRisques: 91.56,
    },
    noteGlobale: 92,
    recommandations: [
      "Maintenir le suivi des remboursements mensuels.",
      "Renforcer la communication avec les membres inactifs.",
    ],
  };
}

export default function GenererAnalyseModal({
  open,
  onClose,
  onEnregistre,
  type,
  periodicite,
  periodeLibelle,
  utilisateur,
}: Props) {
  const [chargement, setChargement] = useState(true);
  const [snapshot, setSnapshot] = useState<SnapshotRapport | null>(null);
  const [succesSave, setSuccesSave] = useState(false);

  const { enregistrer, isLoading: isSaving } = useEnregistrerRapport();
  const { imprimer } = useImprimerRapport();

  // --------------------------------------------------------
  // Chargement de l'analyse à l'ouverture
  // --------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    setChargement(true);
    setSnapshot(null);
    setSuccesSave(false);

    fetchAnalyse(type, periodicite, periodeLibelle)
      .then((data) => setSnapshot(data))
      .finally(() => setChargement(false));
  }, [open, type, periodicite, periodeLibelle]);

  // --------------------------------------------------------
  // Fermeture via Escape
  // --------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const meta = TYPE_RAPPORT_META[type];

  // --------------------------------------------------------
  // Déduction du statut
  // --------------------------------------------------------
  const getStatut = (): StatutRapport => {
    if (!snapshot) return "conforme";
    const tr = Number(snapshot.kpisDetailles.tauxRecouvrement) || 0;
    if (tr < 90) return "critique";
    if (tr < 95) return "alerte";
    return "conforme";
  };

  // --------------------------------------------------------
  // Actions
  // --------------------------------------------------------
  const handleEnregistrer = async () => {
    if (!snapshot) return;
    const filtres: FiltresRapport = { periode: periodicite };
    try {
      const rapport = await enregistrer({
        type,
        filtres,
        snapshot,
        statut: getStatut(),
        generePar: utilisateur,
      });
      setSuccesSave(true);
      setTimeout(() => {
        onEnregistre?.(rapport.id);
        onClose();
      }, 1000);
    } catch {
      /* erreur déjà dans le hook */
    }
  };

  const handleImprimer = () => {
    imprimer("zone-analyse-print", `${meta.label} — ${periodeLibelle}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50">
      <div className="flex h-full w-full flex-col bg-gray-50">
        {/* ================= HEADER ================= */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Analyse — {meta.label}
              </h1>
              <p className="text-xs text-gray-500">
                {periodeLibelle} · {meta.description} ·{" "}
                <span className="italic">non sauvegardée</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Imprimer */}
            <button
              onClick={handleImprimer}
              disabled={chargement || !snapshot}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </button>

            {/* Enregistrer */}
            <button
              onClick={handleEnregistrer}
              disabled={chargement || !snapshot || isSaving || succesSave}
              className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
            >
              {succesSave ? (
                <>
                  <Check className="h-4 w-4" />
                  Enregistré
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer comme rapport
                </>
              )}
            </button>

            {/* Fermer */}
            <button
              onClick={onClose}
              className="ml-2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ================= CONTENU SCROLLABLE ================= */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-6">
            {/* Avertissement état temporaire */}
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-amber-900 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-sm">
                Cette analyse est <strong>temporaire</strong>. Pour la conserver,
                cliquez sur « Enregistrer comme rapport ». Sinon, elle sera
                perdue à la fermeture.
              </p>
            </div>

            {chargement ? (
              <LoadingState />
            ) : snapshot ? (
              // Le id="zone-analyse-print" est ce qui sera capturé à l'impression
              <div id="zone-analyse-print" className="space-y-6">
                <KpiPrincipalCard snapshot={snapshot} statut={getStatut()} />
                <NoteGlobaleCard note={snapshot.noteGlobale ?? 0} />
                <KpisDetaillesGrid data={snapshot.kpisDetailles} />
                <RecommandationsCard
                  items={snapshot.recommandations ?? []}
                  statut={getStatut()}
                />
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sous-composants UI
// ============================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      <p className="text-sm text-gray-600">Génération de l&apos;analyse…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl bg-white p-10 text-center ring-1 ring-gray-200">
      <p className="text-sm text-gray-500">
        Impossible de charger l&apos;analyse. Réessayez.
      </p>
    </div>
  );
}

function KpiPrincipalCard({
  snapshot,
  statut,
}: {
  snapshot: SnapshotRapport;
  statut: StatutRapport;
}) {
  const { label, valeur, unite, seuil } = snapshot.kpiPrincipal;

  const badgeStyle = {
    conforme: "bg-green-100 text-green-800 ring-green-200",
    alerte: "bg-amber-100 text-amber-800 ring-amber-200",
    critique: "bg-red-100 text-red-800 ring-red-200",
  }[statut];

  const Icon = {
    conforme: CheckCircle2,
    alerte: AlertTriangle,
    critique: XCircle,
  }[statut];

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            KPI Principal
          </p>
          <h2 className="mt-1 text-base font-semibold text-gray-900">
            {label}
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${badgeStyle}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {statut === "conforme"
            ? "Conforme"
            : statut === "alerte"
            ? "À surveiller"
            : "Critique"}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-gray-900">
          {valeur.toLocaleString("fr-FR")}
        </span>
        <span className="text-xl text-gray-500">{unite}</span>
      </div>
      {seuil !== undefined && (
        <p className="mt-1 text-xs text-gray-500">
          Seuil réglementaire : {seuil}
          {unite}
        </p>
      )}
    </div>
  );
}

function NoteGlobaleCard({ note }: { note: number }) {
  const couleur =
    note >= 85 ? "text-green-700" : note >= 60 ? "text-amber-700" : "text-red-700";
  const barre =
    note >= 85 ? "bg-green-600" : note >= 60 ? "bg-amber-500" : "bg-red-600";

  return (
    <div className="rounded-2xl bg-green-50 p-6 ring-1 ring-green-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
            Note globale
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${couleur}`}>{note}</span>
            <span className="text-lg text-gray-500">/100</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {note >= 85
            ? "La caisse est en bonne santé."
            : note >= 60
            ? "Performance acceptable, à surveiller."
            : "Action corrective nécessaire."}
        </p>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white">
        <div
          className={`h-full ${barre} transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, note))}%` }}
        />
      </div>
    </div>
  );
}

function KpisDetaillesGrid({
  data,
}: {
  data: Record<string, number | string>;
}) {
  const items: { key: string; label: string; unite?: string }[] = [
    { key: "ratioEndettement", label: "Ratio d'endettement", unite: "%" },
    { key: "tauxRecouvrement", label: "Taux de recouvrement", unite: "%" },
    { key: "capaciteMoyenne", label: "Capacité moyenne", unite: "HTG" },
    { key: "creancesDouteuses", label: "Créances douteuses", unite: "%" },
    { key: "ratioLiquidite", label: "Ratio de liquidité" },
    { key: "reservesObligatoires", label: "Réserves obligatoires", unite: "%" },
    { key: "couvertureRisques", label: "Couverture des risques", unite: "%" },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Indicateurs détaillés
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items
          .filter((item) => data[item.key] !== undefined)
          .map((item) => (
            <div key={item.key} className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {typeof data[item.key] === "number"
                  ? Number(data[item.key]).toLocaleString("fr-FR")
                  : data[item.key]}
                {item.unite && (
                  <span className="ml-1 text-sm text-gray-500">
                    {item.unite}
                  </span>
                )}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

function RecommandationsCard({
  items,
  statut,
}: {
  items: string[];
  statut: StatutRapport;
}) {
  if (items.length === 0) return null;

  const bg = {
    conforme: "bg-green-50 ring-green-100",
    alerte: "bg-amber-50 ring-amber-100",
    critique: "bg-red-50 ring-red-100",
  }[statut];

  return (
    <div className={`rounded-2xl p-6 ring-1 ${bg}`}>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Recommandations
      </h3>
      <ul className="space-y-2">
        {items.map((reco, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
            {reco}
          </li>
        ))}
      </ul>
    </div>
  );
}