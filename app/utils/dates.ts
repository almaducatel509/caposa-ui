import { appConfig } from "@/config/appConfig";

/** Affiche un timestamp ISO UTC selon le fuseau de l'app */
export function formatDateTimeForUI(isoUTC: string) {
  const d = new Date(isoUTC); // "2025-09-01T13:45:00Z"
  return new Intl.DateTimeFormat(appConfig.dateFormat, {
    timeZone: appConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Affiche une date simple 'YYYY-MM-DD' (ne pas convertir en Date) */
export function formatDateOnlyForUI(yyyyMmDd: string) {
  return yyyyMmDd; // tu peux styliser si tu veux, mais évite new Date(...)
}

/** “Aujourd’hui” au format 'YYYY-MM-DD' dans le fuseau choisi (pour defaultValue) */
export function todayYMDInTZ() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: appConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(now); // ex "2025-09-01"
}
