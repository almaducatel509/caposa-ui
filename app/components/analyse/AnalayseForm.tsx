"use client";

import { useState } from "react";
import { genererAnalyseFinanciere } from "./genererAnalyseFinanciere";
import { validerAnalyseFinanciere } from "./validation";

export default function AnalyseFinanciereForm({ loan }) {
  const [revenuMensuel, setRevenuMensuel] = useState(0);
  const [depensesMensuelles, setDepensesMensuelles] = useState(0);
  const [resultat, setResultat] = useState(null);
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();

    const analyse = genererAnalyseFinanciere({
      id_analyse: crypto.randomUUID(),
      id_pret: loan.id_loan,
      montant: loan.montantDemande,
      tauxAnnuel: loan.tauxInteret,
      dureeMois: loan.dureeMois,
      revenuMensuel,
      depensesMensuelles,
    });

    const validation = validerAnalyseFinanciere(analyse);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setResultat(analyse);

    // TODO: envoyer au backend
    // await fetch("/api/analyse", { method: "POST", body: JSON.stringify(analyse) });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <h2 className="text-xl font-bold">Analyse Financière</h2>

      <div>
        <label>Revenu mensuel</label>
        <input
          type="number"
          value={revenuMensuel}
          onChange={(e) => setRevenuMensuel(Number(e.target.value))}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label>Dépenses mensuelles</label>
        <input
          type="number"
          value={depensesMensuelles}
          onChange={(e) => setDepensesMensuelles(Number(e.target.value))}
          className="border p-2 w-full"
        />
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Générer l’analyse
      </button>

      {resultat && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Résultats</h3>
          <p>Mensualité estimée : {resultat.mensualiteEstimee} G</p>
          <p>Capacité de remboursement : {resultat.capaciteRemboursement} G</p>
          <p>Ratio d’endettement : {resultat.ratioEndettement}</p>
        </div>
      )}
    </form>
  );
}
