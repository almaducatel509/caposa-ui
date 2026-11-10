import type { Metadata } from "next";
import HolidayCalendar from "@/app/components/holidays/HolidayCalendar";

export const metadata: Metadata = {
  title: "Calendrier & Jours Fériés",
  description: "Gestion du calendrier et assignation des jours fériés aux succursales",
};

export default function HolidaysDashboard() {
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 print:bg-white print:p-0 print:m-0">
      <HolidayCalendar />
    </div>
  );
}