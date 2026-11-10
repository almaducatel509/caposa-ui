// ============================================
// 📁 app/accounts/page.tsx
// ============================================
'use client';
import AccountGrid from '@/app/components/accounts/AccountGrid';

export default function Accounts() {
  return (
    <main className="w-full min-h-screen bg-transparent">
      <div>
        <AccountGrid />
      </div>
    </main>
  );
}
