"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";


import { getAnalyseRapport, saveRapport } from "@/types/rapport.service";
import { AnalyseHeader, KpiPrincipalCard, KpisDetaillesGrid, RecommandationsCard } from "../Kpianalyse";
import { TypeRapport, PeriodeRapport, SnapshotRapport, StatutRapport, TYPE_RAPPORT_META } from "@/types/rapports";

// ============================================================
// Analyse.tsx
// ------------------------------------------------------------
// Composant principal de la page analyse temporaire.
// Responsabilités :
//   1. Lire type / periodicite / periode depuis l'URL
//   2. Appeler getAnalyseRapport() au montage
//   3. Déduire le statut depuis le snapshot
//   4. Gérer Save (→ backend) et Export PDF (→ jsPDF)
//   5. Assembler les blocs UI depuis kpiAnalyse.tsx
// ============================================================

// Utilisateur courant — à remplacer par ton hook d'auth
const UTILISATEUR = { id: "u_001", nom: "Jean Dupont" };

export default function Analyse() {
  const params = useSearchParams();
  const router = useRouter();

  // ── Params URL ────────────────────────────────────────────
  const type        = params.get("type")        as TypeRapport  | null;
  const periodicite = params.get("periodicite") as PeriodeRapport | null;
  const periode     = params.get("periode")     ?? "";

  // ── État ──────────────────────────────────────────────────
  const [snapshot,   setSnapshot]   = useState<SnapshotRapport | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [erreur,     setErreur]     = useState<string | null>(null);
  const [isSaving,   setIsSaving]   = useState(false);
  const [succesSave, setSuccesSave] = useState(false);

  // ── Chargement de l'analyse au montage ───────────────────
  useEffect(() => {
    // Params manquants → on ne peut pas charger
    if (!type || !periodicite) {
      setErreur("Paramètres manquants dans l'URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErreur(null);

    getAnalyseRapport(type, periodicite, periode)
      .then(data => setSnapshot(data))
      .catch(() => setErreur("Impossible de générer l'analyse. Réessayez."))
      .finally(() => setLoading(false));

  }, [type, periodicite, periode]);

  // ── Déduction du statut depuis le snapshot ───────────────
  // Basé sur le taux de recouvrement :
  //   < 90 % → critique  |  < 95 % → alerte  |  sinon → conforme
  function getStatut(): StatutRapport {
    if (!snapshot) return "conforme";
    const tr = Number(snapshot.kpisDetailles.tauxRecouvrement) || 0;
    if (tr < 90) return "critique";
    if (tr < 95) return "alerte";
    return "conforme";
  }

  // ── Save → POST /api/reports ──────────────────────────────
  async function handleSave() {
    if (!snapshot || !type || !periodicite) return;

    setIsSaving(true);
    try {
      await saveRapport({
        type,
        periodicite,
        periode_libelle: periode,
        snapshot,
        statut:          getStatut(),
        genere_par:      UTILISATEUR,
      });

      setSuccesSave(true);

      // Retour à la liste après 1 seconde
      setTimeout(() => router.push("/dashboard/rapports"), 1000);

    } catch (e) {
      console.error(e);
      // Tu peux afficher un toast ici si tu as un système de notifs
    } finally {
      setIsSaving(false);
    }
  }

  const handleClose = () => {
    router.push("/dashboard/rapports");
  };

  // ── Export PDF via jsPDF ──────────────────────────────────
  // Écrit directement le texte dans le PDF — pas de html2canvas.
  // Plus fiable avec Next.js / Tailwind.
  async function handleExportPdf() {
    if (!snapshot || !type) return;

    const { default: jsPDF } = await import("jspdf");

    const pdf  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W    = pdf.internal.pageSize.getWidth();
    let   y    = 20; // curseur vertical

    // Helpers d'écriture
    const titre = (txt: string) => {
      pdf.setFontSize(16).setFont("helvetica", "bold");
      pdf.text(txt, W / 2, y, { align: "center" });
      y += 10;
    };
    const sous = (txt: string) => {
      pdf.setFontSize(11).setFont("helvetica", "normal");
      pdf.text(txt, W / 2, y, { align: "center" });
      y += 8;
    };
    const section = (txt: string) => {
      y += 4;
      pdf.setFontSize(12).setFont("helvetica", "bold");
      pdf.text(txt, 14, y);
      y += 6;
    };
    const ligne = (label: string, valeur: string) => {
      pdf.setFontSize(10).setFont("helvetica", "normal");
      pdf.text(label, 14, y);
      pdf.text(valeur, W - 14, y, { align: "right" });
      y += 6;
    };
    const separateur = () => {
      pdf.setDrawColor(220, 220, 220);
      pdf.line(14, y, W - 14, y);
      y += 4;
    };

    // ── En-tête ──
    titre(`Analyse — ${TYPE_RAPPORT_META[type].label}`);
    sous(`Période : ${periode}  |  Statut : ${getStatut().toUpperCase()}`);
    sous(`Généré le ${new Date().toLocaleDateString("fr-FR")}`);
    separateur();

    // ── KPI principal ──
    const kpi = snapshot.kpiPrincipal;
    section("KPI Principal");
    ligne(kpi.label, `${kpi.valeur.toLocaleString("fr-FR")} ${kpi.unite}`);
    if (kpi.seuil !== undefined) {
      ligne("Seuil réglementaire", `${kpi.seuil} ${kpi.unite}`);
    }
    separateur();

    // ── Indicateurs détaillés ──
    section("Indicateurs détaillés");
    const KPI_LABELS: Record<string, string> = {
      ratioEndettement:     "Ratio d'endettement (%)",
      tauxRecouvrement:     "Taux de recouvrement (%)",
      capaciteMoyenne:      "Capacité moyenne (HTG)",
      creancesDouteuses:    "Créances douteuses (%)",
      ratioLiquidite:       "Ratio de liquidité",
      reservesObligatoires: "Réserves obligatoires (%)",
      couvertureRisques:    "Couverture des risques (%)",
    };
    Object.entries(snapshot.kpisDetailles).forEach(([key, val]) => {
      const label = KPI_LABELS[key] ?? key;
      ligne(label, String(val));
    });
    separateur();

    // ── Recommandations ──
    if (snapshot.recommandations && snapshot.recommandations.length > 0) {
      section("Recommandations");
      snapshot.recommandations.forEach(r => {
        pdf.setFontSize(10).setFont("helvetica", "normal");
        pdf.text(`• ${r}`, 16, y);
        y += 6;
      });
    }

    pdf.save(`Analyse_${type}_${periode}.pdf`);
  }

  // ── Rendu : params manquants ──────────────────────────────
  if (!type || !periodicite) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 rounded-xl bg-red-50 px-6 py-4 ring-1 ring-red-200">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">
            Paramètres manquants. Retournez à la page rapports et réessayez.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">

      {/* Header fixe en haut */}
      <AnalyseHeader
        type={type}
        periodeLibelle={periode}
        isSaving={isSaving}
        succesSave={succesSave}
        canAct={!loading && !!snapshot}
        onSave={handleSave}
        onExportPdf={handleExportPdf}
        onClose={handleClose}
      />

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6">

          {/* Bandeau avertissement — analyse non sauvegardée */}
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-amber-900 ring-1 ring-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">
              Cette analyse est <strong>temporaire</strong>. Cliquez sur
              « Enregistrer comme rapport » pour la conserver. Sinon, elle
              sera perdue à la fermeture.
            </p>
          </div>

          {/* État chargement */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-green-700" />
              <p className="text-sm text-gray-600">Génération de l&apos;analyse…</p>
            </div>
          )}

          {/* État erreur */}
          {!loading && erreur && (
            <div className="rounded-xl bg-white p-10 text-center ring-1 ring-gray-200">
              <p className="text-sm text-gray-500">{erreur}</p>
            </div>
          )}

          {/* Contenu principal — la zone capturée par jsPDF */}
          {!loading && snapshot && (
            <div id="zone-analyse-print" className="space-y-6">
              <KpiPrincipalCard
                snapshot={snapshot}
                statut={getStatut()}
              />
              <KpisDetaillesGrid
                data={snapshot.kpisDetailles}
              />
              <RecommandationsCard
                items={snapshot.recommandations ?? []}
                statut={getStatut()}
              />
            </div>
          )}

        </div>
      </div>

    </div>
  );
}