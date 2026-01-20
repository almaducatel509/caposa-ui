export function genererTableauAmortissement(
  montant: number,
  tauxAnnuel: number,
  dureeMois: number
) {
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const mensualite =
    montant *
    (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) /
    (Math.pow(1 + tauxMensuel, dureeMois) - 1);

  let solde = montant;
  const tableau = [];

  for (let mois = 1; mois <= dureeMois; mois++) {
    const interet = solde * tauxMensuel;
    const capital = mensualite - interet;
    solde -= capital;

    tableau.push({
      mois,
      mensualite: mensualite.toFixed(2),
      capital: capital.toFixed(2),
      interet: interet.toFixed(2),
      solde: solde > 0 ? solde.toFixed(2) : "0.00",
    });
  }

  return tableau;
}
