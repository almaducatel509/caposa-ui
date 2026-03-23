import { BranchData, DepartmentCode, OpeningHrs } from "./validations";

// ─── Days of the week ──────────────────────────────────────────────────────────
export const DAYS = [
  { key: "monday",    label: "Lundi" },
  { key: "tuesday",   label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday",  label: "Jeudi" },
  { key: "friday",    label: "Vendredi" },
  { key: "saturday",  label: "Samedi" },
  { key: "sunday",    label: "Dimanche" },
] as const;

// ─── Haiti departments ─────────────────────────────────────────────────────────
export const HAITI_DEPARTMENTS: { code: DepartmentCode; name: string }[] = [
  { code: "OUEST",      name: "Ouest" },
  { code: "NORD",       name: "Nord" },
  { code: "SUD",        name: "Sud" },
  { code: "ARTIBONITE", name: "Artibonite" },
  { code: "CENTRE",     name: "Centre" },
  { code: "GRAND_ANSE", name: "Grand'Anse" },
  { code: "NIPPES",     name: "Nippes" },
  { code: "NORDEST",    name: "Nord-Est" },
  { code: "NORD_OUEST", name: "Nord-Ouest" },
  { code: "SUDEST",     name: "Sud-Est" },
];

// ─── Cities by department ──────────────────────────────────────────────────────
export const getCitiesByDepartment = (code: DepartmentCode): string[] =>
  ({
    OUEST:      ["Port-au-Prince", "Pétion-Ville", "Carrefour", "Delmas"],
    NORD:       ["Cap-Haïtien", "Quartier-Morin", "Limonade"],
    SUD:        ["Les Cayes", "Port-Salut", "Aquin"],
    ARTIBONITE: ["Gonaïves", "Saint-Marc", "Dessalines"],
    CENTRE:     ["Hinche", "Mirebalais", "Lascahobas"],
    GRAND_ANSE: ["Jérémie", "Dame-Marie", "Corail"],
    NIPPES:     ["Miragoâne", "Petit-Goâve", "Anse-à-Veau"],
    NORDEST:    ["Fort-Liberté", "Trou-du-Nord", "Ouanaminthe"],
    NORD_OUEST: ["Port-de-Paix", "Saint-Louis-du-Nord"],
    SUDEST:     ["Jacmel", "Marigot", "Cayes-Jacmel"],
  }[code] ?? []);

// ─── Branches ─────────────────────────────────────────────────────────────────
// Source unique pour BranchScheduleManager ET HolidayCalendar.
// 🔌 Remplacer par : const branches = await fetchBranches()
export const MOCK_BRANCHES: BranchData[] = [
  {
    id: "1",
    branch_code: "PAP001",
    branch_name: "Port-au-Prince Centre",
    branch_address: "123 Rue Pavée, Port-au-Prince",
    branch_phone_number: "(509) 2222-1234",
    branch_email: "pap.centre@caposa.ht",
    status: "active",
    department_code: "OUEST",
    city: "Port-au-Prince",
    opening_hour: "sch1",
    opening_hour_details: {
      id: "sch1",
      monday: "08:00-17:00", tuesday: "08:00-17:00", wednesday: "08:00-17:00",
      thursday: "08:00-17:00", friday: "08:00-16:00",
      saturday: "09:00-13:00", sunday: null,
    },
  },
  {
    id: "2",
    branch_code: "CAP001",
    branch_name: "Cap-Haïtien Nord",
    branch_address: "45 Boulevard du Cap, Cap-Haïtien",
    branch_phone_number: "(509) 2262-5678",
    branch_email: "cap.nord@caposa.ht",
    status: "active",
    department_code: "NORD",
    city: "Cap-Haïtien",
  },
  {
    id: "3",
    branch_code: "PET001",
    branch_name: "Pétion-Ville Plaza",
    branch_address: "12 Place Boyer, Pétion-Ville",
    branch_phone_number: "(509) 2257-9999",
    branch_email: "petion.plaza@caposa.ht",
    status: "inactive",
    department_code: "OUEST",
    city: "Pétion-Ville",
  },
  {
    id: "4",
    branch_code: "CAY001",
    branch_name: "Les Cayes Sud",
    branch_address: "12 Rue Geffrard, Les Cayes",
    branch_phone_number: "(509) 2286-1111",
    branch_email: "cayes.sud@caposa.ht",
    status: "active",
    department_code: "SUD",
    city: "Les Cayes",
  },
  {
    id: "5",
    branch_code: "GON001",
    branch_name: "Gonaïves Artibonite",
    branch_address: "8 Avenue Christophe, Gonaïves",
    branch_phone_number: "(509) 2274-2222",
    branch_email: "gonaives@caposa.ht",
    status: "active",
    department_code: "ARTIBONITE",
    city: "Gonaïves",
  },
];

// ─── Holidays ─────────────────────────────────────────────────────────────────
// Source unique pour HolidayCalendar.
// 🔌 Remplacer par : const holidays = await fetchHolidays()
export type HolidayType = "ferie" | "local" | "interne" | "election" | "maintenance" | "autre";
export type HolidayScope = "national" | "regional" | "branch" | "autre";

export interface Holiday {
  id: string;
  date: string;           // ISO "YYYY-MM-DD"
  description: string;
  type: HolidayType;
  scope: HolidayScope;
  branch_code?: string;   // référence MOCK_BRANCHES[].branch_code
  comment?: string;
  modified_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const MOCK_HOLIDAYS: Holiday[] = [
  {
    id: "1",
    date: "2025-01-01",
    description: "Jour de l'An",
    type: "ferie",
    scope: "national",
    comment: "Férié bancaire national",
    modified_by: "Admin Système",
    created_at: "2024-12-01T00:00:00Z",
    updated_at: "2024-12-01T00:00:00Z",
  },
  {
    id: "2",
    date: "2025-01-07",
    description: "Carnaval Local",
    type: "local",
    scope: "branch",
    branch_code: "CAP001",
    comment: "Événement culturel régional",
    modified_by: "Jean Pierre",
    created_at: "2024-12-05T00:00:00Z",
    updated_at: "2024-12-05T00:00:00Z",
  },
  {
    id: "3",
    date: "2025-01-15",
    description: "Réunion CA",
    type: "interne",
    scope: "national",
    comment: "Conseil d'administration trimestriel",
    modified_by: "Marie Dupont",
    created_at: "2024-12-10T00:00:00Z",
    updated_at: "2024-12-10T00:00:00Z",
  },
  {
    id: "4",
    date: "2025-01-07",
    description: "Maintenance Serveurs",
    type: "maintenance",
    scope: "national",
    comment: "Mise à jour infrastructure",
    modified_by: "IT Team",
    created_at: "2024-12-15T00:00:00Z",
    updated_at: "2024-12-15T00:00:00Z",
  },
  {
    id: "5",
    date: "2025-01-20",
    description: "Élections Locales",
    type: "election",
    scope: "regional",
    branch_code: "CAY001",
    created_at: "2024-12-20T00:00:00Z",
    updated_at: "2024-12-20T00:00:00Z",
  },
];

// ─── Opening hours ─────────────────────────────────────────────────────────────
// Source unique pour OpeningHoursPage (stats).
// 🔌 Remplacer par : const hours = await fetchOpeningHours()
export const MOCK_OPENING_HOURS: OpeningHrs[] = [
  {
    id: "oh1",
    monday: "08:00-17:00", tuesday: "08:00-17:00", wednesday: "08:00-17:00",
    thursday: "08:00-17:00", friday: "08:00-16:00",
    saturday: "09:00-13:00", sunday: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: "active",
  },
  {
    id: "oh2",
    monday: "08:00-17:00", tuesday: "08:00-17:00", wednesday: "08:00-17:00",
    thursday: "08:00-17:00", friday: "08:00-17:00",
    saturday: null, sunday: null,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
    status: "active",
  },
  {
    id: "oh3",
    monday: "08:00-17:00", tuesday: "08:00-17:00", wednesday: "08:00-17:00",
    thursday: "08:00-17:00", friday: "08:00-17:00",
    saturday: null, sunday: null,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    status: "paused",
  },
];