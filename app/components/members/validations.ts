// app/components/members/member.schema.ts
// ============================================
// MEMBER — Types, Zod Schema, Converters & Utils 
// ============================================
// app/components/members/validations.ts
import { z } from "zod";
import {
  getCitiesByDepartment,
  codeToName,
  HAITI_DEPARTMENTS,
  type DepartmentCode,
} from "@/app/data/haitiLocations";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Gender = "M" | "F";

export interface MemberData {
  member_number: string;
  account_number: string;
  member_details: any;
  typeCompte: string;
  soldeActuel: number;
  statutCompte: any;
  statutMember: any;
  dateOuverture: string;
  status: 'actif' | 'inactif' | 'suspendu';
  id:              string;
  id_member:       string;
  first_name:      string;
  last_name:       string;
  gender:          Gender | string;
  date_of_birthday:string;
  phone_number:    string;
  address:         string;
  city:            string;
  department:      string;
  department_code: string | number | readonly string[] | undefined;

  email:          string | null;
  id_number?:      string | null;
  id_type?:        string | null;
  income_source?:  string | null;
  monthly_income?: number | null;
  account_type?:   string | null;
  devise?:         string | null;

  beneficiary_name?:     string | null;
  beneficiary_relation?: string | null;
  beneficiary_phone?:    string | null;

  created_at?:     string | null;
  updated_at?:     string | null;
  initial_balance?: number | null;
  total_amount?:   number | null;
  photo_profil?:   string | null;
  date_of_birth?:  string; // legacy

  accounts?: Array<{
    id:             string;
    account_number: string;
    account_type:   "savings" | "checking" | "investment" | "loan" | string;
    balance?:       number | string;
    account_status?: boolean;
  }>;
}

export interface BranchDetails {
  id_branch:    string;
  branch_name:  string;
  branch_code?: string;
}

export interface PostDetails {
  id_post:   string;
  name:      string;
  post_name?: string;
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const DepartmentCodeZ = z.enum(
  HAITI_DEPARTMENTS.map((d) => d.code) as [DepartmentCode, ...DepartmentCode[]]
);
const GenderZ    = z.enum(["M", "F"]);
const DateYMDZ   = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date au format YYYY-MM-DD");
const PhoneZ     = z.string().regex(/^\d+$/, "Le téléphone doit contenir uniquement des chiffres");
const PhotoZ     = z.union([z.instanceof(File), z.string()]).optional().nullable();

export const memberUiSchema = z.object({

  // ── Identité ──
  first_name:       z.string().min(1, "Prénom est requis"),
  last_name:        z.string().min(1, "Nom est requis"),
  gender:           GenderZ,
  date_of_birthday: DateYMDZ,
  id_type:          z.enum(["cin", "passeport", "permis", "autre"], {
                      required_error: "Type de pièce requis",
                    }),
  id_number:        z.string().min(1, "Numéro de pièce est requis"),
  photo_profil:     PhotoZ,

  // ── Contact & Localisation ──
  phone_number:     PhoneZ,
  email:            z.string().email("Email invalide").optional().or(z.literal("")).optional(),
  department_code:  DepartmentCodeZ,
  city:             z.string().min(1, "Ville est requise"),
  address:          z.string().min(1, "Adresse est requise"),

  // ── Situation financière ──
  income_source:    z.enum(["salarie", "commercant", "agriculteur", "diaspora", "retraite", "autre"], {
                      required_error: "Source de revenus requise",
                    }),
  monthly_income:   z.number().nonnegative().optional(),

  // ── Compte à ouvrir ──
  account_type:     z.enum(["savings", "checking"], {
                      required_error: "Type de compte requis",
                    }),
  devise:           z.enum(["HTG", "USD"]),
  initial_balance:  z.number().nonnegative("Le solde initial ne peut pas être négatif").optional(),

  // ── Bénéficiaire désigné ──
  beneficiary_name:     z.string().optional(),
  beneficiary_relation: z.enum(["conjoint", "enfant", "parent", "frere_soeur", "autre"]).optional(),
  beneficiary_phone:    z.string().regex(/^\d*$/, "Téléphone invalide").optional(),

  // ── Consentement légal ──
  consent: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter le traitement de vos données" }),
  }),
});

export type MemberUiForm   = z.infer<typeof memberUiSchema>;
export type FieldErrors<T> = Partial<Record<Extract<keyof T, string>, string>>;

export type MemberApiPayload = {
  first_name:       string;
  last_name:        string;
  id_number:        string;
  id_type:          string;
  phone_number:     string;
  department:       string;
  city:             string;
  address:          string;
  gender:           Gender;
  date_of_birthday: string;
  email?:           string;
  income_source:    string;
  monthly_income?:  number;
  account_type:     string;
  devise:           string;
  initial_balance?: number;
  beneficiary_name?:     string;
  beneficiary_relation?: string;
  beneficiary_phone?:    string;
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
    id_number:        ui.id_number.trim(),
    id_type:          ui.id_type,
    phone_number:     ui.phone_number.trim(),
    department:       codeToName(ui.department_code),
    city:             ui.city.trim(),
    address:          ui.address.trim(),
    gender:           ui.gender,
    date_of_birthday: ui.date_of_birthday,
    email:            ui.email || undefined,
    income_source:    ui.income_source,
    monthly_income:   ui.monthly_income,
    account_type:     ui.account_type,
    devise:           ui.devise,
    initial_balance:  ui.initial_balance,
    beneficiary_name:     ui.beneficiary_name     || undefined,
    beneficiary_relation: ui.beneficiary_relation || undefined,
    beneficiary_phone:    ui.beneficiary_phone    || undefined,
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
    first_name:       member.first_name ?? "",
    last_name:        member.last_name ?? "",
    id_number:        member.id_number ?? "",
    id_type:          (member.id_type as any) ?? "autre",
    phone_number:     (member.phone_number ?? "").replace(/\D/g, ""),
    department_code:  nameToCode(member.department),
    city:             member.city ?? "",
    address:          member.address ?? "",
    gender:           (member.gender === "M" || member.gender === "F" ? member.gender : "F") as Gender,
    date_of_birthday: dob,
    email:            member.email ?? "",
    initial_balance:  member.initial_balance ?? undefined,
    photo_profil:     member.photo_profil ?? null,
    income_source:    (member.income_source as any) ?? "autre",
    monthly_income:   member.monthly_income ?? undefined,
    account_type:     (member.account_type as any) ?? "savings",
    devise:           (member.devise as any) ?? "HTG",
    beneficiary_name:     member.beneficiary_name     ?? "",
    beneficiary_relation: (member.beneficiary_relation as any) ?? "autre",
    beneficiary_phone:    member.beneficiary_phone    ?? "",
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
    salarie:    "Salarié(e)",
    commercant: "Commerçant(e)",
    agriculteur:"Agriculteur(trice)",
    diaspora:   "Diaspora / Transfert",
    retraite:   "Retraité(e)",
    autre:      "Autre",
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
  return (getCitiesByDepartment(departmentCode) ?? [])
    .some((c) => c.toLowerCase() === city.trim().toLowerCase());
}
// ← AJOUTER cette fonction
export function normalizeMemberStatus(raw: string | undefined): 'actif' | 'inactif' | 'suspendu' | string {
  switch ((raw ?? '').toLowerCase().trim()) {
    case 'actif':
    case 'active':
      return 'actif';
    case 'inactif':
    case 'inactive':
      return 'inactif';
    case 'suspendu':
    case 'suspended':
    case 'archive':
    case 'archived':
      return 'suspendu';
    default:
      return (raw ?? '').toLowerCase().trim();
  }
}

export function getMemberStatus(member: { statutMember?: string }) {
  return member.statutMember || 'active';
}

export type ErrorMessages<T> = {
  [K in keyof T]?: T[K] extends object ? ErrorMessages<T[K]> | string : string;
} & { first_name?: string; last_name?: string; department_code?: string };

