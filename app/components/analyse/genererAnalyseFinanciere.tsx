import { AnalyseFinanciere, calculerMensualite } from "./validation";

export function genererAnalyseFinanciere(params: {
  id_analyse: string;
  id_pret: string;
  montant: number;
  tauxAnnuel: number;
  dureeMois: number;
  revenuMensuel: number;
  depensesMensuelles: number;
}): AnalyseFinanciere {
  const mensualiteEstimee = calculerMensualite(
    params.montant,
    params.tauxAnnuel,
    params.dureeMois
  );

  const capaciteRemboursement =
    params.revenuMensuel - params.depensesMensuelles;

  const ratioEndettement =
    mensualiteEstimee / params.revenuMensuel;

  return {
    id_analyse: params.id_analyse,
    id_pret: params.id_pret,

    revenuMensuel: params.revenuMensuel,
    depensesMensuelles: params.depensesMensuelles,

    capaciteRemboursement,
    ratioEndettement: Number(ratioEndettement.toFixed(2)),

    mensualiteEstimee,
  };
}
