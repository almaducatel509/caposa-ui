import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord - Supervision',
  description: 'Supervision des opérations de caisse et validation des écarts',
};

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
