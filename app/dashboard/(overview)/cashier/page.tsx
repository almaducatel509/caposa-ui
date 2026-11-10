import DashboardCaissier from '@/app/components/dashboard/dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord - Caisse',
  description: 'Gestion de la caisse — sessions, transactions et réconciliation',
};

export default function CashierPage() {
  return <DashboardCaissier />;
}
