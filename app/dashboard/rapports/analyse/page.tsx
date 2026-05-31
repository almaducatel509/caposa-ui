import Analyse from "@/app/components/rapport/analyse/Analyse";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyse | CAPOSA",
  description: "Analyse temporaire générée à la volée",
};

export default function AnalysePage() {
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 print:bg-white print:p-0 print:m-0">
      <Analyse />
    </div>
  );
}