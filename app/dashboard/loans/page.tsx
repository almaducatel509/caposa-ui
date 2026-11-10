import type { Metadata } from "next";
import LoansTable from "@/app/components/loans/LoansTable";

export const metadata: Metadata = {
  title: "Gestion des Prêts",
  description: "Demandes, décaissements, remboursements et suivi des prêts",
};

export default function LoanListPage() {
  return <LoansTable />;
}