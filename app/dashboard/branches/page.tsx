// app/branches/page.tsx  ← Server Component (pas de "use client")
import type { Metadata } from 'next';
import BranchesGrid from '@/app/components/branches/branchesGrid';

export const metadata: Metadata = {
  title: 'Succursales | Caposa',
};

export default function BranchPage() {
  return <BranchesGrid />;
}