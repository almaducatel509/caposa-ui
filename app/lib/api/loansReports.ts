/**
 * CAPOSA — types et appels API pour les modules Prêts et Rapports
 * Généré à partir de loans/serializers.py, reports/serializers.py,
 * api/urls.py et reports/urls.py (pull 712c43c).
 *
 * À adapter : remplace `apiFetch` / `getAccessToken` par ton client HTTP existant.
 */

/* ------------------------------------------------------------------ */
/* Types de base                                                       */
/* ------------------------------------------------------------------ */

/** DRF sérialise les DecimalField en string ("1500.00") par défaut. */
export type DecimalString = string;
/** "YYYY-MM-DD" */
export type ISODate = string;
/** ISO 8601 avec heure */
export type ISODateTime = string;
export type UUID = string;

/** Erreurs de validation DRF : chaque champ renvoie une liste de messages. */
export type DRFValidationErrors<K extends string = string> = Partial<
  Record<K | "non_field_errors" | "detail", string[]>
>;

/** Selon la config de pagination DRF (à confirmer dans settings.py). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export type ListResponse<T> = Paginated<T> | T[];

export function unwrapList<T>(res: ListResponse<T>): T[] {
  return Array.isArray(res) ? res : res.results;
}

/* ------------------------------------------------------------------ */
/* Prêts                                                               */
/* ------------------------------------------------------------------ */

export const LOAN_TYPES = {
  commerce: "Commerce",
  agriculture: "Agriculture",
  elevage: "Élevage",
  logement: "Logement",
  equipement: "Équipement",
  scolaire: "Scolaire",
  personnel: "Personnel",
} as const;
export type LoanType = keyof typeof LOAN_TYPES;

export const LOAN_STATUSES = {
  pending: "En attente",
  approved: "Approuvé",
  active: "Actif",
  paid: "Remboursé",
  rejected: "Rejeté",
} as const;
export type LoanStatus = keyof typeof LOAN_STATUSES;

export const PAYMENT_FREQUENCIES = {
  weekly: "Hebdomadaire",
  biweekly: "Bihebdomadaire",
  monthly: "Mensuel",
} as const;
export type PaymentFrequency = keyof typeof PAYMENT_FREQUENCIES;

/** Pour les <select> : [{ value: "commerce", label: "Commerce" }, ...] */
export const toOptions = <T extends Record<string, string>>(m: T) =>
  (Object.entries(m) as [keyof T & string, string][]).map(([value, label]) => ({ value, label }));

export interface Loan {
  id: UUID;
  member: UUID;
  member_id: UUID;
  member_name: string;
  account: UUID;
  account_number: string;
  employee: UUID | null;
  employee_id: UUID | null;
  loan_type: LoanType;
  loan_amount: DecimalString;
  interest_rate: DecimalString;
  /** Durée en mois */
  loan_duration: number;
  payment_frequency: PaymentFrequency;
  /** Échéance finale — calculée par le backend (lecture seule) */
  due_date: ISODate | null;
  guarantor_account: UUID | null;
  guarantor_account_id: UUID | null;
  request_date: ISODate;
  approval_date: ISODate | null;
  disbursement_date: ISODate | null;
  status: LoanStatus;
  /** Rempli par le backend lors d'un rejet (lecture seule) */
  rejection_reason: string | null;
  notes: string | null;

  // Champs calculés — tous en string formatée "0.00"
  total_due: DecimalString;
  installment_amount: DecimalString;
  amount_paid: DecimalString;
  remaining_balance: DecimalString;
  next_due_date: ISODate | null;
  is_late: boolean;
  late_days: number;
  is_overdue: boolean;

  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/** Seuls champs écrivables (POST / PATCH). */
export interface LoanWritePayload {
  member: UUID;
  account: UUID;
  guarantor_account?: UUID | null;
  loan_type: LoanType;
  loan_amount: DecimalString | number;
  interest_rate: DecimalString | number;
  loan_duration: number;
  payment_frequency: PaymentFrequency;
  notes?: string;
}

export type LoanValidationErrors = DRFValidationErrors<keyof LoanWritePayload>;

/**
 * Validation côté client qui reflète LoanSerializer.validate().
 * Le backend reste la source de vérité ; ceci évite juste un aller-retour.
 */
export function validateLoanPayload(
  p: Partial<LoanWritePayload>,
  ctx: { accountOwnerId?: UUID; guarantorOwnerId?: UUID } = {},
): LoanValidationErrors {
  const errors: LoanValidationErrors = {};

  if (p.account && p.member && ctx.accountOwnerId && ctx.accountOwnerId !== p.member) {
    errors.account = ["Le compte sélectionné doit appartenir à l'emprunteur."];
  }
  if (p.guarantor_account) {
    if (p.account && p.guarantor_account === p.account) {
      errors.guarantor_account = [
        "Le compte de garantie ne peut pas être le même que le compte du prêt.",
      ];
    }
    if (p.member && ctx.guarantorOwnerId && ctx.guarantorOwnerId === p.member) {
      errors.guarantor_account = ["Le compte de garantie ne peut pas appartenir à l'emprunteur."];
    }
  }
  if (p.loan_amount !== undefined && Number(p.loan_amount) <= 0) {
    errors.loan_amount = ["Le montant du prêt doit être strictement supérieur à zéro."];
  }
  if (p.interest_rate !== undefined && Number(p.interest_rate) < 0) {
    errors.interest_rate = ["Le taux d'intérêt ne peut pas être négatif."];
  }
  if (p.loan_duration !== undefined && p.loan_duration <= 0) {
    errors.loan_duration = ["La durée du prêt doit être strictement supérieure à zéro."];
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/* Rapports                                                            */
/* ------------------------------------------------------------------ */

export const REPORT_TYPES = {
  liquidite: "Liquidité",
  solvabilite: "Solvabilité",
  endettement: "Endettement",
  conformite: "Conformité",
  prets_souffrance: "Prêts en souffrance",
  mensuel: "Rapport Mensuel Entreprise",
  annuel: "Rapport Annuel Entreprise",
  activite: "Rapport d'Activité",
} as const;
export type ReportType = keyof typeof REPORT_TYPES;

export const REPORT_STATUTS = {
  conforme: "Conforme",
  alerte: "Alerte",
  critique: "Critique",
} as const;
export type ReportStatut = keyof typeof REPORT_STATUTS;

export const REPORT_ETATS = { actif: "Actif", archive: "Archivé" } as const;
export type ReportEtat = keyof typeof REPORT_ETATS;

export const REPORT_PERIODES = { semaine: "Semaine", mois: "Mois", annee: "Année" } as const;
export type ReportPeriode = keyof typeof REPORT_PERIODES;

/**
 * Contenu de Report.snapshot d'après le help_text du modèle
 * ("kpiPrincipal + kpisDetailles + recommandations").
 * Structure interne à confirmer dans reports/services.py.
 */
export interface ReportSnapshot {
  kpiPrincipal?: unknown;
  kpisDetailles?: unknown[];
  recommandations?: unknown[];
  [key: string]: unknown;
}

export interface Report {
  id: UUID;
  type: ReportType;
  periode: ReportPeriode;
  periode_libelle: string;
  date_debut: ISODate | null;
  date_fin: ISODate | null;
  filtres: {
    periode: ReportPeriode;
    dateDebut: ISODate | null;
    dateFin: ISODate | null;
  };
  snapshot: ReportSnapshot;
  statut: ReportStatut;
  etat: ReportEtat;
  reference: string;
  pdf_file: string | null;
  /** Chemin relatif (/media/...) — passer par mediaUrl() */
  pdf_url: string | null;
  genere_par: string | number | null;
  genere_par_info: { id: string | null; nom: string };
  genere_le: ISODateTime;
  updated_at: ISODateTime;
}

export interface AccountStatement {
  id: UUID;
  reference: string;
  account: UUID;
  account_number: string;
  member_name: string | null;
  date_debut: ISODate;
  date_fin: ISODate;
  solde_initial: DecimalString;
  solde_final: DecimalString;
  total_credits: DecimalString;
  total_debits: DecimalString;
  pdf_file: string | null;
  pdf_url: string | null;
  genere_par: string | number | null;
  genere_par_nom: string;
  created_at: ISODateTime;
}

export interface AccountStatementRequest {
  account_number: string;
  /** YYYY-MM-DD (DD/MM/YYYY aussi accepté par le backend) */
  start_date: string;
  end_date: string;
  /** true (défaut) = binaire PDF ; false = JSON avec l'URL */
  download?: boolean;
}

export type EnterpriseReportType = "monthly" | "annual";

export interface EnterpriseReportRequest {
  report_type?: EnterpriseReportType;
  year?: number;
  /** 1–12, requis pour un rapport mensuel */
  month?: number;
  branch_id?: string;
  download?: boolean;
}

/* ------------------------------------------------------------------ */
/* Client HTTP                                                         */
/* ------------------------------------------------------------------ */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// TODO: brancher sur ton store d'auth existant
declare function getAccessToken(): string | null;

export class ApiError<E = DRFValidationErrors> extends Error {
  constructor(public status: number, public body: E) {
    super(`API ${status}`);
  }
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* réponse non JSON */
    }
    throw new ApiError(res.status, body as DRFValidationErrors);
  }
  return res;
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  return (await apiFetch(path, init)).json() as Promise<T>;
}

/** pdf_url est relatif (/media/...) : on le préfixe avec l'hôte de l'API. */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

/* ------------------------------------------------------------------ */
/* Endpoints Prêts                                                     */
/* ------------------------------------------------------------------ */

/** Les actions renvoient leurs erreurs sous la forme { detail, code? }. */
export interface ApiDetailError {
  detail: string;
  /** "NO_ACTIVE_SESSION" quand un caissier rembourse en espèces sans session ouverte */
  code?: "NO_ACTIVE_SESSION" | string;
}

/** TODO: typer d'après transactions/serializers.py (TransactionSerializer) */
export type Transaction = Record<string, unknown> & { id: UUID };

export interface LoanListFilters {
  member?: UUID;
  /** Accepte aussi les alias FR : en_attente, approuve, decaisse, rembourse, rejete */
  status?: LoanStatus;
}

export interface ApproveLoanResponse {
  status: "approved";
  approval_date: ISODate;
  detail: string;
}

export interface RejectLoanResponse {
  status: "rejected";
  rejection_reason: string;
  detail: string;
}

export interface DisburseLoanResponse {
  status: "active";
  disbursement_date: ISODate;
  due_date: ISODate;
  transaction: Transaction;
  detail: string;
}

export type RepayMethod = "cash" | "account";

export interface RepayLoanPayload {
  amount: DecimalString | number;
  /** "cash" exige une session de caisse ouverte ; "account" débite le compte du membre */
  method: RepayMethod;
  /** Optionnel : si absent en "cash", le backend prend la session ouverte du caissier */
  session?: UUID;
  note?: string;
}

export interface RepayLoanResponse {
  transaction: Transaction;
  remaining_balance: DecimalString;
  /** Passe à "paid" quand le solde atteint 0 */
  status: LoanStatus;
}

export const loansApi = {
  list: (filters?: LoanListFilters) => {
    const qs = filters
      ? `?${new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][])}`
      : "";
    return apiJson<ListResponse<Loan>>(`/api/loans/${qs}`);
  },
  get: (id: UUID) => apiJson<Loan>(`/api/loans/${id}/`),
  create: (payload: LoanWritePayload) =>
    apiJson<Loan>("/api/loans/", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: UUID, payload: Partial<LoanWritePayload>) =>
    apiJson<Loan>(`/api/loans/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  /** Directeur / admin uniquement (403 sinon) */
  remove: (id: UUID) => apiFetch(`/api/loans/${id}/`, { method: "DELETE" }),

  /** Historique des remboursements (LOAN_REPAYMENT) */
  payments: (id: UUID) => apiJson<Transaction[]>(`/api/loans/${id}/payments/`),

  /** pending → approved. Superviseur, directeur, admin (CanApproveLoans). */
  approve: (id: UUID) =>
    apiJson<ApproveLoanResponse>(`/api/loans/${id}/approve/`, { method: "POST" }),

  /**
   * pending | approved → rejected. Motif obligatoire.
   * Le backend accepte `rejection_reason` (clé officielle) et `reason` ;
   * on envoie `reason` qui marche aussi sur les versions antérieures.
   */
  reject: (id: UUID, reason: string) =>
    apiJson<RejectLoanResponse>(`/api/loans/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  /** approved → active. Caissier / superviseur. Crédite le compte et fixe due_date. */
  disburse: (id: UUID) =>
    apiJson<DisburseLoanResponse>(`/api/loans/${id}/disburse/`, { method: "POST" }),

  /** Remboursement d'un prêt actif. Refusé si amount > remaining_balance. */
  repay: (id: UUID, payload: RepayLoanPayload) =>
    apiJson<RepayLoanResponse>(`/api/loans/${id}/repay/`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

/** Actions disponibles selon le statut — pour afficher/masquer les boutons. */
export const LOAN_ACTIONS_BY_STATUS: Record<
  LoanStatus,
  ("approve" | "reject" | "disburse" | "repay")[]
> = {
  pending: ["approve", "reject"],
  approved: ["disburse", "reject"],
  active: ["repay"],
  paid: [],
  rejected: [],
};

/* ------------------------------------------------------------------ */
/* Endpoints Rapports                                                  */
/* ------------------------------------------------------------------ */

export interface PdfDownload {
  blob: Blob;
  filename: string;
}

function filenameFromResponse(res: Response, fallback: string): string {
  const cd = res.headers.get("Content-Disposition") ?? "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
  return match ? decodeURIComponent(match[1]) : fallback;
}

async function postPdf(path: string, body: object, fallbackName: string): Promise<PdfDownload> {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { Accept: "application/pdf" },
    body: JSON.stringify({ ...body, download: true }),
  });
  return { blob: await res.blob(), filename: filenameFromResponse(res, fallbackName) };
}

/** Réponse JSON quand download=false (HTTP 201). */
export interface PdfGeneratedResponse {
  status: "success";
  message: string;
  /** id du Report ou de l'AccountStatement créé → downloadReportById / getStatement */
  id: UUID;
  /** Rapports : version suffixée si le mois est regénéré (RAP-M-2026-10-02, -03…) */
  reference: string;
  filename: string;
  /** Chemin /media/... — préférer les endpoints download authentifiés */
  file_url: string;
  data: PdfGeneratedData;
}

/**
 * Contenu de `data` observé sur un rapport mensuel (RAP-M-2026-10).
 * Le relevé de compte peut renvoyer des champs supplémentaires (soldes, totaux…).
 */
export interface PdfGeneratedData {
  id: UUID;
  filename: string;
  file_url: string;
  reference: string;
  /** Rapport d'entreprise : libellé lisible, ex. "Octobre 2026" */
  periode?: string;

  // Relevé de compte uniquement (vérifié : strings "23.00", comme le reste de l'API)
  solde_initial?: DecimalString;
  solde_final?: DecimalString;
  total_credits?: DecimalString;
  total_debits?: DecimalString;
  transactions_count?: number;

  [key: string]: unknown;
}

export interface ReportListFilters {
  type?: ReportType;
  statut?: ReportStatut;
  etat?: ReportEtat;
}

async function getPdf(path: string, fallbackName: string): Promise<PdfDownload> {
  const res = await apiFetch(path, { headers: { Accept: "application/pdf" } });
  return { blob: await res.blob(), filename: filenameFromResponse(res, fallbackName) };
}

export const reportsApi = {
  // CRUD (router DRF)
  list: (filters?: ReportListFilters) => {
    const qs = filters
      ? `?${new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][])}`
      : "";
    return apiJson<ListResponse<Report>>(`/api/reports/${qs}`);
  },
  get: (id: UUID) => apiJson<Report>(`/api/reports/${id}/`),
  /** Directeur / admin uniquement (403 sinon) */
  remove: (id: UUID) => apiFetch(`/api/reports/${id}/`, { method: "DELETE" }),
  /** Re-télécharger le PDF d'un rapport existant (authentifié, marche aussi en prod) */
  downloadReportById: (id: UUID) => getPdf(`/api/reports/${id}/download-pdf/`, `rapport_${id}.pdf`),

  /** Filtre partiel (icontains) sur le numéro de compte */
  listStatements: (accountNumber?: string) =>
    apiJson<ListResponse<AccountStatement>>(
      `/api/account-statements/${accountNumber ? `?account_number=${encodeURIComponent(accountNumber)}` : ""}`,
    ),
  getStatement: (id: UUID) => apiJson<AccountStatement>(`/api/account-statements/${id}/`),
  /** Re-télécharger un relevé déjà généré */
  downloadStatementById: (id: UUID) =>
    getPdf(`/api/account-statements/${id}/download/`, `releve_${id}.pdf`),

  // Relevé de compte
  downloadAccountStatement: (req: Omit<AccountStatementRequest, "download">) =>
    postPdf(
      "/api/reports/account-statement/pdf/",
      req,
      `releve_${req.account_number}_${req.start_date}_${req.end_date}.pdf`,
    ),
  generateAccountStatement: <T = PdfGeneratedResponse>(req: Omit<AccountStatementRequest, "download">) =>
    apiJson<T>("/api/reports/account-statement/pdf/", {
      method: "POST",
      body: JSON.stringify({ ...req, download: false }),
    }),

  // Rapport d'entreprise (mensuel / annuel)
  downloadEnterpriseReport: (req: Omit<EnterpriseReportRequest, "download">) =>
    postPdf(
      "/api/reports/enterprise/pdf/",
      req,
      `rapport_${req.report_type ?? "monthly"}_${req.year ?? ""}${req.month ? `-${req.month}` : ""}.pdf`,
    ),
  generateEnterpriseReport: <T = PdfGeneratedResponse>(req: Omit<EnterpriseReportRequest, "download">) =>
    apiJson<T>("/api/reports/enterprise/pdf/", {
      method: "POST",
      body: JSON.stringify({ ...req, download: false }),
    }),
};

/** Déclenche le téléchargement navigateur d'un PDF reçu en blob. */
export function saveBlob({ blob, filename }: PdfDownload): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Ouvre le PDF dans un nouvel onglet (aperçu) au lieu de le télécharger. */
export function previewBlob({ blob }: PdfDownload): void {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}