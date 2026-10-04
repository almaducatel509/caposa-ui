// app/lib/api/holidays.ts
import AxiosInstance from "@/app/lib/axiosInstance";
import {
  holidayCreateSchema,
  holidayUpdateSchema,
  type HolidayData,
  type HolidayFormData,
} from "@/app/components/holidays/validations";

function parseApiError(error: any, fallback = "Une erreur est survenue.") {
  if (error?.response?.status === 404) {
    return "Endpoint indisponible (route backend manquante).";
  }
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data && typeof error.response.data === "object") {
    try { return JSON.stringify(error.response.data); } catch {}
  }
  return fallback;
}

const enrichOne  = (h: any): HolidayData => h as HolidayData;
const enrichMany = (arr: any[]): HolidayData[] => (arr ?? []).map(enrichOne);

// ─── READ ────────────────────────────────────────────────────────────────────

export const fetchHolidays = async (): Promise<HolidayData[]> => {
  try {
    const { data } = await AxiosInstance.get("/holidays/");
    return enrichMany(data);
  } catch (e) {
    console.error("Erreur récupération jours fériés:", e);
    throw new Error(parseApiError(e, "Impossible de charger les jours fériés."));
  }
};

export const fetchHolidayById = async (id: string): Promise<HolidayData | null> => {
  try {
    const { data } = await AxiosInstance.get(`/holidays/${id}/`);
    return data ? enrichOne(data) : null;
  } catch (e) {
    console.error("Erreur fetchHolidayById:", e);
    return null;
  }
};

// ─── WRITE ───────────────────────────────────────────────────────────────────

export const createHoliday = async (input: HolidayFormData): Promise<HolidayData> => {
  const parsed = holidayCreateSchema.safeParse(input);
  if (!parsed.success) throw parsed.error;

  try {
    const { data } = await AxiosInstance.post("/holidays/", parsed.data);
    return enrichOne(data);
  } catch (e: any) {
    console.error("Erreur création jour férié:", e?.response?.data);
    throw new Error(parseApiError(e, "Impossible de créer le jour férié."));
  }
};

export const updateHoliday = async (
  id: string,
  payload: Partial<HolidayFormData> & { reason?: string }
): Promise<HolidayData> => {
  try {
    const { data } = await AxiosInstance.patch(`/holidays/${id}/`, payload);
    return enrichOne(data);
  } catch (e: any) {
    console.error("Erreur updateHoliday:", e);
    throw new Error(parseApiError(e, "Impossible de modifier le jour férié."));
  }
};

export const deleteHoliday = async (id: string): Promise<void> => {
  try {
    await AxiosInstance.delete(`/holidays/${id}/`);
  } catch (e: any) {
    console.error("Erreur deleteHoliday:", e);
    throw new Error(parseApiError(e, "Impossible de supprimer le jour férié."));
  }
};

// ─── BranchHoliday (observance par branche) ─────────────────────────────────
export const toggleBranchObservance = async (
  branchId: string,
  holidayId: string,
  payload: { is_observed: boolean; reason: string }
): Promise<void> => {
  try {
    await AxiosInstance.post(`/branches/${branchId}/assign-holidays/`, {
      holidays: [
        {
          holiday_id: holidayId,
          is_observed: payload.is_observed,
          reason: payload.reason,
        },
      ],
    });
  } catch (e: any) {
    console.error("Erreur toggleBranchObservance:", e);
    throw new Error(parseApiError(e, "Impossible de mettre à jour l'observance."));
  }
};


// ─── Assignation aux branches ────────────────────────────────────────────────
export interface AssignHolidayPayload {
  scope: "national" | "regional" | "branch" | "autre";
  department_code?: string;
  branch_ids: string[];
  comment?: string;
  type?: HolidayFormData["type"];
}
/**
 * Applique un férié à plusieurs branches en appelant l'action branche-centrique
 * de CS (POST /branches/{branchId}/assign-holidays/) une fois par branche ciblée.
 * Pas de vrai endpoint bulk côté holiday — on boucle plutôt que d'en redemander un.
 */
export const assignHolidayToBranches = async (
  holidayId: string,
  payload: AssignHolidayPayload
): Promise<void> => {
  try {
    await Promise.all(
      payload.branch_ids.map((branchId) =>
        AxiosInstance.post(`/branches/${branchId}/assign-holidays/`, {
          holidays: [
            {
              holiday_id: holidayId,
              is_observed: true,
              reason: payload.comment || "",
            },
          ],
        })
      )
    );
  } catch (e: any) {
    console.error("Erreur assignHolidayToBranches:", e);
    throw new Error(parseApiError(e, "Impossible d'assigner le jour férié aux branches."));
  }
};