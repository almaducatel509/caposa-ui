/**
 * loanSchema.ts — types, libellés et validation du module prêts
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/components/transactions/validation/loanSchema.ts
 *
 * Source unique de vérité côté front pour le vocabulaire des prêts.
 * Les CLÉS sont exactement celles du modèle Django (voir
 * docs/caposa-module-prets-contrat.md) ; seuls les LIBELLÉS sont en français.
 *
 * Règle : aucun calcul financier ici. Les montants calculés
 * (échéance, solde, retard) viennent du backend ou ne s'affichent pas.
 * ─────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

// ─── Types de prêt ────────────────────────────────────────────────
// ⚠️ En attente de CS : TYPE_CHOICES Django à aligner sur cette liste.

export const loanTypes = [
  'commerce',
  'agriculture',
  'elevage',
  'logement',
  'equipement',
  'scolaire',
  'personnel',
] as const;
export type LoanType = typeof loanTypes[number];

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  commerce:    'Commerce',
  agriculture: 'Agriculture',
  elevage:     'Élevage',
  logement:    'Logement',
  equipement:  'Équipement',
  scolaire:    'Scolaire',
  personnel:   'Personnel',
};

// ─── Fréquence de remboursement ───────────────────────────────────

export const paymentFrequencies = ['weekly', 'biweekly', 'monthly'] as const;
export type PaymentFrequency = typeof paymentFrequencies[number];

// 'biweekly' = toutes les deux semaines (bihebdomadaire), pas deux fois par mois.
export const PAYMENT_FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  weekly:   'Hebdomadaire',
  biweekly: 'Bihebdomadaire',
  monthly:  'Mensuel',
};

// ─── Statuts ──────────────────────────────────────────────────────

export const loanStatuses = ['pending', 'approved', 'active', 'paid', 'rejected'] as const;
export type LoanStatus = typeof loanStatuses[number];

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  pending:  'En attente',
  approved: 'Approuvé',
  active:   'Décaissé',
  paid:     'Remboursé',
  rejected: 'Rejeté',
};

// ─── LoanData : un prêt tel que l'UI le manipule ──────────────────
// Même forme que la réponse de GET /loans/, montants convertis en number
// (DRF renvoie les DecimalField en string — conversion faite dans loans.ts).

export interface LoanData {
  // Identité
  id:             string;
  member:         string;   // UUID du membre
  member_name:    string;
  account:        string;   // UUID du compte crédité au décaissement
  account_number: string;
  employee:       string | null;  // employé ayant saisi la demande

  // Conditions (modifiables seulement si status = 'pending')
  loan_type:         LoanType;
  loan_amount:       number;   // HTG
  interest_rate:     number;   // %
  loan_duration:     number;   // mois
  payment_frequency: PaymentFrequency;
  guarantor_account: string | null;
  notes:             string | null;

  // État et dates — fixés par Django
  status:            LoanStatus;
  request_date:      string;
  approval_date:     string | null;
  disbursement_date: string | null;
  due_date:          string | null;
  created_at:        string;
  updated_at:        string;

  // ⚠️ En attente de CS — undefined/null tant que le backend ne les expose pas.
  // Affichage : « — ». Ne JAMAIS les recalculer côté front.
  rejection_reason?:   string | null;
  closed_at?:          string | null;
  total_due?:          number | null;
  installment_amount?: number | null;
  amount_paid?:        number | null;
  remaining_balance?:  number | null;
  next_due_date?:      string | null;
  is_late?:            boolean | null;
  late_days?:          number | null;
}

// ─── Onglets de LoansTable ────────────────────────────────────────

export type LoanTab = 'demandes' | 'a_jour' | 'retard' | 'archive';

/**
 * Classe un prêt dans un onglet.
 * « En retard » = `is_late` du backend. Tant que CS ne l'expose pas,
 * repli provisoire : décaissé ET date de fin dépassée.
 */
export function getLoanTab(loan: LoanData, today = new Date()): LoanTab {
  switch (loan.status) {
    case 'pending':
    case 'approved':
      return 'demandes';
    case 'active': {
      if (typeof loan.is_late === 'boolean') return loan.is_late ? 'retard' : 'a_jour';
      if (!loan.due_date) return 'a_jour';
      return new Date(`${loan.due_date}T23:59:59`) < today ? 'retard' : 'a_jour';
    }
    default:
      return 'archive';
  }
}

// ─── Niveau de risque (affichage seulement, d'après late_days backend) ──

export type RiskLevel = 'ok' | 'late' | 'critical';

export function getRiskLevel(lateDays: number | null | undefined): RiskLevel | null {
  if (lateDays == null) return null;      // inconnu : pas de badge
  if (lateDays >= 30) return 'critical';
  if (lateDays >= 1)  return 'late';
  return 'ok';
}

// ─── Formulaire de création ───────────────────────────────────────
// Règles du contrat vérifiées aussi par le backend (qui a le dernier mot).
// `z.coerce` accepte les valeurs d'<input> (string) et les convertit.

export const loanFormSchema = z
  .object({
    member:  z.string().min(1, 'Le membre est requis.'),
    account: z.string().min(1, 'Le compte est requis.'),

    loan_type: z.enum(loanTypes, {
      errorMap: () => ({ message: 'Le type de prêt est requis.' }),
    }),

    loan_amount: z.coerce
      .number({ invalid_type_error: 'Le montant est requis.' })
      .positive('Le montant doit être supérieur à 0.'),

    interest_rate: z.coerce
      .number({ invalid_type_error: "Le taux d'intérêt est requis." })
      .min(0, 'Le taux ne peut pas être négatif.')
      .max(100, 'Le taux ne peut pas dépasser 100 %.'),

    loan_duration: z.coerce
      .number({ invalid_type_error: 'La durée est requise.' })
      .int('La durée doit être un nombre entier de mois.')
      .min(3, 'La durée minimale est de 3 mois.')
      .max(60, 'La durée maximale est de 60 mois.'),

    payment_frequency: z.enum(paymentFrequencies, {
      errorMap: () => ({ message: 'La fréquence de remboursement est requise.' }),
    }),

    guarantor_account: z.string().nullable().optional(),

    notes: z
      .string()
      .max(500, 'Les notes ne peuvent pas dépasser 500 caractères.')
      .optional(),
  })
  .refine(d => !d.guarantor_account || d.guarantor_account !== d.account, {
    message: "Le compte garant doit être différent du compte de l'emprunteur.",
    path:    ['guarantor_account'],
  });

export type LoanFormData   = z.infer<typeof loanFormSchema>;
export type LoanFormErrors = Partial<Record<keyof LoanFormData, string>>;

export function validateLoanForm(input: unknown):
  | { isValid: true;  data: LoanFormData; errors: LoanFormErrors }
  | { isValid: false; errors: LoanFormErrors } {
  const result = loanFormSchema.safeParse(input);
  if (result.success) return { isValid: true, data: result.data, errors: {} };

  const errors: LoanFormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof LoanFormData;
    if (!errors[key]) errors[key] = issue.message;
  }
  return { isValid: false, errors };
}

// ─── Payload de création (POST /loans/) ───────────────────────────

export interface CreateLoanPayload extends Omit<LoanFormData, 'guarantor_account' | 'notes'> {
  guarantor_account: string | null;
  notes:             string | null;
  due_date:          string;
}

/**
 * ⚠️ TEMPORAIRE : `due_date` est encore obligatoire côté Django.
 * Valeur provisoire = aujourd'hui + durée. À SUPPRIMER dès que CS la
 * rend nullable et la calcule au décaissement (contrat, section Modèle).
 */
export function toCreateLoanPayload(form: LoanFormData): CreateLoanPayload {
  const d = new Date();
  d.setMonth(d.getMonth() + form.loan_duration);
  const due_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return {
    ...form,
    guarantor_account: form.guarantor_account || null,
    notes:             form.notes?.trim() || null,
    due_date,
  };
}