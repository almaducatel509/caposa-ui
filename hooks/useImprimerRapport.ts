"use client";

import { useCallback } from "react";

// ============================================================
// Hook useImprimerRapport
// ------------------------------------------------------------
// Imprime un élément (section DOM) via window.print() avec
// un style d'impression propre — sans l'UI du dashboard.
//
// Utilisation :
//   const { imprimer } = useImprimerRapport();
//   <button onClick={() => imprimer("zone-a-imprimer")}>Imprimer</button>
//
//   <div id="zone-a-imprimer">... contenu ...</div>
// ============================================================

interface UseImprimerRapportResult {
  imprimer: (elementId: string, titre?: string) => void;
}

export function useImprimerRapport(): UseImprimerRapportResult {
  const imprimer = useCallback((elementId: string, titre = "Rapport") => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Élément #${elementId} introuvable`);
      return;
    }

    // Ouvre une fenêtre isolée pour l'impression — propre et portable
    const fenetre = window.open("", "_blank", "width=900,height=1200");
    if (!fenetre) {
      alert("Veuillez autoriser les pop-ups pour imprimer.");
      return;
    }

    // Récupère les styles du document courant (Tailwind, etc.)
    const stylesheets = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((node) => node.outerHTML)
      .join("\n");

    fenetre.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>${titre}</title>
        ${stylesheets}
        <style>
          @page {
            size: A4;
            margin: 16mm 14mm;
          }
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
            color: #111827;
            background: #ffffff;
          }
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-bottom: 2px solid #15803d;
            padding-bottom: 8px;
            margin-bottom: 18px;
          }
          .print-header h1 {
            margin: 0;
            font-size: 18px;
            color: #15803d;
          }
          .print-header .meta {
            font-size: 11px;
            color: #6b7280;
          }
          .no-print { display: none !important; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>CAPOSA — ${titre}</h1>
          <div class="meta">Imprimé le ${new Date().toLocaleString("fr-FR")}</div>
        </div>
        ${element.innerHTML}
      </body>
      </html>
    `);

    fenetre.document.close();

    // Attendre que styles + images soient chargés avant d'imprimer
    fenetre.onload = () => {
      fenetre.focus();
      fenetre.print();
      // Ferme après l'impression (ou si l'utilisateur annule)
      fenetre.onafterprint = () => fenetre.close();
    };
  }, []);

  return { imprimer };
}