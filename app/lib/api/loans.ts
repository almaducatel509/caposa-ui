/**
 * loans.ts  —  API layer prêts
 * ─────────────────────────────────────────────────────────────────
 * Emplacement : app/lib/api/loans.ts
 *
 * Appels HTTP uniquement. Types, libellés et validation : loanSchema.ts.
 * Même règle que caisse.ts : aucun mock, aucun fallback silencieux.
 *
 * Aligné sur caposa-api master @ 53e4c51 (vérifié en local le 2026-10-28) :
 *  - approve / reject / disburse / repay livrés et testés
 *  - champs calculés (total_due, remaining_balance, is_late…) livrés
 *  - montant, taux, durée, fréquence, type, compte, membre et garant
 *    verrouillés par Django dès que le prêt n'est plus `pending`
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
  /** Durée en mois */
  loan_duration:      number;
  payment_frequency:  PaymentFrequency;
  guarantor_account:  string | null;
  notes:              string | null;
  status:             LoanStatus;
  request_date:       string;
  approval_date:      string | null;
  disbursement_date:  string | null;
  /** Échéance finale — fixée par Django au décaissement */
  due_date:           string | null;
  created_at:         string;
  updated_at:         string;
  rejection_reason:   string | null;
  // Champs calculés par Django (toujours présents, strings "0.00")
  total_due:          Decimal;
  installment_amount: Decimal;
  amount_paid:        Decimal;
  remaining_balance:  Decimal;
  /** Basé sur ⌊amount_paid / installment_amount⌋ : un paiement partiel n'avance pas l'échéance */
  next_due_date:      string | null;
  is_late:            boolean;
  late_days:          number;
  /** Échéance courante OU échéance finale dépassée */
  is_overdue:         boolean;
  /** N'existe pas côté Django — gardé pour compatibilité avec LoanData */
  closed_at?:         string | null;
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
  // TODO: ajouter `is_overdue: boolean | null` à LoanData dans loanSchema.ts
  // puis décommenter :
  // is_overdue:      typeof r.is_overdue === 'boolean' ? r.is_overdue : null,
});

const unwrapList = <T,>(data: T[] | { results?: T[] }): T[] =>
  Array.isArray(data) ? data : data?.results ?? [];

// ─── Règles d'édition (miroir de LoanSerializer.validate) ─────────

/**
 * Champs que Django refuse de modifier dès que le prêt n'est plus `pending`.
 * L'UI doit les afficher en lecture seule ; seul `notes` reste éditable.
 */
export const LOCKED_AFTER_PENDING = [
  'loan_amount',
  'interest_rate',
  'loan_duration',
  'payment_frequency',
  'loan_type',
  'account',
  'member',
  'guarantor_account',
] as const;

export const isLoanEditable = (status: LoanStatus): boolean => status === 'pending';

/** Boutons d'action à afficher selon le statut (les permissions restent vérifiées par Django). */
export type LoanAction = 'approve' | 'reject' | 'disburse' | 'repay';

export const LOAN_ACTIONS_BY_STATUS: Record<LoanStatus, LoanAction[]> = {
  pending:  ['approve', 'reject'],
  approved: ['disburse', 'reject'],
  active:   ['repay'],
  paid:     [],
  rejected: [],
};

// ─── Lecture ──────────────────────────────────────────────────────

/**
 * GET /loans/ — filtres optionnels ?member= et ?status=
 * (Django accepte aussi les alias FR : en_attente, approuve, decaisse, rembourse, rejete)
 */
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

/**
 * GET /loans/{id}/payments/ — remboursements du prêt (transactions LOAN_REPAYMENT).
 * TODO: typer avec le type Transaction existant du module transactions.
 */
export async function fetchLoanPayments(id: string): Promise<unknown[]> {
  try {
    const { data } = await AxiosInstance.get(`/loans/${id}/payments/`);
    return unwrapList(data as unknown[] | { results?: unknown[] });
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de charger les remboursements'));
  }
}

// ─── Création et modification ─────────────────────────────────────

/** POST /loans/ — payload construit avec toCreateLoanPayload() */
export async function createLoan(payload: CreateLoanPayload): Promise<LoanData> {
  try {
    const { data } = await AxiosInstance.post<LoanApiRaw>('/loans/', payload);
    return mapLoan(data);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de créer la demande de prêt'));
  }
}

/**
 * PATCH /loans/{id}/ — modification d'une demande.
 * Prêt `pending` : tous les champs du formulaire.
 * Sinon : seulement `notes` (Django renvoie 400 sur les champs verrouillés).
 */
export async function updateLoan(
  id: string,
  payload: Partial<CreateLoanPayload> & { notes?: string | null },
): Promise<LoanData> {
  try {
    const { data } = await AxiosInstance.patch<LoanApiRaw>(`/loans/${id}/`, payload);
    return mapLoan(data);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de modifier ce prêt'));
  }
}

// ─── Cycle de vie — une action par transition, jamais PATCH status ──

interface LifecycleResponse {
  status:             LoanStatus;
  detail:             string;
  approval_date?:     string;
  disbursement_date?: string;
  /** Renvoyée par disburse */
  due_date?:          string;
  /** Renvoyée par reject */
  rejection_reason?:  string;
  /** Renvoyée par disburse (transaction LOAN_DISBURSEMENT) */
  transaction?:       unknown;
}

/** POST /loans/{id}/approve/ — pending → approved. Superviseur, directeur, admin. */
export async function approveLoan(id: string): Promise<LifecycleResponse> {
  try {
    const { data } = await AxiosInstance.post<LifecycleResponse>(`/loans/${id}/approve/`);
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible d’approuver ce prêt'));
  }
}

/**
 * POST /loans/{id}/reject/ — pending|approved → rejected. Superviseur, directeur, admin.
 * Le motif est OBLIGATOIRE : Django renvoie 400 s'il est vide.
 */
export async function rejectLoan(id: string, reason: string): Promise<LifecycleResponse> {
  const motif = reason.trim();
  if (!motif) {
    throw new Error('Le motif du rejet est obligatoire.');
  }
  try {
    const { data } = await AxiosInstance.post<LifecycleResponse>(
      `/loans/${id}/reject/`,
      { rejection_reason: motif },
    );
    return data;
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de rejeter ce prêt'));
  }
}

/**
 * DELETE /loans/{id}/ — Directeur / admin seulement (vérifié par Django).
 * ⚠️ Django ne vérifie PAS le statut : c'est l'UI qui doit n'offrir
 * la suppression que pour `pending` ou `rejected`. Garde-fou ici aussi.
 */
export async function deleteLoan(id: string, status: LoanStatus): Promise<void> {
  if (status !== 'pending' && status !== 'rejected') {
    throw new Error('Seuls les prêts en attente ou rejetés peuvent être supprimés.');
  }
  try {
    await AxiosInstance.delete(`/loans/${id}/`);
  } catch (err) {
    throw new Error(describeError(err, 'Impossible de supprimer ce prêt'));
  }
}

// ─── Décaissement et remboursement ────────────────────────────────
// Livrés et testés côté Django : passer FEATURES.loanDisburse et
// FEATURES.loanRepay à true dans lib/features.ts.

/**
 * POST /loans/{id}/disburse/ — approved → active. Caissier, superviseur, admin.
 * Crédite le compte du membre (transaction LOAN_DISBURSEMENT),
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
 * POST /loans/{id}/repay/ — enregistre un remboursement. Caissier, superviseur, admin.
 * - cash    : session caisse ouverte obligatoire (injectée automatiquement)
 * - account : débite le compte du membre (refusé si fonds insuffisants ou compte gelé/fermé)
 * Les paiements partiels sont acceptés mais n'avancent pas l'échéance.
 * Django refuse un montant supérieur au solde restant et passe le
 * prêt à `paid` quand le solde atteint 0.
 */
export async function repayLoan(
  id: string,
  payload: { amount: number; method: RepayMethod; session?: string; note?: string },
): Promise<RepayResult> {
  let session = payload.session;
  if (payload.method === 'cash' && !session) {
    const active = await SessionManager.fetchActive();
    if (!active) {
      throw new Error('Ouvrez votre session caisse avant d’encaisser un remboursement en espèces.');
    }
    session = active.id;
  }

  try {
    const { data } = await AxiosInstance.post(`/loans/${id}/repay/`, {
      amount: payload.amount.toFixed(2),
      method: payload.method,
      ...(session ? { session } : {}),
      ...(payload.note?.trim() ? { note: payload.note.trim() } : {}),
    });
    return {
      transaction:       data?.transaction,
      remaining_balance: optNum(data?.remaining_balance),
      status:            data?.status,
    };
  } catch (err) {
    throw new Error(describeError(err, 'Impossible d’enregistrer le remboursement'));
  }
}