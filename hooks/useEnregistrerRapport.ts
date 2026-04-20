"use client";

// ============================================================
// Emplacement : caposa-ui/hooks/useEnregistrerRapport.ts
// Rôle : sauvegarder une analyse en tant que rapport figé
// ============================================================

import { useState, useCallback } from "react";
import type {
  Rapport,
  TypeRapport,
  FiltresRapport,
  SnapshotRapport,
  StatutRapport,
} from "@/types/rapport";
import { TYPE_RAPPORT_META } from "@/types/rapport";

interface EnregistrerParams {
  type: TypeRapport;
  nom?: string;
  filtres: FiltresRapport;
  snapshot: SnapshotRapport;
  statut: StatutRapport;
  generePar: { id: string; nom: string };
}

interface UseEnregistrerRapportResult {
  enregistrer: (params: EnregistrerParams) => Promise<Rapport>;
  isLoading: boolean;
  error: string | null;
  dernierRapport: Rapport | null;
}

function genererReference(type: TypeRapport, date = new Date()): string {
  const yyyymm =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, "0");
  const suffix = Math.floor(100 + Math.random() * 900);
  const prefix = TYPE_RAPPORT_META[type].prefix;
  return `RPT-${yyyymm}-${prefix}-${suffix}`;
}

function getNumeroSemaine(date: Date): number {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

function formaterPeriode(periode: string, date = new Date()): string {
  const mois = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];
  const annee = date.getFullYear();

  switch (periode) {
    case "jour":
      return date.toLocaleDateString("fr-FR");
    case "semaine":
      return `Semaine ${getNumeroSemaine(date)} — ${annee}`;
    case "trimestre":
      return `T${Math.floor(date.getMonth() / 3) + 1} ${annee}`;
    case "annee":
      return `${annee}`;
    case "mois":
    default:
      return `${mois[date.getMonth()]} ${annee}`;
  }
}

export function useEnregistrerRapport(): UseEnregistrerRapportResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dernierRapport, setDernierRapport] = useState<Rapport | null>(null);

  const enregistrer = useCallback(
    async (params: EnregistrerParams): Promise<Rapport> => {
      setIsLoading(true);
      setError(null);

      try {
        const maintenant = new Date();

        const rapport: Rapport = {
          id: crypto.randomUUID(),
          type: params.type,
          nom: params.nom,
          periodeLibelle: formaterPeriode(params.filtres.periode, maintenant),
          filtres: params.filtres,
          snapshot: params.snapshot,
          statut: params.statut,
          etat: "actif",
          generePar: params.generePar,
          generele: maintenant.toISOString(),
          reference: genererReference(params.type, maintenant),
        };

        // 🔌 Brancher ici l'API Django quand prêt :
        // const res = await fetch("/api/reports", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(rapport),
        // });
        // if (!res.ok) throw new Error("Échec de l'enregistrement");
        // const saved: Rapport = await res.json();

        // Démo : localStorage
        await new Promise((r) => setTimeout(r, 400));
        if (typeof window !== "undefined") {
          const existants: Rapport[] = JSON.parse(
            localStorage.getItem("caposa:rapports") || "[]"
          );
          localStorage.setItem(
            "caposa:rapports",
            JSON.stringify([rapport, ...existants])
          );
        }

        setDernierRapport(rapport);
        return rapport;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur inconnue";
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { enregistrer, isLoading, error, dernierRapport };
}