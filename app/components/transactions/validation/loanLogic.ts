import { LoanData, LoanStatus, LoanType, LoanFormData, LoanFormErrors } from "./loanSchema";

// 🧩 Fonctions métier (statuts, permissions, validations logiques)
export function canEditLoan(status: LoanStatus): boolean {
  return status === "en_attente" || status === "rejete";
}

export function canApproveLoan(status: LoanStatus): boolean {
  return status === "en_attente";
}

export function canCancelLoan(status: LoanStatus): boolean {
  const lockedStatuses: LoanStatus[] = ["rembourse", "annule"];
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
  if (!data.loan_type) {
    errors.loan_type = "Le type de prêt est requis.";
  }

  if (!data.amount || data.amount <= 0) {
    errors.amount = "Le montant demandé doit être supérieur à 0.";
  }

  if (!data.duration_months || data.duration_months <= 0) {
    errors.duration_months = "La durée doit être positive.";
  }

  if (data.interest_rate !== undefined && (data.interest_rate < 0 || data.interest_rate > 100)) {
    errors.interest_rate = "Le taux doit être entre 0 et 100%.";
  }

  if (data.created_at) {
    const today = new Date().toISOString().split("T")[0];
    if (data.created_at > today) {
      errors.created_at = "La date de demande ne peut pas être dans le futur.";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
