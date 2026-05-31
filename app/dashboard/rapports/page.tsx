import RapportsClient from "@/app/components/rapport/rapportsclient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rapports | CAPOSA",
  description: "Historique des rapports officiels générés",
};

export default function RapportsPage() {
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20">
      <RapportsClient />
    </div>
  );
}