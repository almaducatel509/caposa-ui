import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Paramètres & Sauvegardes",
  description: "Gestion des sauvegardes de la base de données et configuration",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
