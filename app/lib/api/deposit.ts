import AxiosInstance from "../axiosInstance";

// Réponse attendue du backend
export interface CreateDepositResponse {
  id: string;
  reference: string;
  account_id: string;
  amount: number;
  currency: string;
  deposit_type: "cash" | "check" | "transfer" | "other";
  source?: string | null;
  description?: string | null;
  hold_days?: number;
  available_immediately?: number;
  available_on?: string | null;
  new_balance?: number;
  created_at: string;  // ISO UTC
  created_by?: string;
}

export async function createDeposit(payload: any, idemKey?: string) {
  const headers: Record<string,string> = {};
  if (idemKey) headers["Idempotency-Key"] = idemKey;

  const { data } = await AxiosInstance.post<CreateDepositResponse>(
    "/api/deposits/",
    payload,
    { headers }
  );
  return data;
}
