import { LoanData, LoanStatus, LoanType, LoanFormData, LoanFormErrors } from "./loanSchema";

// 🧩 Fonctions métier (statuts, permissions, validations logiques)
export function canEditLoan(status: LoanStatus): boolean {
  return status === "pending" || status === "rejected";
}

export function canApproveLoan(status: LoanStatus): boolean {
  return status === "pending";
}

export function canCancelLoan(status: LoanStatus): boolean {
  const lockedStatuses: LoanStatus[] = ["paid", "cancelled"];
  return !lockedStatuses.includes(status);
}

// ✅ Validation métier additionnelle
export function validateLoanForm(data: LoanFormData): {
  isValid: boolean;
  errors: LoanFormErrors;
} {
  const errors: LoanFormErrors = {};

  if (!data.id_member) {
    errors.id_member = "Le membre est requis.";
  }

  // ⚙️ Correction de l’erreur TS2367 :
  // On ne compare plus avec "", on teste simplement la "falsiness"
  if (!data.typePret) {
    errors.typePret = "Le type de prêt est requis.";
  }

  if (!data.montantDemande || data.montantDemande <= 0) {
    errors.montantDemande = "Le montant demandé doit être supérieur à 0.";
  }

  if (!data.dureeMois || data.dureeMois <= 0) {
    errors.dureeMois = "La durée doit être positive.";
  }

  if (data.tauxInteret !== undefined && (data.tauxInteret < 0 || data.tauxInteret > 100)) {
    errors.tauxInteret = "Le taux doit être entre 0 et 100%.";
  }

  if (data.dateDemande) {
    const today = new Date().toISOString().split("T")[0];
    if (data.dateDemande > today) {
      errors.dateDemande = "La date de demande ne peut pas être dans le futur.";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
