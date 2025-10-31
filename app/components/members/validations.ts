// app/components/members/member.schema.ts
// ============================================
// MEMBER — Types, Zod Schema, Converters & Utils
// ============================================

import { z } from "zod";
import {
  getCitiesByDepartment,
  codeToName,
  HAITI_DEPARTMENTS,
  type DepartmentCode,
} from "@/app/data/haitiLocations";

// --------------------------------------------
// Types
// --------------------------------------------

export type Gender = "M" | "F";

/** API response model (read model) */
export interface MemberData {
  department_code: string | number | readonly string[] | undefined;
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender | string; // tolerate legacy
  date_of_birthday: string; // YYYY-MM-DD
  phone_number: string;
  address: string;
  city: string;
  department: string; // Human name (not code)

  // optional/legacy
  email?: string | null;
  id_number?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  /** Montant initial saisi lors de la création du membre */
  initial_balance?: number | null;

  /** Montant cumulé des dépôts/cotisations si disponible */
  total_amount?: number | null;

  accounts?: Array<{
    id: string;
    account_number: string;
    account_type: "savings" | "checking" | "investment" | "loan" | string;
    balance?: number;
  }>;

  /** Compat retro */
  date_of_birth?: string;
  /** URL or path */
  photo_profil?: string | null;
}


// Branch details interface
export interface BranchDetails {
  id: string;
  branch_name: string;
  branch_code?: string; // ✅ Permet null ET undefined
}

// Post details interface
export interface PostDetails {
  id: string;
  name: string;
  post_name?: string;

}

/** UI form model (what your form edits) */
export type MemberUiForm = z.infer<typeof memberUiSchema>;

/** API create/update payload (exactly what your backend expects per your notes) */
export type MemberApiPayload = {
  first_name: string;
  last_name: string;
  id_number: string;
  phone_number: string;
  department: string; // human name, not code
  city: string;
  address: string;
  gender: Gender;
  date_of_birthday: string; // YYYY-MM-DD
};

// --------------------------------------------
// Zod schema (strict UI validation)
// --------------------------------------------

const DepartmentCodeZ = z.enum(
  HAITI_DEPARTMENTS.map((d) => d.code) as [DepartmentCode, ...DepartmentCode[]]
);
const GenderZ = z.enum(["M", "F"]);
const DateYMDZ = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date au format YYYY-MM-DD");
const PhoneDigitsZ = z
  .string()
  .regex(/^\d+$/, "Le téléphone doit contenir uniquement des chiffres");

// Optional File | string | null schema (no runtime `instanceof File` in Node, so keep UI-friendly)
const PhotoZ = z
  .union([z.instanceof(File), z.string()])
  .optional()
  .nullable();

export const memberUiSchema = z.object({
  first_name: z.string().min(1, "Prénom est requis"),
  last_name: z.string().min(1, "Nom est requis"),
  id_number: z.string().min(1, "Numéro d'identité est requis"),
  phone_number: PhoneDigitsZ,
  department_code: DepartmentCodeZ,
  city: z.string().min(1, "Ville est requise"),
  address: z.string().min(1, "Adresse est requise"),
  gender: GenderZ,
  date_of_birthday: DateYMDZ,

  // purely UI/extra (not sent to API unless you choose)
  email: z.string().email("Email invalide").optional().or(z.literal("")).optional(),
  initial_balance: z.number().nonnegative("Le solde initial ne peut pas être négatif").optional(),
  photo_profil: PhotoZ,
  
});

// --------------------------------------------
// Error mapping (Zod -> flat field errors)
// --------------------------------------------

export type FieldErrors<T> = Partial<Record<Extract<keyof T, string>, string>>;

export function zodToFieldErrors<T>(e: unknown): FieldErrors<T> {
  if (e instanceof z.ZodError) {
    const out: FieldErrors<T> = {};
    for (const err of e.errors) {
      const key = err.path?.[0] as Extract<keyof T, string> | undefined;
      if (key) (out as Record<string, string>)[key] = err.message;
    }
    return out;
  }
  return {};
}

/** Validate and return either data or field errors (no throws) */
export function validateMemberUi(
  raw: unknown
): { data?: MemberUiForm; errors?: FieldErrors<MemberUiForm> } {
  const parsed = memberUiSchema.safeParse(raw);
  if (!parsed.success) return { errors: zodToFieldErrors<MemberUiForm>(parsed.error) };
  return { data: parsed.data };
}

// --------------------------------------------
// Converters (UI ↔ API)
// --------------------------------------------

/** Map department name → code (case-insensitive). Fallbacks to first code if no match. */
export function nameToCode(name?: string | null): DepartmentCode {
  if (!name) return HAITI_DEPARTMENTS[0].code as DepartmentCode;
  const n = name.trim().toLowerCase();
  const found = HAITI_DEPARTMENTS.find((d) => d.name.toLowerCase() === n);
  return (found?.code ?? HAITI_DEPARTMENTS[0].code) as DepartmentCode;
}

/** UI → API JSON payload */
export function toMemberApiPayload(ui: MemberUiForm): MemberApiPayload {
  return {
    first_name: ui.first_name.trim(),
    last_name: ui.last_name.trim(),
    id_number: ui.id_number.trim(),
    phone_number: ui.phone_number.trim(),
    department: codeToName(ui.department_code),
    city: ui.city.trim(),
    address: ui.address.trim(),
    gender: ui.gender,
    date_of_birthday: ui.date_of_birthday,
  };
}

/**
 * UI → API FormData (optional).
 * Your backend currently expects only the core fields; set `includePhoto`
 * to true ONLY if the endpoint supports `photo_profil`.
 */
export function toMemberApiFormData(
  ui: MemberUiForm,
  opts?: { includePhoto?: boolean }
): FormData {
  const payload = toMemberApiPayload(ui);
  const fd = new FormData();

  // required/expected by your API
  Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));

  // optional extras (ONLY if backend supports it)
  if (opts?.includePhoto && ui.photo_profil instanceof File) {
    fd.append("photo_profil", ui.photo_profil);
  }

  return fd;
}

/** API (read model) → UI form model (best effort for legacy fields) */
export function memberDataToUi(member: MemberData): MemberUiForm {
  const dob =
    member.date_of_birthday ??
    member.date_of_birth ?? // legacy fallback
    "";

  return {
    first_name: member.first_name ?? "",
    last_name: member.last_name ?? "",
    id_number: member.id_number ?? "",
    phone_number: (member.phone_number ?? "").replace(/\D/g, ""), // keep digits for UI rule
    department_code: nameToCode(member.department),
    city: member.city ?? "",
    address: member.address ?? "",
    gender: (member.gender === "M" || member.gender === "F" ? member.gender : "F") as Gender, // default
    date_of_birthday: dob,

    // UI-only extras (not used by create payload)
    email: member.email ?? "",
    initial_balance: member.initial_balance ?? undefined,
    photo_profil: member.photo_profil ?? null,
  };
}

// --------------------------------------------
// Nice-to-have display helpers
// --------------------------------------------

export const formatMoney = (v?: number | null) =>
  typeof v === "number"
    ? v.toLocaleString("fr-FR", { style: "currency", currency: "HTG" })
    : "—";

export const accountTypeLabel = (t?: string) => {
  switch (t) {
    case "savings":
      return "Épargne";
    case "checking":
      return "Courant";
    case "investment":
      return "Investissement";
    case "loan":
      return "Prêt";
    default:
      return t || "Compte";
  }
};

export function formatMemberName(m: Pick<MemberData, "first_name" | "last_name"> | Pick<MemberUiForm, "first_name" | "last_name">) {
  return `${m.first_name} ${m.last_name}`.trim();
}

export function getMemberInitials(m: { first_name?: string; last_name?: string }) {
  const f = m.first_name?.[0]?.toUpperCase() ?? "";
  const l = m.last_name?.[0]?.toUpperCase() ?? "";
  return `${f}${l}`;
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

// --------------------------------------------
// Optional: guard city by department in UI flows
// (example helper you can use in your form)
// --------------------------------------------

export function isCityInDepartment(city: string, departmentCode: DepartmentCode) {
  const cities = getCitiesByDepartment(departmentCode) ?? [];
  return cities.some((c) => c.toLowerCase() === city.trim().toLowerCase());
}

export type ErrorMessages<T> = {
  [K in keyof T]?: T[K] extends object 
    ? ErrorMessages<T[K]> | string
    : string;
} & {
  // Add specific error fields that might not be in the main type
  first_name?: string;
  last_name?: string;
  department_code?: string;
};


