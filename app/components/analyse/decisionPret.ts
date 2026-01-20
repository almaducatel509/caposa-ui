export function decisionPret(analyse: {
  ratioEndettement: number;
  capaciteRemboursement: number;
  mensualiteEstimee: number;
  revenuMensuel: number;
  depensesMensuelles: number;
}) {
  const raisons: string[] = [];

  if (analyse.ratioEndettement > 0.4) {
    raisons.push("Le ratio d’endettement dépasse 40%.");
  }

  if (analyse.capaciteRemboursement < analyse.mensualiteEstimee) {
    raisons.push("La capacité de remboursement est insuffisante.");
  }

  if (analyse.revenuMensuel < analyse.depensesMensuelles) {
    raisons.push("Les dépenses dépassent le revenu.");
  }

  if (raisons.length > 0) {
    return {
      approuve: false,
      raisons,
    };
  }

  return {
    approuve: true,
    message: "Le prêt est approuvé et peut être décaissé.",
  };
}
