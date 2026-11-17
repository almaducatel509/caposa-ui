// app/lib/api/members.ts
import AxiosInstance from "@/app/lib/axiosInstance";
import type { MemberData } from "@/app/components/members/validations";

export type TxType   = 'depot' | 'retrait' | 'transfert' | 'remboursement' | 'decaissement' | 'interet' | 'frais' | string;
export type TxStatus = 'completed' | 'pending' | 'cancelled';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  description: string;
  date: string;
  status: TxStatus;
  createdBy: string;
}

function mapApiMember(m: any): MemberData {
  let status: MemberData['status'] = 'inactif';
  if (m.status === true || m.status === 'true' || m.status === 'active' || m.status === 'actif') {
    status = 'actif';
  } else if (m.status === 'suspendu' || m.status === 'suspended') {
    status = 'suspendu';
  }

  return {
    ...m,
    status,
    id_member:        m.id_member ?? m.id ?? '',
    photo_profil:     m.photo_profil ?? m.photo_url ?? null,
    date_of_birthday: m.date_of_birthday ?? m.date_of_birth ?? '',
    department_code:  m.department_code ?? undefined,
  };
}
 
export const fetchMembers = async (): Promise<MemberData[]> => {
  try {
    const response = await AxiosInstance.get("/members/");
    return (response.data as any[]).map(mapApiMember);
  } catch (e) {
    console.error("Erreur récupération membres:", e);
    return [];
  }
};

export const fetchMemberAccounts = async (memberId: string): Promise<any[]> => {
  try {
    const response = await AxiosInstance.get(`/members/${memberId}/accounts/`);
    const data = response.data;
    const list = Array.isArray(data) ? data : data?.results ?? [];
    if (list.length > 0) return list;

    // Fallback via endpoint global accounts
    const fallback = await AxiosInstance.get('/accounts/', { params: { member: memberId } });
    const rawFallback = Array.isArray(fallback.data) ? fallback.data : fallback.data?.results ?? [];
    return rawFallback.filter((a: any) => String(a.member) === String(memberId));
  } catch (e) {
    console.error("Erreur récupération comptes:", e);
    return [];
  }
};

function mapApiTransaction(t: any): Transaction {
  let txType = String(t.type ?? t.transaction_type ?? 'depot').toLowerCase();
  if (txType === 'deposit') txType = 'depot';
  if (txType === 'withdrawal') txType = 'retrait';
  if (txType === 'transfer') txType = 'transfert';
  if (txType === 'loan_repayment') txType = 'remboursement';
  if (txType === 'loan_disbursement') txType = 'decaissement';

  const desc = t.description ?? t.note ?? t.reason ?? t.transaction_type_display ?? t.reference ?? 'Transaction';
  const createdBy = t.created_by_name ?? t.created_by_username ?? t.created_by ?? t.createdBy ?? t.agent ?? 'Système';

  return {
    id:          String(t.id ?? t.id_transaction ?? ''),
    type:        txType as TxType,
    amount:      Number(t.amount ?? t.montant ?? 0),
    description: desc,
    date:        t.date ?? t.created_at ?? t.date_transaction ?? '',
    status:      t.status ?? 'completed',
    createdBy:   String(createdBy),
  };
}

/** LIST — historique des transactions d'un compte */
export const fetchAccountTransactions = async (accountId: string | number): Promise<Transaction[]> => {
  try {
    const response = await AxiosInstance.get(`/transactions/`, {
      params: { account_id: accountId },
    });
    const raw = (response.data as any)?.results ?? response.data;
    return (raw as any[]).map(mapApiTransaction);
  } catch (e) {
    console.error("❌ Erreur récupération transactions:", e);
    return [];
  }
};

/** LIST — toutes les transactions d'un membre */
export const fetchMemberTransactions = async (memberId: string): Promise<Transaction[]> => {
  try {
    const response = await AxiosInstance.get(`/members/${memberId}/transactions/`);
    const raw = (response.data as any)?.results ?? response.data;
    return (raw as any[]).map(mapApiTransaction);
  } catch (e) {
    console.error("❌ Erreur récupération transactions membre:", e);
    return [];
  }
};

function parseApiError(error: any, fallback = "Une erreur est survenue.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data) {
    try { return JSON.stringify(error.response.data); } catch {}
  }
  return fallback;
}

/** CREATE — multipart (photo supported) */
export const createMember = async (fd: FormData) => {
  try {
    const { data } = await AxiosInstance.post("/members/", fd);
    return data;
  } catch (error: any) {
    console.error("❌ Create member error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw new Error(parseApiError(error, "Impossible de créer le membre."));
  }
};

/** UPDATE — multipart (photo supported). Use PATCH or PUT per your API */
export const updateMember = async (id: string | number, fd: FormData) => {
  try {
    const { data } = await AxiosInstance.patch(`/members/${id}/`, fd);
    return data;
  } catch (error: any) {
    console.error("❌ Update member error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw new Error(parseApiError(error, "Impossible de mettre à jour le membre."));
  }
};

export const deleteMember = async (id: string) => {
  try {
    const { data } = await AxiosInstance.delete(`/members/${id}/`);
    return data;
  } catch (error: any) {
    console.error("❌ Delete member error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw new Error(parseApiError(error, "Impossible de supprimer le membre."));
  }
};
