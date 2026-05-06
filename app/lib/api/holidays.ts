// app/lib/api/holidays.ts
import AxiosInstance from "@/app/lib/axiosInstance";
import type { HolidayData, HolidayScope } from "@/app/components/holidays/validations";

// ─────────────────────────────────────────────────────────────────────────────
// Module dédié aux appels API holidays.
// Avant : tout était mélangé dans /api/branche.ts. Maintenant les appels
// holidays vivent ici, séparés et typés correctement.
//
// Le contrat backend correspondant est décrit dans note_holiday_backend.md.
// ─────────────────────────────────────────────────────────────────────────────

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

// ─── Mapper API → HolidayData ────────────────────────────────────────────────
// Garantit qu'on a TOUS les champs (avec défauts pour les anciens enregistrements).
function mapHoliday(item: any): HolidayData {
  return {
    id: item.id,
    date: item.date,
    description: item.description ?? "",
    type: item.type ?? "autre",
    scope: item.scope ?? "autre",
    department_code: item.department_code ?? undefined,
    branch_code: item.branch_code ?? undefined, // legacy, certaines données peuvent l'avoir
    comment: item.comment ?? "",
    modified_by: item.modified_by ?? "",
    pending_assignment: item.pending_assignment ?? true,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

// ─── READ ────────────────────────────────────────────────────────────────────

export const fetchHolidays = async (): Promise<HolidayData[]> => {
  try {
    const { data } = await AxiosInstance.get("/holidays/");
    return (data ?? []).map(mapHoliday);
  } catch (e) {
    console.error("Erreur fetchHolidays:", e);
    return [];
  }
};

export const fetchHolidayById = async (id: string): Promise<HolidayData | null> => {
  try {
    const { data } = await AxiosInstance.get(`/holidays/${id}/`);
    return data ? mapHoliday(data) : null;
  } catch (e) {
    console.error("Erreur fetchHolidayById:", e);
    return null;
  }
};

/**
 * Récupère les UUIDs des branches assignées à un férié.
 * Le backend doit inclure `branch_ids` dans la réponse de fetchHolidays/fetchHolidayById.
 * Cette fonction est un fallback si on a juste un id et besoin de la liste M2M.
 */
export const fetchHolidayBranchIds = async (id: string): Promise<string[]> => {
  try {
    const { data } = await AxiosInstance.get(`/holidays/${id}/`);
    return data?.branch_ids ?? [];
  } catch (e) {
    console.error("Erreur fetchHolidayBranchIds:", e);
    return [];
  }
};

// ─── WRITE ───────────────────────────────────────────────────────────────────

export const createHoliday = async (payload: Partial<HolidayData>): Promise<HolidayData> => {
  try {
    const { data } = await AxiosInstance.post("/holidays/", payload);
    return mapHoliday(data);
  } catch (e: any) {
    console.error("❌ Erreur createHoliday:", e?.response?.data);
    throw new Error(parseApiError(e, "Impossible de créer le jour férié."));
  }
};

export const updateHoliday = async (
  id: string,
  payload: Partial<HolidayData>
): Promise<HolidayData> => {
  try {
    const { data } = await AxiosInstance.patch(`/holidays/${id}/`, payload);
    return mapHoliday(data);
  } catch (e: any) {
    console.error("❌ Erreur updateHoliday:", e?.response?.data);
    throw new Error(parseApiError(e, "Impossible de mettre à jour le jour férié."));
  }
};

export const deleteHoliday = async (id: string): Promise<void> => {
  try {
    await AxiosInstance.delete(`/holidays/${id}/`);
  } catch (e: any) {
    console.error("❌ Erreur deleteHoliday:", e?.response?.data);
    throw new Error(parseApiError(e, "Impossible de supprimer le jour férié."));
  }
};

// ─── ASSIGNATION (le cœur du modal) ──────────────────────────────────────────

export interface AssignHolidayPayload {
  scope: HolidayScope;
  /** Obligatoire si scope='regional'. Ignoré sinon. */
  department_code?: string;
  /**
   * Liste des UUIDs de branches.
   * - Pour scope='branch' ou 'autre' : OBLIGATOIRE (ce que l'admin a coché).
   * - Pour scope='national' ou 'regional' : envoyé quand même par sécurité,
   *   mais le backend doit l'ignorer et déduire les branches du scope.
   */
  branch_ids: string[];
  /** Raison saisie par l'admin (audit). */
  comment?: string;
}

/**
 * Assigne un férié à des branches selon le scope choisi.
 *
 * Logique côté backend (voir note_holiday_backend.md) :
 *   - national → backend lie à TOUTES les branches (ignore branch_ids du payload)
 *   - regional → backend lie aux branches du department_code (ignore branch_ids)
 *   - branch / autre → backend utilise branch_ids tel quel
 *
 * Dans tous les cas, le backend met pending_assignment=false.
 */
export const assignHolidayToBranches = async (
  holidayId: string,
  payload: AssignHolidayPayload
): Promise<HolidayData> => {
  const body = {
    scope: payload.scope,
    department_code: payload.scope === "regional" ? payload.department_code : null,
    branch_ids: payload.branch_ids,
    pending_assignment: false,
    comment: payload.comment ?? "",
  };

  try {
    const { data } = await AxiosInstance.patch(`/holidays/${holidayId}/`, body);
    return mapHoliday(data);
  } catch (e: any) {
    console.error("❌ Erreur assignHolidayToBranches:", e?.response?.data);
    throw new Error(parseApiError(e, "Impossible d'assigner le jour férié."));
  }
};