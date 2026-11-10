import type { Metadata } from 'next';
import CashHandoverHistory from '@/app/components/treasury/encaisse/CashHandoverHistory';

export const metadata: Metadata = {
  title: "Encaisse & Remises d'Espèces",
  description: "Suivi des remises de caisse et réconciliations d'encaisse",
};

export default function CashPage() {
  return <CashHandoverHistory />;
}
