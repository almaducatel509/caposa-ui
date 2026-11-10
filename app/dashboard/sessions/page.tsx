import type { Metadata } from 'next';
import SessionsComponent from '@/app/components/sessions/Session';

export const metadata: Metadata = {
  title: "Sessions de Caisse",
  description: "Tout les sessions de caisse enregistrées dans le système",
};

export default function SessionsPage() {
  return <SessionsComponent />;
}