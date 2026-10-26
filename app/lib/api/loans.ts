/**
 * loans.ts  —  API layer prêts
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/lib/api/loans.ts
 *
 * Appels HTTP uniquement. Types, libellés et validation : loanSchema.ts.
 * Même règle que caisse.ts : aucun mock, aucun fallback silencieux.
 *
 * Prérequis : exporter `describeError` depuis caisse.ts
 *   (`function describeError` → `export function describeError`)
 * ─────────────────────────────────────────────────────────────────
 */

import AxiosInstance from '../axiosInstance';
import { describeError } from './caisse';
import { SessionManager } from './Sessionmanager';
import type {
  LoanData, LoanStatus, LoanType, PaymentFrequency, CreateLoanPayload,
} from '@/app/components/transactions/validation/loanSchema';

// ─── Forme brute renvoyée par DRF (DecimalField → string) ─────────

type Decimal = string | number | null | undefined;

interface LoanApiRaw {
  id:                 string;
  member:             string;
  member_name:        string;
  account:            string;
  account_number:     string;
  employee:           string | null;
  loan_type:          LoanType;
  loan_amount:        Decimal;
  interest_rate:      Decimal;
  loan_duration:      number;
  payment_frequency:  PaymentFrequency;
  guarantor_account:  string | null;
  notes:              string | null;
  status:             LoanStatus;
  request_date:       string;
  approval_date:      string | null;
  disbursement_date:  string | null;
  due_date:           string | null;
  created_at:         string;
  updated_at:         string;
  // en attente de CS
  rejection_reason?:   string | null;
  closed_at?:          string | null;
  total_due?:          Decimal;
  installment_amount?: Decimal;
  amount_paid?:        Decimal;
  remaining_balance?:  Decimal;
  next_due_date?:      string | null;
  is_late?:            boolean | null;
  late_days?:          number | null;
}

/** Montant requis : 0 si illisible. */
const num = (v: Decimal): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Montant calculé facultatif : null si absent (l'UI affichera « — »). */
const optNum = (v: Decimal): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const mapLoan = (r: LoanApiRaw): LoanData => ({
  id:                 String(r.id),
  member:             String(r.member),
  member_name:        r.member_name ?? '',
  account:            String(r.account),
  account_number:     r.account_number ?? '',
  employee:           r.employee ?? null,
  loan_type:          r.loan_type,
  loan_amount:        num(r.loan_amount),
  interest_rate:      num(r.interest_rate),
  loan_duration:      Number(r.loan_duration) || 0,
  payment_frequency:  r.payment_frequency,
  guarantor_account:  r.guarantor_account ?? null,
  notes:              r.notes ?? null,
  status:             r.status,
  request_date:       r.request_date,
  approval_date:      r.approval_date ?? null,
  disbursement_date:  r.disbursement_date ?? null,
  due_date:           r.due_date ?? null,
  created_at:         r.created_at,
  updated_at:         r.updated_at,
  rejection_reason:   r.rejection_reason ?? null,
  closed_at:          r.closed_at ?? null,
  total_due:          optNum(r.total_due),
  installment_amount: optNum(r.installment_amount),
  amount_paid:        optNum(r.amount_paid),
  remaining_balance:  optNum(r.remaining_balance),
  next_due_date:      r.next_due_date ?? null,
  is_late:            typeof r.is_late === 'boolean' ? r.is_late : null,
  late_days:          typeof r.late_days === 'number' ? r.late_days : null,
});

const unwrapList = <T,>(data: T[] | { results?: T[] }): T[] =>
  Array.isArray(data) ? data : data?.results ?? [];

// ─── Lecture ──────────────────────────────────────────────────────

/** GET /loans/ — filtres optionnels ?member= et ?status= */
export async function fetchLoans(params?: { member?: string; status?: LoanStatus }): Promise<LoanData[]> {
  try {
    const { data } = await AxiosInstance.get<LoanApiRaw[] | { results: LoanApiRaw[] }>('/loans/', { params });
    return unwrapList(data).map(mapLoan);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les prêts'));
  }
}

/** GET /loans/{id}/ */
export async function fetchLoan(id: string): Promise<LoanData> {
  try {
    const { data } = await AxiosInstance.get<LoanApiRaw>(`/loans/${id}/`);
    return mapLoan(data);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger ce prêt'));
  }
}

/** GET /loans/{id}/payments/ — remboursements du prêt */
export async function fetchLoanPayments(id: string): Promise<unknown[]> {
  try {
    const { data } = await AxiosInstance.get(`/loans/${id}/payments/`);
    return unwrapList(data as unknown[] | { results?: unknown[] });
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les remboursements'));
  }
}

// ─── Création ─────────────────────────────────────────────────────

/** POST /loans/ — payload construit avec toCreateLoanPayload() */
export async function createLoan(payload: CreateLoanPayload): Promise<LoanData> {
  try {
    const { data } = await AxiosInstance.post<LoanApiRaw>('/loans/', payload);
    return mapLoan(data);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de créer la demande de prêt'));
  }
}

// ─── Cycle de vie — une action par transition, jamais PATCH status ──

interface LifecycleResponse {
  status:             LoanStatus;
  detail:             string;
  approval_date?:     string;
  disbursement_date?: string;
}

/** POST /loans/{id}/approve/ — pending → approved */
export async function approveLoan(id: string): Promise<LifecycleResponse> {
  try {
    const { data } = await AxiosInstance.post<LifecycleResponse>(`/loans/${id}/approve/`);
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible d\u2019approuver ce prêt'));
  }
}

/**
 * POST /loans/{id}/reject/ — pending|approved → rejected
 * `reason` est envoyé dès maintenant ; Django l'ignore tant que CS
 * n'a pas ajouté `rejection_reason` au modèle.
 */
export async function rejectLoan(id: string, reason?: string): Promise<LifecycleResponse> {
  try {
    const { data } = await AxiosInstance.post<LifecycleResponse>(
      `/loans/${id}/reject/`,
      reason?.trim() ? { reason: reason.trim() } : undefined,
    );
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de rejeter ce prêt'));
  }
}

/**
 * DELETE /loans/{id}/ — Directeur seulement (vérifié par Django).
 * Contrat : seulement `pending` ou `rejected`, jamais un prêt décaissé.
 */
export async function deleteLoan(id: string): Promise<void> {
  try {
    await AxiosInstance.delete(`/loans/${id}/`);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de supprimer ce prêt'));
  }
}

// ─── Décaissement et remboursement ────────────────────────────────
// ⚠️ Écrits sur le CONTRAT (points 5 et 6), pas encore sur le backend réel.
// L'UI ne les appelle que si FEATURES.loanDisburse / FEATURES.loanRepay
// sont à true — à activer quand CS livre.

/**
 * POST /loans/{id}/disburse/ — approved → active.
 * Contrat : crédite le compte du membre (transaction LOAN_DISBURSEMENT),
 * fixe disbursement_date et due_date. Pas de session caisse.
 */
export async function disburseLoan(id: string): Promise<LifecycleResponse> {
  try {
    const { data } = await AxiosInstance.post<LifecycleResponse>(`/loans/${id}/disburse/`);
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de décaisser ce prêt'));
  }
}

export type RepayMethod = 'cash' | 'account';

export interface RepayResult {
  transaction:       unknown;
  remaining_balance: number | null;
  status:            LoanStatus;
}

/**
 * POST /loans/{id}/repay/ — enregistre un remboursement.
 * - cash    : session caisse ouverte obligatoire (injectée automatiquement)
 * - account : débite le compte du membre, pas de session
 * Le backend refuse un montant supérieur au solde restant et passe le
 * prêt à `paid` quand le solde atteint 0.
 */
export async function repayLoan(
  id: string,
  payload: { amount: number; method: RepayMethod; session?: string },
): Promise<RepayResult> {
  let session = payload.session;
  if (payload.method === 'cash' && !session) {
    const active = await SessionManager.fetchActive();
    if (!active) {
      throw new Error('Ouvrez votre session caisse avant d\u2019encaisser un remboursement en espèces.');
    }
    session = active.id;
  }

  try {
    const { data } = await AxiosInstance.post(`/loans/${id}/repay/`, {
      amount: payload.amount,
      method: payload.method,
      ...(session ? { session } : {}),
    });
    return {
      transaction:       data?.transaction,
      remaining_balance: optNum(data?.remaining_balance),
      status:            data?.status,
    };
  } catch (err) {
    throw new Error(describeError(err, 'Impossible d\u2019enregistrer le remboursement'));
  }
}