"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Lock,
  User,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";
import type { Rapport } from "@/types/rapport";
import { TYPE_RAPPORT_META } from "@/types/rapport";
import { useImprimerRapport } from "@/hooks/useImprimerRapport";

// ============================================================
// Page détail d'un rapport FIGÉ
// ------------------------------------------------------------
// Route : /dashboard/rapports/[id]
// Aucune modification possible. Affiche un badge "Données
// figées au [date]" et permet uniquement l'impression/export PDF.
// ============================================================

export default function RapportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [chargement, setChargement] = useState(true);

  const { imprimer } = useImprimerRapport();

  // --------------------------------------------------------
  // Charger le rapport (🔌 remplace par fetch /api/reports/:id)
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    // Version démo : lit depuis localStorage
    if (typeof window !== "undefined") {
      const tous: Rapport[] = JSON.parse(
        localStorage.getItem("caposa:rapports") || "[]"
      );
      const trouve = tous.find((r) => r.id === id);
      setRapport(trouve ?? null);
      setChargement(false);
    }

    // Version API :
    // fetch(`/api/reports/${id}`)
    //   .then((r) => r.json())
    //   .then(setRapport)
    //   .finally(() => setChargement(false));
  }, [id]);

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Chargement…</p>
      </div>
    );
  }

  if (!rapport) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h1 className="mt-4 text-lg font-semibold text-gray-900">
          Rapport introuvable
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Ce rapport n&apos;existe pas ou a été supprimé.
        </p>
        <button
          onClick={() => router.push("/dashboard/rapports")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>
      </div>
    );
  }

  const meta = TYPE_RAPPORT_META[rapport.type];
  const dateGenerele = new Date(rapport.generele);
  const dateFormatee = dateGenerele.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleImprimer = () => {
    imprimer("zone-rapport-print", `${meta.label} — ${rapport.periodeLibelle}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= TOPBAR ================= */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/dashboard/rapports")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux rapports
          </button>

          <button
            onClick={handleImprimer}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            <Printer className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ================= CONTENU ================= */}
      <main className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Badge "Données figées" + métadonnées */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <FileText className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {rapport.nom ?? meta.label}
                </h1>
                <p className="text-sm text-gray-500">
                  {meta.description} · {rapport.periodeLibelle}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">
              <Lock className="h-3.5 w-3.5" />
              Données figées au {dateFormatee}
            </span>
          </div>

          {/* Métadonnées */}
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
            <MetaItem
              icon={<Hash className="h-4 w-4" />}
              label="Référence"
              value={rapport.reference}
            />
            <MetaItem
              icon={<User className="h-4 w-4" />}
              label="Généré par"
              value={rapport.generePar.nom}
            />
            <MetaItem
              icon={<Calendar className="h-4 w-4" />}
              label="Période analysée"
              value={rapport.periodeLibelle}
            />
          </div>
        </div>

        {/* Zone d'impression */}
        <div id="zone-rapport-print" className="space-y-6">
          {/* KPI principal */}
          <section className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              KPI Principal
            </p>
            <h2 className="mt-1 text-base font-semibold text-gray-900">
              {rapport.snapshot.kpiPrincipal.label}
            </h2>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-green-700">
                {rapport.snapshot.kpiPrincipal.valeur.toLocaleString("fr-FR")}
              </span>
              <span className="text-2xl text-gray-500">
                {rapport.snapshot.kpiPrincipal.unite}
              </span>
            </div>
            {rapport.snapshot.kpiPrincipal.seuil !== undefined && (
              <p className="mt-2 text-sm text-gray-500">
                Seuil réglementaire :{" "}
                <strong className="text-gray-700">
                  {rapport.snapshot.kpiPrincipal.seuil}
                  {rapport.snapshot.kpiPrincipal.unite}
                </strong>
              </p>
            )}
          </section>

          {/* Note globale */}
          {rapport.snapshot.noteGlobale !== undefined && (
            <section className="rounded-2xl bg-green-50 p-6 ring-1 ring-green-100">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                Note globale
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-green-700">
                  {rapport.snapshot.noteGlobale}
                </span>
                <span className="text-lg text-gray-500">/100</span>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full bg-green-600"
                  style={{
                    width: `${Math.min(100, rapport.snapshot.noteGlobale)}%`,
                  }}
                />
              </div>
            </section>
          )}

          {/* KPIs détaillés */}
          <section className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Indicateurs détaillés
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Object.entries(rapport.snapshot.kpisDetailles).map(
                ([key, val]) => (
                  <div key={key} className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs capitalize text-gray-500">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      {typeof val === "number"
                        ? val.toLocaleString("fr-FR")
                        : val}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Recommandations */}
          {rapport.snapshot.recommandations &&
            rapport.snapshot.recommandations.length > 0 && (
              <section className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-100">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Recommandations
                </h3>
                <ul className="space-y-2">
                  {rapport.snapshot.recommandations.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
        </div>

        {/* Footer : avertissement immuabilité */}
        <div className="rounded-xl bg-gray-100 p-4 text-center text-xs text-gray-500">
          <Lock className="mr-1 inline h-3 w-3" />
          Ce rapport est en lecture seule. Pour obtenir une analyse
          actualisée, générez-en une nouvelle depuis la page Rapports.
        </div>
      </main>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}