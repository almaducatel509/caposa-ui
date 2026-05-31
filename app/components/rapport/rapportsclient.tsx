"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Plus } from "lucide-react";
import GenererModal from "./Generermodal";
import RapportsTable, { RapportRow } from "./Rapportstable";

// ============================================================
// RapportsClient.tsx
// ------------------------------------------------------------
// Logique complète de la page /dashboard/rapports :
//   1. Fetch la liste des rapports depuis GET /api/reports
//   2. Bouton "+ Générer une analyse" → ouvre GenererModal
//   3. GenererModal valide → router.push vers /analyse?...
//   4. RapportsTable affiche la liste avec tri
// ============================================================

export default function RapportsClient() {
  const router = useRouter();

  // ── Liste des rapports ────────────────────────────────────
  const [rapports, setRapports] = useState<RapportRow[]>([]);
  const [loading,  setLoading]  = useState(true);

  // ── Modal config ouvert/fermé ─────────────────────────────
  const [modalOuvert, setModalOuvert] = useState(false);

  // ── Fetch GET /api/reports ────────────────────────────────
  const fetchRapports = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/reports");
      const data = await res.json();
      setRapports(data);
    } catch (e) {
      console.error("Erreur chargement rapports", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement au montage
  useEffect(() => {
    fetchRapports();
  }, [fetchRapports]);

  // ── Quand GenererModal valide ─────────────────────────────
  // On redirige vers la page analyse avec les params dans l'URL
  function handleGenerer(params: {
    type:        string;
    periodicite: string;
    periode:     string;
  }) {
    setModalOuvert(false);
    router.push(
      `/dashboard/rapports/analyse?type=${params.type}&periodicite=${params.periodicite}&periode=${encodeURIComponent(params.periode)}`
    );
  }

  // ── Voir un rapport → page détail ────────────────────────
  function handleVoir(r: RapportRow) {
    router.push(`/dashboard/rapports/${r.id}`);
  }

  // ── Export PDF d'un rapport enregistré ───────────────────
  // Pour l'instant : log. À brancher sur jsPDF si besoin.
  function handleExportPdf(r: RapportRow) {
    console.log("Export PDF rapport", r.reference);
    // TODO: générer PDF depuis r.snapshot si tu veux
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">

      {/* ── En-tête de page ── */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
            <TrendingUp className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rapports</h1>
            <p className="text-sm text-gray-500">
              Historique des analyses officielles enregistrées
            </p>
          </div>
        </div>

        {/* Bouton principal */}
        <button
          onClick={() => setModalOuvert(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Générer une analyse
        </button>
      </div>

      {/* ── Tableau des rapports ── */}
      <RapportsTable
        rapports={rapports}
        loading={loading}
        onVoir={handleVoir}
        onExportPdf={handleExportPdf}
      />

      {/* ── Modal config (type + période) ── */}
      {modalOuvert && (
        <GenererModal
          onClose={() => setModalOuvert(false)}
          onGenerer={handleGenerer}
        />
      )}

    </div>
  );
}