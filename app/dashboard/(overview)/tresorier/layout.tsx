import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord - Trésorerie Centrale',
  description: 'Gestion centralisée de la trésorerie et supervision des coffres',
};

export default function TresorierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
