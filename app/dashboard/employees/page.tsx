import type { Metadata } from 'next';
import EmployeeGrid from '@/app/components/employees/EmployeeGrid';

export const metadata: Metadata = {
  title: 'Gestion des Employés',
  description: 'Consultez et gérez les employés et le personnel de la coopérative',
};

export default function EmployeePage() {
  return <EmployeeGrid />;
}