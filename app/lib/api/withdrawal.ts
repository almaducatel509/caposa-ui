import AxiosInstance from "@/app/axiosInstance";
import { WithdrawalFormValidated } from "@/validation/transactions/withdrawal";

export interface CreateWithdrawalResponse {
  id: string;
  reference: string;               // ex: WD-2025-0042
  account_id: string;              // compte débité
  amount: number;
  currency: string;
  method: "cash" | "check" | "transfer";
  transfer_type?: "internal" | "interac" | "wire";
  payee_name?: string | null;
  issue_date?: string | null;      // YYYY-MM-DD
  external_recipient?: string | null;
  to_account_id?: string | null;
  reason?: string | null;
  new_balance?: number;            // solde après retrait
  created_at: string;              // ISO UTC
  created_by?: string;
}

function mapToPayload(parsed: WithdrawalFormValidated) {
  return {
    account_id: parsed.idCompte,
    amount: parsed.montantTransaction,
    method: parsed.method,
    reason: parsed.reason ?? null,

    // chèque
    payee_name: parsed.payeeName ?? null,
    issue_date: parsed.issueDate ?? null,
    memo: parsed.memo ?? null,

    // transfert
    transfer_type: parsed.transferType ?? null,
    to_account_id: parsed.toAccountId ?? null,
    external_recipient: parsed.externalRecipient ?? null,

    reference: parsed.reference ?? null, // référence émise côté UI si tu en as une
    code_autorisation: parsed.codeAutorisation, // si attendu côté API
  };
}

export async function createWithdrawal(form: WithdrawalFormValidated, idemKey?: string) {
  const payload = mapToPayload(form);
  const headers: Record<string, string> = {};
  if (idemKey) headers["Idempotency-Key"] = idemKey;

  const { data } = await AxiosInstance.post<CreateWithdrawalResponse>(
    "/api/withdrawals/",
    payload,
    { headers }
  );
  return data;
}
