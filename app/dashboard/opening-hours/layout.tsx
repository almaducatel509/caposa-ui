import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Horaires d'Ouverture",
  description: "Configuration et consultation des horaires des succursales",
};

export default function OpeningHoursLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
