// app/branches/page.tsx  ← Server Component (pas de "use client")
import type { Metadata } from 'next';
import BranchesGrid from '@/app/components/branches/branchesGrid';

export const metadata: Metadata = {
  title: 'Gestion des Succursales',
  description: 'Consultez et gérez les succursales et points de service',
};

export default function BranchPage() {
  return <BranchesGrid />;
}