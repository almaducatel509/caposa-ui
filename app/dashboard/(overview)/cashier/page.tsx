import DashboardCaissier from '@/app/components/dashboard/caissier/dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Dashboard Caissier | CAPOSA',
  description: 'Gestion de la caisse — sessions, transactions et réconciliation',
};

export default function CashierPage() {
  return <DashboardCaissier />;
}