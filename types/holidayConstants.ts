
// ================= CONSTANTES =================
export const HOLIDAY_TYPES = [
  { value: "ferie", label: "Férié", icon: "🎉" },
  { value: "local", label: "Local", icon: "🏘️" },
  { value: "interne", label: "Interne", icon: "🏢" },
  { value: "election", label: "Élection", icon: "🗳️" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "autre", label: "Autre", icon: "📌" },
] as const;

export const HOLIDAY_SCOPES = [
  { value: "national", label: "National", icon: "🇭🇹" },
  { value: "regional", label: "Régional", icon: "🗺️" },
  { value: "branch", label: "Succursale", icon: "🏦" },
  { value: "autre", label: "Autre", icon: "📍" },
] as const;
