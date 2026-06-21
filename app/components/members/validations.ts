// app/components/members/validations.ts
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

// ─── Types ────────────────────────────────────────────────────────────────────

export type Gender = "M" | "F";

export interface MemberOption {
  id:            string;
  member_name:   string;
  id_number:     string;
  phone_number?: string;
}

export interface MemberData {
  member_number:    string;
  account_number:   string;
  member_details:   any;
  typeCompte:       string;
  soldeActuel:      number;
  statutCompte:     any;
  statutMember:     any;
  dateOuverture:    string;
  status:           "actif" | "inactif" | "suspendu";
  id:               string;
  id_member:        string;
  first_name:       string;
  last_name:        string;
  gender:           Gender | string;
  date_of_birthday: string;
  phone_number:     string;
  address:          string;
  city:             string;
  department:       string;
  department_code:  string | number | readonly string[] | undefined;

  email:            string | null;
  id_number?:       string | null;
  id_type?:         string | null;
  id_expiry_date?:  string | null;
  id_description?:  string | null;
  income_source?:   string | null;
  monthly_income?:  number | null;

  // Champs compte — READ ONLY ici, gérés via POST /accounts/
  account_type?:   string | null;
  devise?:         string | null;
  initial_balance?: number | null;
  total_amount?:   number | null;

  beneficiary_name?:     string | null;
  beneficiary_relation?: string | null;
  beneficiary_phone?:    string | null;

  created_at?:   string | null;
  updated_at?:   string | null;
  photo_profil?: string | null;
  date_of_birth?: string; // legacy

  accounts?: Array<{
    id:              string;
    account_number:  string;
    account_type:    "savings" | "checking" | "investment" | "loan" | string;
    balance?:        number | string;
    account_status?: boolean;
  }>;
  signature: string;
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const DepartmentCodeZ = z.enum(
  HAITI_DEPARTMENTS.map((d) => d.code) as [DepartmentCode, ...DepartmentCode[]]
);
const GenderZ  = z.enum(["M", "F"]);
const DateYMDZ = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date au format YYYY-MM-DD");
const PhoneZ   = z.string().regex(/^\d+$/, "Le téléphone doit contenir uniquement des chiffres");
const PhotoZ   = z.union([z.instanceof(File), z.string()]).optional().nullable();

export const memberUiSchema = z
  .object({
    // ── Identité ──
    first_name:       z.string().min(1, "Prénom est requis"),
    last_name:        z.string().min(1, "Nom est requis"),
    gender:           GenderZ,
    date_of_birthday: DateYMDZ,
    id_type:          z.enum(["cin", "passeport", "permis", "autre"], {
                        required_error: "Type de pièce requis",
                      }),
    id_number:        z.string().min(1, "Numéro de pièce est requis"),
    id_expiry_date:   DateYMDZ.optional(),  // requis si passeport | permis
    id_description:   z.string().optional(), // requis si autre
    photo_profil:     PhotoZ,
    remove_photo:     z.boolean().optional(),

    // ── Contact & Localisation ──
    phone_number:    PhoneZ,
    email:           z.string().email("Email invalide").optional().or(z.literal("")).optional(),
    department_code: DepartmentCodeZ,
    city:            z.string().min(1, "Ville est requise"),
    address:         z.string().min(1, "Adresse est requise"),

    // ── Situation financière ──
    income_source:  z.enum(
      ["salarie", "commercant", "agriculteur", "diaspora", "retraite", "autre"],
      { required_error: "Source de revenus requise" }
    ),
    monthly_income: z.number().nonnegative().optional(),

    // ── Consentement & Signature ──
    signature: z.string().min(1, "La signature est requise"),
    consent:   z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter le traitement de vos données" }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.id_type === "passeport" || data.id_type === "permis") {
      if (!data.id_expiry_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["id_expiry_date"],
          message: "La date d'expiration est requise pour ce type de pièce",
        });
      }
    }
    if (data.id_type === "autre") {
      if (!data.id_description || data.id_description.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["id_description"],
          message: "Veuillez préciser le type de pièce",
        });
      }
    }
  });

export type MemberUiForm   = z.infer<typeof memberUiSchema>;
export type FieldErrors<T> = Partial<Record<Extract<keyof T, string>, string>>;

// ─── API Payload — POST /members/ uniquement ──────────────────────────────────
// account_type, devise, initial_balance, beneficiary_* → POST /accounts/

export type MemberApiPayload = {
  first_name:       string;
  last_name:        string;
  gender:           Gender;
  date_of_birthday: string;
  id_type:          string;
  id_number:        string;
  id_expiry_date?:  string;
  id_description?:  string;
  phone_number:     string;
  email?:           string;
  department:       string;
  city:             string;
  address:          string;
  income_source:    string;
  monthly_income?:  number;
};

// ─── Error helpers ────────────────────────────────────────────────────────────

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

export function validateMemberUi(
  raw: unknown
): { data?: MemberUiForm; errors?: FieldErrors<MemberUiForm> } {
  const parsed = memberUiSchema.safeParse(raw);
  if (!parsed.success) return { errors: zodToFieldErrors<MemberUiForm>(parsed.error) };
  return { data: parsed.data };
}

// ─── Converters ───────────────────────────────────────────────────────────────

export function nameToCode(name?: string | null): DepartmentCode {
  if (!name) return HAITI_DEPARTMENTS[0].code as DepartmentCode;
  const n = name.trim().toLowerCase();
  const found = HAITI_DEPARTMENTS.find((d) => d.name.toLowerCase() === n);
  return (found?.code ?? HAITI_DEPARTMENTS[0].code) as DepartmentCode;
}

export function toMemberApiPayload(ui: MemberUiForm): MemberApiPayload {
  return {
    first_name:       ui.first_name.trim(),
    last_name:        ui.last_name.trim(),
    gender:           ui.gender,
    date_of_birthday: ui.date_of_birthday,
    id_type:          ui.id_type,
    id_number:        ui.id_number.trim(),
    id_expiry_date:   ui.id_expiry_date || undefined,
    id_description:   ui.id_description || undefined,
    phone_number:     ui.phone_number.trim(),
    email:            ui.email          || undefined,
    department:       codeToName(ui.department_code),
    city:             ui.city.trim(),
    address:          ui.address.trim(),
    income_source:    ui.income_source,
    monthly_income:   ui.monthly_income,
  };
}

export function toMemberApiFormData(
  ui: MemberUiForm,
  opts?: { includePhoto?: boolean }
): FormData {
  const payload = toMemberApiPayload(ui);
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (opts?.includePhoto && ui.photo_profil instanceof File) {
    fd.append("photo_profil", ui.photo_profil);
  }
  return fd;
}

export function memberDataToUi(member: MemberData): MemberUiForm {
  const dob = member.date_of_birthday ?? member.date_of_birth ?? "";
  return {
    first_name:       member.first_name      ?? "",
    last_name:        member.last_name       ?? "",
    gender:           (member.gender === "M" || member.gender === "F" ? member.gender : "F") as Gender,
    date_of_birthday: dob,
    id_type:          (member.id_type as any) ?? "cin",
    id_number:        member.id_number        ?? "",
    id_expiry_date:   member.id_expiry_date   ?? undefined,
    id_description:   member.id_description   ?? undefined,
    phone_number:     (member.phone_number    ?? "").replace(/\D/g, ""),
    email:            member.email            ?? "",
    department_code:  nameToCode(member.department),
    city:             member.city             ?? "",
    address:          member.address          ?? "",
    income_source:    (member.income_source as any) ?? "autre",
    monthly_income:   member.monthly_income   ?? undefined,
    photo_profil:     member.photo_profil     ?? null,
    remove_photo:     false,
    signature:        member.signature        ?? "",
    consent:          true,
  };
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const formatMoney = (v?: number | null) =>
  typeof v === "number"
    ? v.toLocaleString("fr-FR", { style: "currency", currency: "HTG" })
    : "—";

export const accountTypeLabel = (t?: string) => {
  const map: Record<string, string> = {
    savings:    "Épargne",
    checking:   "Courant",
    investment: "Investissement",
    loan:       "Prêt",
  };
  return map[t ?? ""] ?? t ?? "Compte";
};

export const idTypeLabel = (t?: string) => {
  const map: Record<string, string> = {
    cin:       "Carte d'identité nationale",
    passeport: "Passeport",
    permis:    "Permis de conduire",
    autre:     "Autre",
  };
  return map[t ?? ""] ?? t ?? "—";
};

export const incomeSourceLabel = (s?: string) => {
  const map: Record<string, string> = {
    salarie:     "Salarié(e)",
    commercant:  "Commerçant(e)",
    agriculteur: "Agriculteur(trice)",
    diaspora:    "Diaspora / Transfert",
    retraite:    "Retraité(e)",
    autre:       "Autre",
  };
  return map[s ?? ""] ?? s ?? "—";
};

export const relationLabel = (r?: string) => {
  const map: Record<string, string> = {
    conjoint:    "Conjoint(e)",
    enfant:      "Enfant",
    parent:      "Parent",
    frere_soeur: "Frère / Sœur",
    autre:       "Autre",
  };
  return map[r ?? ""] ?? r ?? "—";
};

export function formatGender(gender?: string) {
  switch (gender?.toLowerCase()) {
    case "m": return "Homme";
    case "f": return "Femme";
    default:  return "Non spécifié";
  }
}

export function getMemberInitials(m: { first_name?: string; last_name?: string }) {
  return `${m.first_name?.[0]?.toUpperCase() ?? ""}${m.last_name?.[0]?.toUpperCase() ?? ""}`;
}

export function formatMemberName(m: Pick<MemberData, "first_name" | "last_name">) {
  return `${m.first_name} ${m.last_name}`.trim();
}

export function isCityInDepartment(city: string, departmentCode: DepartmentCode) {
  return (getCitiesByDepartment(departmentCode) ?? []).some(
    (c) => c.toLowerCase() === city.trim().toLowerCase()
  );
}

export function normalizeMemberStatus(
  raw: string | undefined
): "actif" | "inactif" | "suspendu" | string {
  switch ((raw ?? "").toLowerCase().trim()) {
    case "actif":
    case "active":
      return "actif";
    case "inactif":
    case "inactive":
      return "inactif";
    case "suspendu":
    case "suspended":
    case "archive":
    case "archived":
      return "suspendu";
    default:
      return (raw ?? "").toLowerCase().trim();
  }
}

export function getMemberStatus(member: { statutMember?: string }) {
  return member.statutMember || "active";
}

export type ErrorMessages<T> = {
  [K in keyof T]?: T[K] extends object ? ErrorMessages<T[K]> | string : string;
} & { first_name?: string; last_name?: string; department_code?: string };