'use client';
import PageHeader from '@/app/components/header';
import CashHandoverHistory from '@/app/components/treasury/Encaisse/CashHandoverHistory';
import { FaCashRegister } from "react-icons/fa";

export default function TransactionsPage() {
  return (
    <div className="min-h-screen ">
        <div>
             <PageHeader
              title="Rapports Réglementaires"
              subtitle="Rapports obligatoires pour la conformité BRH"
              icon={<FaCashRegister className="text-4xl text-gray-70" />}
            />
        </div>
        <div className="min-h-screen bg-gray-50">
            <CashHandoverHistory />
        </div> 
    </div>
  );
}