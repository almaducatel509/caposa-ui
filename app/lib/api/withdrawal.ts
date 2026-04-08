import AxiosInstance from "../axiosInstance";               // ✅ chemin relatif
// import { WithdrawalFormValidated } from "../../validation/transactions/withdrawal";

// ─── Ce que l'API retourne (GET /withdrawals/) ──────────────────────────────
export interface WithdrawalAPIResponse {
  id:                string | number;
  reference?:        string;
  account_id:        string;
  amount:            number;
  currency?:         string;
  method:            "cash" | "check" | "transfer";
  transfer_type?:    "internal" | "interac" | "wire" | null;
  status:            string;           // ex: "pending", "completed", "failed"
  reason?:           string | null;
  payee_name?:       string | null;
  issue_date?:       string | null;
  external_recipient?: string | null;
  to_account_id?:    string | null;
  new_balance?:      number;
  created_at:        string;
  created_by?:       string;
  member_name?:      string;
  processed_by?:     string;
  validated_by?:     string;
  caisse_numero?:    string;
  caisse_id?:        string;
  session_id?:       string;
}

// ─── Ce que le dashboard consomme ───────────────────────────────────────────
export interface WithdrawalData {
  id:                   number;
  idCompte:             string;
  codeAutorisation:     string;
  montantTransaction:   number;
  withdrawalSubtype:    "counter" | "check" | "loan_disbursement" | "other";
  motif:                string;
  description?:         string;
  requiresVerification: boolean;
  status:               "decaisse" | "en_attente" | "en_cours" | "echoue" | "annule";
  created_at:           string;
  member_name:          string;
  processed_by:         string;
  validated_by:         string;
  caisse_numero:        string;
  caisse_id:            string;
  session_id:           string;
}

// ─── Mapper method → withdrawalSubtype ──────────────────────────────────────
function mapSubtype(method: string, transferType?: string | null): WithdrawalData["withdrawalSubtype"] {
  if (method === "check")    return "check";
  if (method === "transfer") return transferType === "wire" ? "loan_disbursement" : "other";
  if (method === "cash")     return "counter";
  return "other";
}

// ─── Mapper status API → status dashboard ───────────────────────────────────
function mapStatus(status: string): WithdrawalData["status"] {
  const map: Record<string, WithdrawalData["status"]> = {
    completed:  "decaisse",
    done:       "decaisse",
    decaisse:   "decaisse",
    pending:    "en_attente",
    en_attente: "en_attente",
    processing: "en_cours",
    en_cours:   "en_cours",
    failed:     "echoue",
    echoue:     "echoue",
    cancelled:  "annule",
    canceled:   "annule",
    annule:     "annule",
  };
  return map[status?.toLowerCase()] ?? "en_attente"; // fallback safe
}

// ─── Mapper principal ────────────────────────────────────────────────────────
export function mapApiToWithdrawal(w: WithdrawalAPIResponse): WithdrawalData {
  return {
    id:                   Number(w.id),
    idCompte:             w.account_id,
    codeAutorisation:     w.reference ?? `WD-${w.id}`,
    montantTransaction:   w.amount,
    withdrawalSubtype:    mapSubtype(w.method, w.transfer_type),
    motif:                w.reason ?? "—",
    requiresVerification: w.amount > 50000 || w.method === "check",
    status:               mapStatus(w.status),
    created_at:           w.created_at,
    member_name:          w.member_name ?? w.created_by ?? "Inconnu",
    processed_by:         w.processed_by ?? "—",
    validated_by:         w.validated_by ?? "—",
    caisse_numero:        w.caisse_numero ?? "—",
    caisse_id:            w.caisse_id ?? "—",
    session_id:           w.session_id ?? "—",
  };
}

// ─── API calls ───────────────────────────────────────────────────────────────
export const fetchWithdrawals = async (): Promise<WithdrawalData[]> => {
  try {
    const { data } = await AxiosInstance.get<WithdrawalAPIResponse[]>("withdrawals/");
    return data.map(mapApiToWithdrawal);
  } catch (error) {
    console.error("Erreur fetchWithdrawals:", error);
    return [];
  }
};

export const fetchWithdrawalsByAccount = async (accountId: string): Promise<WithdrawalData[]> => {
  try {
    const { data } = await AxiosInstance.get<WithdrawalAPIResponse[]>(`accounts/${accountId}/withdrawals/`);
    return data.map(mapApiToWithdrawal);
  } catch (error) {
    console.error(`Erreur withdrawals compte ${accountId}:`, error);
    return [];
  }
};