import type { Metadata } from 'next';
import MemberGrid from '@/app/components/members/MemberGrid';

export const metadata: Metadata = {
  title: 'Gestion des Membres',
  description: 'Consultez et gérez tous les membres de la coopérative',
};

export default function Members() {
  return <MemberGrid />;
}