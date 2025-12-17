// 🧮 Fonctions de calcul financier pour les prêts

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  return (
    (principal * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -months))
  );
}

export function calculateTotalInterest(
  monthlyPayment: number,
  months: number,
  principal: number
): number {
  const totalPaid = monthlyPayment * months;
  return totalPaid - principal;
}

export function calculateEffectiveRate(
  annualRate: number,
  fees: number,
  principal: number
): number {
  if (principal <= 0) return annualRate;
  const feeRate = (fees / principal) * 100;
  return annualRate + feeRate;
}
