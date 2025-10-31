
export const appConfig = {
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE || 'America/Port-au-Prince',
    dateFormat: 'fr-FR',
    defaultDate: '2024-01-01'
  };
  
  export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(appConfig.dateFormat, {
    timeZone: appConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
