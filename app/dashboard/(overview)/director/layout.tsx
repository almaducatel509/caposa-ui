import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord - Direction Générale',
  description: 'Vue stratégique, indicateurs de performance et gouvernance CAPOSA',
};

export default function DirectorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
