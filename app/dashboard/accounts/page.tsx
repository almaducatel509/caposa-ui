import type { Metadata } from 'next';
import AccountGrid from '@/app/components/accounts/AccountGrid';

export const metadata: Metadata = {
  title: 'Gestion des Comptes',
  description: 'Consultez et gérez tous les comptes bancaires des membres',
};

export default function Accounts() {
  return (
    <main className="w-full min-h-screen bg-transparent">
      <div>
        <AccountGrid />
      </div>
    </main>
  );
}
